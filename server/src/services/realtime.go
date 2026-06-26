package services

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	redisclient "github.com/skygenesisenterprise/aether-meet/server/internal/redis"
	"github.com/skygenesisenterprise/aether-meet/server/src/config"
	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

type InMemoryEventBus struct {
	mu       sync.RWMutex
	handlers map[string][]interfaces.EventHandler
}

func NewInMemoryEventBus() *InMemoryEventBus {
	return &InMemoryEventBus{handlers: map[string][]interfaces.EventHandler{}}
}

func (b *InMemoryEventBus) Publish(ctx context.Context, event interfaces.Event) error {
	b.mu.RLock()
	handlers := append([]interfaces.EventHandler{}, b.handlers[event.Topic]...)
	handlers = append(handlers, b.handlers["*"]...)
	b.mu.RUnlock()
	for _, handler := range handlers {
		if err := handler(ctx, event); err != nil {
			return err
		}
	}
	return nil
}

func (b *InMemoryEventBus) Subscribe(_ context.Context, topic string, handler interfaces.EventHandler) error {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.handlers[topic] = append(b.handlers[topic], handler)
	return nil
}

func (b *InMemoryEventBus) Close() error                  { return nil }
func (b *InMemoryEventBus) Healthy(context.Context) error { return nil }

type RedisEventBus struct {
	redis  *redisclient.Client
	prefix string
	pubsub sync.Map
}

func NewRedisEventBus(redis *redisclient.Client, prefix string) *RedisEventBus {
	return &RedisEventBus{redis: redis, prefix: prefix}
}

func (b *RedisEventBus) Publish(ctx context.Context, event interfaces.Event) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return b.redis.Raw.Publish(ctx, b.channel(event.Topic), payload).Err()
}

func (b *RedisEventBus) Subscribe(ctx context.Context, topic string, handler interfaces.EventHandler) error {
	pattern := b.channel(topic)
	pubsub := b.redis.Raw.PSubscribe(ctx, pattern)
	go func() {
		ch := pubsub.Channel()
		for message := range ch {
			var event interfaces.Event
			if err := json.Unmarshal([]byte(message.Payload), &event); err == nil {
				_ = handler(ctx, event)
			}
		}
	}()
	b.pubsub.Store(pattern, pubsub)
	return nil
}

func (b *RedisEventBus) Close() error {
	b.pubsub.Range(func(_, value any) bool {
		if pubsub, ok := value.(redisclientPubSubShim); ok {
			_ = pubsub.Close()
		}
		return true
	})
	return nil
}

func (b *RedisEventBus) Healthy(ctx context.Context) error {
	return b.redis.Raw.Ping(ctx).Err()
}

func (b *RedisEventBus) channel(topic string) string {
	if topic == "" || topic == "*" {
		return b.prefix + ":events:*"
	}
	return b.prefix + ":events:" + topic
}

type redisclientPubSubShim interface{ Close() error }

type Hub struct {
	logger           *slog.Logger
	upgrader         websocket.Upgrader
	clients          map[*client]struct{}
	mu               sync.RWMutex
	bus              interfaces.EventBus
	presence         *PresenceService
	workspaceService *WorkspaceService
	conversations    *ConversationService
	heartbeat        time.Duration
	timeout          time.Duration
}

type client struct {
	conn          *websocket.Conn
	send          chan []byte
	principal     interfaces.Principal
	workspaces    map[string]struct{}
	conversations map[string]struct{}
}

type RealtimeCommand struct {
	Type           string `json:"type"`
	WorkspaceID    string `json:"workspaceId,omitempty"`
	ConversationID string `json:"conversationId,omitempty"`
}

func NewEventBus(cfg config.Config, redis *redisclient.Client) interfaces.EventBus {
	if redis != nil && redis.Raw != nil {
		return NewRedisEventBus(redis, cfg.Redis.KeyPrefix)
	}
	return NewInMemoryEventBus()
}

