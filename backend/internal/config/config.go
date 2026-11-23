package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Env            string
	Port           string
	DatabaseURL    string
	SessionSecret  string
	FrontendOrigin string
	UploadDir      string
	CookieSecure   bool
	AdminEmail     string
	AdminPassword  string
}

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		Env:            env("APP_ENV", "development"),
		Port:           env("PORT", "8080"),
		DatabaseURL:    env("DATABASE_URL", ""),
		SessionSecret:  env("SESSION_SECRET", ""),
		FrontendOrigin: strings.TrimRight(env("FRONTEND_ORIGIN", "http://localhost:5173"), "/"),
		UploadDir:      env("UPLOAD_DIR", "./uploads"),
		CookieSecure:   env("COOKIE_SECURE", "false") == "true",
		AdminEmail:     env("ADMIN_EMAIL", ""),
		AdminPassword:  env("ADMIN_PASSWORD", ""),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL wajib diisi")
	}
	if _, err := strconv.Atoi(cfg.Port); err != nil {
		return Config{}, fmt.Errorf("PORT tidak valid: %w", err)
	}

	return cfg, nil
}

func (c Config) IsProduction() bool {
	return c.Env == "production"
}

func env(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
