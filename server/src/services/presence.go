package services

import (
	"context"
	"encoding/json"
	"log/slog"
	"sync"
	"time"

	redisclient "github.com/skygenesisenterprise/aether-meet/server/internal/redis"
	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

type PresenceRecord struct {
	UserID      string    `json:"userId"`
	WorkspaceID string    `json:"workspaceId"`
	State       string    `json:"state"`
	LastSeenAt  time.Time `json:"lastSeenAt"`
	DeviceCount int       `json:"deviceCount"`
}

type PresenceService struct {
	logger  *slog.Logger
	redis   *redisclient.Client
	bus     interfaces.EventBus
	ttl     time.Duration
	records map[string]PresenceRecord
	mu      sync.RWMutex
	stop    chan struct{}
}

func NewPresenceService(logger *slog.Logger, redis *redisclient.Client, bus interfaces.EventBus, ttl time.Duration) *PresenceService {
	svc := &PresenceService{
		logger: logger, redis: redis, bus: bus, ttl: ttl,
		records: map[string]PresenceRecord{},
		stop:    make(chan struct{}),
	}
	go svc.cleanupLoop()
	return svc
}

func (s *PresenceService) Close() error {
	close(s.stop)
	return nil
}

func (s *PresenceService) Set(ctx context.Context, workspaceID, userID, state string, deviceCount int) error {
	record := PresenceRecord{
		UserID: userID, WorkspaceID: workspaceID, State: state, LastSeenAt: time.Now().UTC(), DeviceCount: deviceCount,
	}
	key := workspaceID + ":" + userID
	if s.redis != nil && s.redis.Raw != nil {
		payload, _ := json.Marshal(record)
		if err := s.redis.Raw.Set(ctx, s.presenceKey(key), payload, s.ttl).Err(); err != nil {
			return err
		}
	} else {
		s.mu.Lock()
		s.records[key] = record
		s.mu.Unlock()
	}
	return s.bus.Publish(ctx, interfaces.Event{
		ID:          utils.NewID(),
		Topic:       "workspace." + workspaceID,
		Type:        "presence.updated",
		WorkspaceID: workspaceID,
		ActorID:     userID,
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Payload:     map[string]any{"state": state, "deviceCount": deviceCount},
	})
}

func (s *PresenceService) Get(ctx context.Context, workspaceID, userID string) (PresenceRecord, bool) {
	key := workspaceID + ":" + userID
	if s.redis != nil && s.redis.Raw != nil {
		raw, err := s.redis.Raw.Get(ctx, s.presenceKey(key)).Result()
		if err != nil {
			return PresenceRecord{}, false
		}
		var record PresenceRecord
		if err := json.Unmarshal([]byte(raw), &record); err != nil {
			return PresenceRecord{}, false
		}
		return record, true
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	record, ok := s.records[key]
	if !ok {
		return PresenceRecord{}, false
	}
	if time.Since(record.LastSeenAt) > s.ttl {
		delete(s.records, key)
		return PresenceRecord{}, false
	}
	return record, true
}

func (s *PresenceService) presenceKey(key string) string {
	if s.redis != nil && s.redis.Keys != nil {
		return s.redis.Keys.Cache("presence", key)
	}
	return "presence:" + key
}

func (s *PresenceService) cleanupLoop() {
	ticker := time.NewTicker(s.ttl / 2)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.mu.Lock()
			for key, record := range s.records {
				if time.Since(record.LastSeenAt) > s.ttl {
					delete(s.records, key)
				}
			}
			s.mu.Unlock()
		case <-s.stop:
			return
		}
	}
}
