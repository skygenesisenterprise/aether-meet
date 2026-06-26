package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

const devJWTSecret = "dev-insecure-secret-change-me"

type Config struct {
	App      AppConfig
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	Auth     AuthConfig
	CORS     CORSConfig
	Realtime RealtimeConfig
	Storage  StorageConfig
	LiveKit  LiveKitConfig
}

type AppConfig struct {
	Env            string
	Name           string
	Version        string
	Mode           string
	AccessLogs     bool
	TrustedProxies []string
}

type ServerConfig struct {
	Host string
	Port string
}

type DatabaseConfig struct {
	URL      string
	Host     string
	Port     string
	User     string
	Name     string
	Password string
}

type RedisConfig struct {
	Enabled        bool
	Required       bool
	URL            string
	Host           string
	Port           string
	Password       string
	DB             int
	KeyPrefix      string
	DefaultTTL     time.Duration
	ConnectTimeout time.Duration
	ReadTimeout    time.Duration
	WriteTimeout   time.Duration
	MaxRetries     int
}

type AuthConfig struct {
	Mode          string
	JWTSecret     string
	JWTIssuer     string
	JWTAccessTTL  time.Duration
	JWTRefreshTTL time.Duration
}

type CORSConfig struct {
	AllowedOrigins []string
}

type RealtimeConfig struct {
	Enabled           bool
	HeartbeatInterval time.Duration
	ClientTimeout     time.Duration
}

type StorageConfig struct {
	Driver    string
	LocalPath string
}

type LiveKitConfig struct {
	Enabled   bool
	URL       string
	APIKey    string
	APISecret string
}

func Load() (Config, error) {
	cfg := Config{
		App: AppConfig{
			Env:            getEnv("APP_ENV", "development"),
			Name:           getEnv("APP_NAME", "Aether Meet"),
			Version:        getEnv("APP_VERSION", "dev"),
			Mode:           getEnv("GIN_MODE", "debug"),
			AccessLogs:     getEnvBool("API_ACCESS_LOGS", true),
			TrustedProxies: getEnvSlice("TRUSTED_PROXY_CIDRS", nil),
		},
		Server: ServerConfig{
			Host: getEnv("HOST", "0.0.0.0"),
			Port: getEnv("API_PORT", "8080"),
		},
		Database: DatabaseConfig{
			URL:      strings.TrimSpace(getEnv("DATABASE_URL", "")),
			Host:     getEnv("POSTGRESQL__HOST", "localhost"),
			Port:     getEnv("POSTGRESQL__PORT", "5432"),
			User:     getEnv("POSTGRESQL__USER", "postgres"),
			Name:     getEnv("POSTGRESQL__NAME", "aether_meet"),
			Password: getEnv("POSTGRESQL__PASSWORD", "postgres"),
		},
		Redis: RedisConfig{
			Enabled:        getEnvBool("REDIS_ENABLED", false),
			Required:       getEnvBool("REDIS_REQUIRED", false),
			URL:            getEnv("REDIS_URL", ""),
			Host:           getEnv("REDIS_HOST", "localhost"),
			Port:           getEnv("REDIS_PORT", "6379"),
			Password:       getEnv("REDIS_PASSWORD", ""),
			DB:             getEnvInt("REDIS_DB", 0),
			KeyPrefix:      getEnv("REDIS_KEY_PREFIX", "aether-meet:v1"),
			DefaultTTL:     getEnvDuration("REDIS_DEFAULT_TTL", 5*time.Minute),
			ConnectTimeout: getEnvDuration("REDIS_CONNECT_TIMEOUT", 5*time.Second),
			ReadTimeout:    getEnvDuration("REDIS_READ_TIMEOUT", 3*time.Second),
			WriteTimeout:   getEnvDuration("REDIS_WRITE_TIMEOUT", 3*time.Second),
			MaxRetries:     getEnvInt("REDIS_MAX_RETRIES", 3),
		},
		Auth: AuthConfig{
			Mode:          strings.ToLower(getEnv("AUTH_MODE", "jwt")),
			JWTSecret:     getEnv("JWT_SECRET", ""),
			JWTIssuer:     getEnv("JWT_ISSUER", "aether-meet"),
			JWTAccessTTL:  getEnvDuration("JWT_ACCESS_TTL", 15*time.Minute),
			JWTRefreshTTL: getEnvDuration("JWT_REFRESH_TTL", 24*time.Hour),
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnvSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
		},
		Realtime: RealtimeConfig{
			Enabled:           getEnvBool("REALTIME_ENABLED", true),
			HeartbeatInterval: getEnvDuration("REALTIME_HEARTBEAT_INTERVAL", 30*time.Second),
			ClientTimeout:     getEnvDuration("REALTIME_CLIENT_TIMEOUT", 75*time.Second),
		},
		Storage: StorageConfig{
			Driver:    strings.ToLower(getEnv("STORAGE_DRIVER", "local")),
			LocalPath: getEnv("STORAGE_LOCAL_PATH", "/media"),
		},
		LiveKit: LiveKitConfig{
			Enabled:   getEnvBool("LIVEKIT_ENABLED", false),
			URL:       getEnv("LIVEKIT_URL", ""),
			APIKey:    getEnv("LIVEKIT_API_KEY", ""),
			APISecret: getEnv("LIVEKIT_API_SECRET", ""),
		},
	}

	if cfg.Auth.JWTSecret == "" && cfg.App.Env != "production" {
		cfg.Auth.JWTSecret = devJWTSecret
	}

	if cfg.Database.URL == "" {
		cfg.Database.URL = fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			cfg.Database.Host,
			cfg.Database.User,
			cfg.Database.Password,
			cfg.Database.Name,
			cfg.Database.Port,
		)
	}

	return cfg, cfg.Validate()
}

func (c Config) Validate() error {
	if c.Server.Port == "" {
		return errors.New("API_PORT is required")
	}
	if c.App.Env == "production" {
		if c.Auth.Mode == "jwt" && (c.Auth.JWTSecret == "" || c.Auth.JWTSecret == devJWTSecret) {
			return errors.New("JWT_SECRET must be configured for production")
		}
		if len(c.CORS.AllowedOrigins) == 0 {
			return errors.New("CORS_ALLOWED_ORIGINS must be configured for production")
		}
	}
	if c.LiveKit.Enabled {
		if c.LiveKit.URL == "" || c.LiveKit.APIKey == "" || c.LiveKit.APISecret == "" {
			return errors.New("LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET are required when LIVEKIT_ENABLED=true")
		}
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvBool(key string, fallback bool) bool {
	value := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if value == "" {
		return fallback
	}
	return value == "true" || value == "1" || value == "yes"
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	if seconds, err := strconv.Atoi(value); err == nil {
		return time.Duration(seconds) * time.Second
	}
	if duration, err := time.ParseDuration(value); err == nil {
		return duration
	}
	return fallback
}

func getEnvSlice(key string, fallback []string) []string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}
