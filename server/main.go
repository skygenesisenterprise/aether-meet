package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	redisclient "github.com/skygenesisenterprise/aether-meet/server/internal/redis"
	"github.com/skygenesisenterprise/aether-meet/server/src/config"
	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/middleware"
	"github.com/skygenesisenterprise/aether-meet/server/src/routes"
	"github.com/skygenesisenterprise/aether-meet/server/src/services"
	"gorm.io/gorm"
)

func envOrDefault(key string, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func resolveDatabaseConfig() (host string, port string, user string, name string, password string) {
	host = envOrDefault("DB_HOST", os.Getenv("POSTGRESQL__HOST"))
	if host == "" {
		host = "localhost"
	}

	port = envOrDefault("DB_PORT", os.Getenv("POSTGRESQL__PORT"))
	if port == "" {
		port = "5432"
	}

	user = envOrDefault("DB_USER", os.Getenv("POSTGRESQL__USER"))
	if user == "" {
		user = "aether"
	}

	name = envOrDefault("DB_NAME", os.Getenv("POSTGRESQL__NAME"))
	if name == "" {
		name = "etheria_account"
	}

	password = envOrDefault("DB_PASSWORD", os.Getenv("POSTGRESQL__PASSWORD"))
	if password == "" {
		password = envOrDefault("POSTGRES_PASSWORD", "password")
	}

	return host, port, user, name, password
}

func hasDatabaseConfig() bool {
	keys := []string{
		"DATABASE_URL",
		"DB_HOST",
		"DB_PORT",
		"DB_USER",
		"DB_NAME",
		"DB_PASSWORD",
		"POSTGRESQL__HOST",
		"POSTGRESQL__PORT",
		"POSTGRESQL__USER",
		"POSTGRESQL__NAME",
		"POSTGRESQL__PASSWORD",
		"POSTGRES_PASSWORD",
	}

	for _, key := range keys {
		if os.Getenv(key) != "" {
			return true
		}
	}

	return false
}

func buildDatabaseDSN() string {
	if dsn := os.Getenv("DATABASE_URL"); dsn != "" {
		return dsn
	}

	if !hasDatabaseConfig() {
		return ""
	}

	host, port, user, name, password := resolveDatabaseConfig()
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host,
		user,
		password,
		name,
		port,
	)
}

func shouldWaitForDatabase() bool {
	return os.Getenv("WORKER_WAIT_FOR_DB") == "true"
}

func databaseRetryDelay() time.Duration {
	raw := os.Getenv("DB_CONNECT_RETRY_DELAY")
	if raw == "" {
		return 3 * time.Second
	}

	delay, err := time.ParseDuration(raw)
	if err != nil || delay <= 0 {
		fmt.Printf("\033[1;33m[!] Warning: invalid DB_CONNECT_RETRY_DELAY=%q, using 3s\033[0m\n", raw)
		return 3 * time.Second
	}

	return delay
}

func databaseMaxAttempts() int {
	raw := os.Getenv("DB_CONNECT_MAX_ATTEMPTS")
	if raw == "" {
		return 0
	}

	attempts, err := strconv.Atoi(raw)
	if err != nil || attempts < 0 {
		fmt.Printf("\033[1;33m[!] Warning: invalid DB_CONNECT_MAX_ATTEMPTS=%q, using unlimited retries\033[0m\n", raw)
		return 0
	}

	return attempts
}

func connectDatabaseWithRetry(dsn string, waitForDB bool) (interfaces.IDatabaseService, error) {
	var (
		dbService interfaces.IDatabaseService
		err       error
	)

	maxAttempts := 1
	if waitForDB {
		maxAttempts = databaseMaxAttempts()
	}

	for attempt := 1; ; attempt++ {
		dbService, err = services.NewDatabaseService(dsn)
		if err == nil {
			return dbService, nil
		}

		if !waitForDB {
			return nil, err
		}

		if maxAttempts > 0 && attempt >= maxAttempts {
			return nil, err
		}

		fmt.Printf("\033[1;33m[!] Database unavailable, retrying in %s (attempt %d): %v\033[0m\n",
			databaseRetryDelay(),
			attempt,
			err,
		)
		time.Sleep(databaseRetryDelay())
	}
}

