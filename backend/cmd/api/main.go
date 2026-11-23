package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/auth"
	"portfolio/backend/internal/config"
	"portfolio/backend/internal/handler"
	"portfolio/backend/internal/repository"
	"portfolio/backend/internal/server"
	"portfolio/backend/internal/service"
)

func main() {
	if err := run(); err != nil {
		slog.Error("api gagal berjalan", "error", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	if len(cfg.SessionSecret) < 32 {
		return fmt.Errorf("SESSION_SECRET wajib minimal 32 karakter")
	}

	logger := newLogger(cfg)
	slog.SetDefault(logger)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("parse database url: %w", err)
	}
	poolConfig.MaxConns = 10
	poolConfig.MinConns = 1
	poolConfig.MaxConnLifetime = 30 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping database: %w", err)
	}

	if err := os.MkdirAll(cfg.UploadDir, 0o755); err != nil {
		return fmt.Errorf("create upload dir: %w", err)
	}

	userRepo := repository.NewUserRepository(pool)
	profileRepo := repository.NewProfileRepository(pool)
	projectRepo := repository.NewProjectRepository(pool)
	postRepo := repository.NewPostRepository(pool)
	skillRepo := repository.NewSkillGroupRepository(pool)
	experienceRepo := repository.NewExperienceRepository(pool)
	educationRepo := repository.NewEducationRepository(pool)
	messageRepo := repository.NewMessageRepository(pool)

	tokens := auth.NewManager(cfg.SessionSecret, 7*24*time.Hour)

	handlerDeps := handler.Dependencies{
		Logger:       logger,
		Tokens:       tokens,
		Auth:         service.NewAuthService(userRepo, tokens),
		Profile:      service.NewProfileService(profileRepo),
		Projects:     service.NewProjectService(projectRepo),
		Posts:        service.NewPostService(postRepo),
		Skills:       service.NewSkillGroupService(skillRepo),
		Experience:   service.NewExperienceService(experienceRepo),
		Education:    service.NewEducationService(educationRepo),
		Contact:      service.NewContactService(messageRepo),
		Messages:     service.NewMessageService(messageRepo),
		CookieSecure: cfg.CookieSecure || cfg.IsProduction(),
		UploadDir:    cfg.UploadDir,
	}

	httpServer := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           server.New(server.Dependencies{Config: cfg, Handler: handler.New(handlerDeps), Tokens: tokens, DB: pool, Logger: logger}),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	serverErr := make(chan error, 1)
	go func() {
		logger.Info("api berjalan", "port", cfg.Port, "env", cfg.Env)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErr:
		return fmt.Errorf("http server: %w", err)
	case sig := <-stop:
		logger.Info("menerima sinyal, mematikan server", "signal", sig.String())
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("shutdown: %w", err)
	}
	return nil
}

func newLogger(cfg config.Config) *slog.Logger {
	options := &slog.HandlerOptions{Level: slog.LevelInfo}
	if cfg.IsProduction() {
		return slog.New(slog.NewJSONHandler(os.Stdout, options))
	}
	return slog.New(slog.NewTextHandler(os.Stdout, options))
}