func NewHub(logger *slog.Logger, cfg config.RealtimeConfig, bus interfaces.EventBus, presence *PresenceService, workspaces *WorkspaceService, conversations *ConversationService) *Hub {
	h := &Hub{
		logger:   logger,
		upgrader: websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }},
		clients:  map[*client]struct{}{},
		bus:      bus, presence: presence, workspaceService: workspaces, conversations: conversations,
		heartbeat: cfg.HeartbeatInterval, timeout: cfg.ClientTimeout,
	}
	_ = bus.Subscribe(context.Background(), "*", h.handleEvent)
	return h
}

func (h *Hub) Healthy(context.Context) error { return nil }

func (h *Hub) Close() error {
	h.mu.Lock()
	defer h.mu.Unlock()
	for client := range h.clients {
		_ = client.conn.Close()
		close(client.send)
	}
	return nil
}

func (h *Hub) Handle(c *gin.Context, principal interfaces.Principal) {
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	cl := &client{
		conn:          conn,
		send:          make(chan []byte, 32),
		principal:     principal,
		workspaces:    map[string]struct{}{},
		conversations: map[string]struct{}{},
	}
	if principal.WorkspaceID != "" {
		cl.workspaces[principal.WorkspaceID] = struct{}{}
		_ = h.presence.Set(c.Request.Context(), principal.WorkspaceID, principal.UserID, "online", 1)
	}
	h.mu.Lock()
	h.clients[cl] = struct{}{}
	h.mu.Unlock()

	go h.writeLoop(cl)
	h.readLoop(c.Request.Context(), cl)
}

func (h *Hub) readLoop(ctx context.Context, cl *client) {
	defer func() {
		h.mu.Lock()
		delete(h.clients, cl)
		h.mu.Unlock()
		_ = cl.conn.Close()
		if cl.principal.WorkspaceID != "" {
			_ = h.presence.Set(ctx, cl.principal.WorkspaceID, cl.principal.UserID, "offline", 0)
		}
	}()
	_ = cl.conn.SetReadDeadline(time.Now().Add(h.timeout))
	cl.conn.SetPongHandler(func(string) error {
		return cl.conn.SetReadDeadline(time.Now().Add(h.timeout))
	})
	for {
		var cmd RealtimeCommand
		if err := cl.conn.ReadJSON(&cmd); err != nil {
			return
		}
		switch strings.ToLower(cmd.Type) {
		case "subscribe":
			if cmd.WorkspaceID != "" {
				if _, err := h.workspaceService.AuthorizeWorkspace(ctx, cl.principal, cmd.WorkspaceID); err == nil {
					cl.workspaces[cmd.WorkspaceID] = struct{}{}
				}
			}
			if cmd.ConversationID != "" {
				if _, err := h.conversations.Get(ctx, cl.principal, cmd.ConversationID); err == nil {
					cl.conversations[cmd.ConversationID] = struct{}{}
				}
			}
		case "typing.started", "typing.stopped":
			if cmd.ConversationID == "" || cl.principal.WorkspaceID == "" {
				continue
			}
			_ = h.bus.Publish(ctx, interfaces.Event{
				ID:             utils.NewID(),
				Topic:          "workspace." + cl.principal.WorkspaceID,
				Type:           cmd.Type,
				WorkspaceID:    cl.principal.WorkspaceID,
				ConversationID: cmd.ConversationID,
				ActorID:        cl.principal.UserID,
				Timestamp:      time.Now().UTC().Format(time.RFC3339),
			})
		}
	}
}

func (h *Hub) writeLoop(cl *client) {
	ticker := time.NewTicker(h.heartbeat)
	defer ticker.Stop()
	for {
		select {
		case payload, ok := <-cl.send:
			if !ok {
				return
			}
			if err := cl.conn.WriteMessage(websocket.TextMessage, payload); err != nil {
				return
			}
		case <-ticker.C:
			if err := cl.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *Hub) handleEvent(_ context.Context, event interfaces.Event) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return err
	}
	h.mu.RLock()
	defer h.mu.RUnlock()
	for cl := range h.clients {
		if _, ok := cl.workspaces[event.WorkspaceID]; !ok && event.WorkspaceID != "" {
			if _, ok := cl.conversations[event.ConversationID]; !ok || event.ConversationID == "" {
				continue
			}
		}
		select {
		case cl.send <- payload:
		default:
			close(cl.send)
			delete(h.clients, cl)
		}
	}
	return nil
}