func displayBanner() {
	fmt.Printf("\n")
	fmt.Printf("\033[1;36m    ██╗    ██╗██╗  ██╗ █████╗ ████████╗██╗  ██╗███████╗████████╗\n")
	fmt.Printf("\033[1;36m    ██║    ██║██║  ██║██╔══██╗╚══██╔══╝██║  ██║██╔════╝╚══██╔══╝\n")
	fmt.Printf("\033[1;36m    ██║ █╗ ██║███████║███████║   ██║   ███████║█████╗     ██║   \n")
	fmt.Printf("\033[1;36m    ██║███╗██║██╔══██║██╔══██║   ██║   ██╔══██║██╔══╝     ██║   \n")
	fmt.Printf("\033[1;36m    ╚███╔███╔╝██║  ██║██║  ██║   ██║   ██║  ██║███████╗   ██║   \n")
	fmt.Printf("\033[0;37m")
	fmt.Printf("\n")
	fmt.Printf("\033[1;33m    ╔══════════════════════════════════════════════════════════════╗\n")
	fmt.Printf("\033[1;33m    ║                     Company Website                          ║\n")
	fmt.Printf("\033[1;33m    ║               Enterprise Account Management                  ║\n")
	fmt.Printf("\033[1;33m    ║                   Version 1.0.0-alpha                        ║\n")
	fmt.Printf("\033[1;33m    ╚══════════════════════════════════════════════════════════════╝\n")
	fmt.Printf("\033[0;37m")
	fmt.Printf("\n")
	fmt.Printf("\033[1;32m[✓] System Architecture: %s\033[0m\n", runtime.GOARCH)
	fmt.Printf("\033[1;32m[✓] Operating System: %s\033[0m\n", runtime.GOOS)
	fmt.Printf("\033[1;32m[✓] Go Version: %s\033[0m\n", runtime.Version())
	fmt.Printf("\033[1;32m[✓] CPU Cores: %d\033[0m\n", runtime.NumCPU())
	fmt.Printf("\033[1;32m[✓] Process ID: %d\033[0m\n", os.Getpid())
	fmt.Printf("\n")
}

