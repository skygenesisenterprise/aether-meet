package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	redisclient "github.com/skygenesisenterprise/aether-meet/server/internal/redis"
	"github.com/skygenesisenterprise/aether-meet/server/src/config"
	"github.com/skygenesisenterprise/aether-meet/server/src/middleware"
	"github.com/skygenesisenterprise/aether-meet/server/src/routes"
	"github.com/skygenesisenterprise/aether-meet/server/src/services"
)

func connectDatabase(ctx context.Context, logger *slog.Logger, cfg config.Config) (*services.DatabaseService, error) {
	db, err := services.NewDatabaseService(cfg.Database.URL)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	if err := db.Ping(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	logger.Info(
		"database connected",
		"service", "database",
		"host", cfg.Database.Host,
		"port", cfg.Database.Port,
		"name", cfg.Database.Name,
	)

	return db, nil
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	if cfg.App.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	db, err := connectDatabase(context.Background(), logger, cfg)
	if err != nil {
		logger.Error("database connection failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	if err := db.AutoMigrate(); err != nil {
		logger.Error("database migration failed", "error", err)
		os.Exit(1)
	}

	redis, err := redisclient.New(redisclient.Config{
		Enabled:        cfg.Redis.Enabled,
		Required:       cfg.Redis.Required,
		URL:            cfg.Redis.URL,
		Host:           cfg.Redis.Host,
		Port:           cfg.Redis.Port,
		Password:       cfg.Redis.Password,
		DB:             cfg.Redis.DB,
		KeyPrefix:      cfg.Redis.KeyPrefix,
		DefaultTTL:     cfg.Redis.DefaultTTL,
		ConnectTimeout: cfg.Redis.ConnectTimeout,
		ReadTimeout:    cfg.Redis.ReadTimeout,
		WriteTimeout:   cfg.Redis.WriteTimeout,
		MaxRetries:     cfg.Redis.MaxRetries,
	})
	if err != nil {
		logger.Error("redis initialization failed", "error", err)
		os.Exit(1)
	}
	defer func() {
		if redis != nil {
			_ = redis.Close()
		}
	}()

	repos := services.NewRepositories(db.Gorm())
	identityProvider := services.NewIdentityProvider(cfg.Auth)
	eventBus := services.NewEventBus(cfg, redis)
	defer eventBus.Close()
	presence := services.NewPresenceService(logger, redis, eventBus, cfg.Realtime.ClientTimeout)
	defer presence.Close()
	_, err = services.NewObjectStorage(cfg.Storage)
	if err != nil {
		logger.Error("storage initialization failed", "error", err)
		os.Exit(1)
	}

	userService := services.NewUserService(repos.Users())
	workspaceService := services.NewWorkspaceService(db, repos.Users(), repos, repos.AuditLogs())
	teamService := services.NewTeamService(repos.Teams(), workspaceService)
	conversationService := services.NewConversationService(repos.Conversations(), repos.ConversationMembers(), workspaceService)
	channelService := services.NewChannelService(db, repos, workspaceService, repos.Conversations())
	messageService := services.NewMessageService(db, repos, conversationService, workspaceService, eventBus)
	meetingService := services.NewMeetingService(repos.Meetings(), workspaceService, services.NewMeetingProvider(cfg.LiveKit))
	integrationService := services.NewIntegrationService(repos.Integrations(), workspaceService, eventBus)
	auditService := services.NewAuditService(repos.AuditLogs(), workspaceService)
	hub := services.NewHub(logger, cfg.Realtime, eventBus, presence, workspaceService, conversationService)
	defer hub.Close()

	mode := "server"
	if len(os.Args) > 1 {
		mode = os.Args[1]
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	switch mode {
	case "worker":
		worker := services.NewWorker(logger)
		if err := worker.Run(ctx); err != nil {
			logger.Error("worker stopped with error", "error", err)
			os.Exit(1)
		}
	case "server":
		router := gin.New()
		router.Use(middleware.RequestID(), middleware.Recovery(logger), middleware.CORS(cfg.CORS.AllowedOrigins))
		if cfg.App.AccessLogs {
			router.Use(middleware.Logging(logger))
		}
		if len(cfg.App.TrustedProxies) > 0 {
			_ = router.SetTrustedProxies(cfg.App.TrustedProxies)
		}
		routes.SetupRoutes(router, routes.Dependencies{
			Config: cfg, Logger: logger, Database: db, Redis: redis, EventBus: eventBus,
			IdentityProvider: identityProvider, Hub: hub, UserService: userService,
			WorkspaceService: workspaceService, TeamService: teamService, ChannelService: channelService,
			ConversationService: conversationService, MessageService: messageService,
			MeetingService: meetingService, IntegrationService: integrationService, AuditService: auditService,
		})
		server := &http.Server{
			Addr:    ":" + cfg.Server.Port,
			Handler: router,
		}
		go func() {
			logger.Info("server starting", "service", "http", "port", cfg.Server.Port, "mode", mode)
			if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				logger.Error("server stopped unexpectedly", "error", err)
				stop()
			}
		}()
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	default:
		logger.Error("unknown mode", "mode", mode)
		os.Exit(1)
	}
}