func main() {
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	displayBanner()

	cfg := config.LoadConfig()

	var dbService interfaces.IDatabaseService
	var db *gorm.DB

	useEmbeddedDB := os.Getenv("USE_EMBEDDED_DB") == "true"

	if useEmbeddedDB {
		dbHost, dbPort, dbUser, dbName, dbPassword := resolveDatabaseConfig()
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			dbHost, dbUser, dbPassword, dbName, dbPort)

		var err error
		dbService, err = services.NewDatabaseService(dsn)
		if err != nil {
			fmt.Printf("\033[1;33m[!] Warning: Failed to connect to embedded database: %v\033[0m\n", err)
			fmt.Printf("\033[1;33m[!] Running in database-less mode\033[0m\n")
		} else {
			db = dbService.GetDB()
			fmt.Printf("\033[1;32m[✓] Embedded database connected\033[0m\n")

			services.DB = db
			fmt.Printf("\033[1;32m[✓] Global DB reference initialized\033[0m\n")

			serviceKeyService := services.NewServiceKeyService(db)
			if err := serviceKeyService.EnsureSystemKey(cfg.SystemKey); err != nil {
				fmt.Printf("\033[1;33m[!] Warning: Failed to ensure system key in database: %v\033[0m\n", err)
			} else {
				fmt.Printf("\033[1;32m[✓] System key validated in database\033[0m\n")
			}
		}
	} else if dsn := buildDatabaseDSN(); dsn != "" {
		var err error
		dbService, err = connectDatabaseWithRetry(dsn, shouldWaitForDatabase())
		if err != nil {
			fmt.Printf("\033[1;31m[✗] Failed to connect to database: %v\033[0m\n", err)
			os.Exit(1)
		}
		db = dbService.GetDB()
		fmt.Printf("\033[1;32m[✓] Database connected\033[0m\n")

		services.DB = db
		fmt.Printf("\033[1;32m[✓] Global DB reference initialized\033[0m\n")

		serviceKeyService := services.NewServiceKeyService(db)
		if err := serviceKeyService.EnsureSystemKey(cfg.SystemKey); err != nil {
			fmt.Printf("\033[1;33m[!] Warning: Failed to ensure system key in database: %v\033[0m\n", err)
		} else {
			fmt.Printf("\033[1;32m[✓] System key validated in database\033[0m\n")
		}
	} else {
		fmt.Printf("\033[1;33m[!] Warning: no database configuration provided, running in database-less mode\033[0m\n")
	}

	rdbCfg := redisclient.Config{
		Enabled:        cfg.Redis.Enabled,
		Required:       cfg.Redis.Required,
		URL:            cfg.Redis.URL,
		Host:           cfg.Redis.Host,
		Port:           cfg.Redis.Port,
		Password:       cfg.Redis.Password,
		DB:             cfg.Redis.DB,
		KeyPrefix:      cfg.Redis.KeyPrefix,
		DefaultTTL:     time.Duration(cfg.Redis.DefaultTTL) * time.Second,
		ConnectTimeout: time.Duration(cfg.Redis.ConnectTimeout) * time.Second,
		ReadTimeout:    time.Duration(cfg.Redis.ReadTimeout) * time.Second,
		WriteTimeout:   time.Duration(cfg.Redis.WriteTimeout) * time.Second,
		MaxRetries:     cfg.Redis.MaxRetries,
	}

	redisClient, err := redisclient.New(rdbCfg)
	if err != nil {
		fmt.Printf("\033[1;31m[✗] Failed to initialize Redis: %v\033[0m\n", err)
		os.Exit(1)
	}

	if redisClient != nil {
		fmt.Printf("\033[1;32m[✓] Redis connection established\033[0m\n")
	} else if cfg.Redis.Enabled {
		fmt.Printf("\033[1;33m[!] Redis unavailable; continuing without cache\033[0m\n")
	} else {
		fmt.Printf("\033[1;33m[!] Redis disabled\033[0m\n")
	}

	router := gin.New()
	router.Use(gin.Recovery())
	if os.Getenv("API_ACCESS_LOGS") == "true" {
		router.Use(middleware.Logger(middleware.LogConfig{
			EnableBody:   false,
			EnableHeader: false,
			EnableQuery:  false,
		}))
	}

	router.Use(middleware.AdaptiveCORSMiddleware())

	routes.SetupRoutes(router, cfg.SystemKey, services.NewServiceKeyService(db), dbService, redisClient)

	addr := fmt.Sprintf(":%s", cfg.Port)
	fmt.Printf("\033[1;32m[✓] Server starting on %s\033[0m\n", addr)
	fmt.Printf("\033[1;36m[✓] API available at http://localhost%s/api/v1\033[0m\n", addr)
	fmt.Printf("\n")

	srv := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("\033[1;31m[✗] Failed to start server: %v\033[0m\n", err)
			os.Exit(1)
		}
	}()

	<-quit
	fmt.Printf("\033[1;33m[!] Shutting down server...\033[0m\n")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		fmt.Printf("\033[1;31m[✗] Server forced to shutdown: %v\033[0m\n", err)
	}

	if redisClient != nil {
		if err := redisClient.Close(); err != nil {
			fmt.Printf("\033[1;33m[!] Warning: Redis close error: %v\033[0m\n", err)
		} else {
			fmt.Printf("\033[1;32m[✓] Redis connection closed\033[0m\n")
		}
	}

	if dbService != nil {
		if err := dbService.Close(); err != nil {
			fmt.Printf("\033[1;33m[!] Warning: Database close error: %v\033[0m\n", err)
		} else {
			fmt.Printf("\033[1;32m[✓] Database connection closed\033[0m\n")
		}
	}

	fmt.Printf("\033[1;32m[✓] Server exited cleanly\033[0m\n")
}
