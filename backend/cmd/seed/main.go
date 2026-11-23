package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/auth"
	"portfolio/backend/internal/config"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("seed gagal: %v", err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	if cfg.AdminEmail == "" || cfg.AdminPassword == "" {
		return fmt.Errorf("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi")
	}

	seedDir := os.Getenv("SEED_DIR")
	if seedDir == "" {
		seedDir = "seed"
	}
	if _, err := os.Stat(seedDir); err != nil {
		return fmt.Errorf("folder seed tidak ditemukan (%s): %w", seedDir, err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping database: %w", err)
	}

	profileRepo := repository.NewProfileRepository(pool)
	projectRepo := repository.NewProjectRepository(pool)
	postRepo := repository.NewPostRepository(pool)
	skillRepo := repository.NewSkillGroupRepository(pool)
	experienceRepo := repository.NewExperienceRepository(pool)
	educationRepo := repository.NewEducationRepository(pool)
	userRepo := repository.NewUserRepository(pool)

	if err := seedProfile(ctx, pool, profileRepo, seedDir); err != nil {
		return err
	}
	if err := seedProjects(ctx, pool, projectRepo, seedDir); err != nil {
		return err
	}
	if err := seedPosts(ctx, pool, postRepo, seedDir); err != nil {
		return err
	}
	if err := seedSkills(ctx, pool, skillRepo, seedDir); err != nil {
		return err
	}
	if err := seedExperiences(ctx, pool, experienceRepo, seedDir); err != nil {
		return err
	}
	if err := seedEducation(ctx, pool, educationRepo, seedDir); err != nil {
		return err
	}
	if err := seedAdmin(ctx, userRepo, cfg); err != nil {
		return err
	}

	log.Println("seed selesai")
	return nil
}

func seedProfile(ctx context.Context, pool *pgxpool.Pool, repo *repository.ProfileRepository, dir string) error {
	empty, err := isEmpty(ctx, pool, "profile")
	if err != nil {
		return err
	}
	if !empty {
		log.Println("profile: dilewati (sudah berisi)")
		return nil
	}

	profile, err := loadJSON[model.Profile](dir, "profile.json")
	if err != nil {
		return err
	}
	if err := repo.Upsert(ctx, &profile); err != nil {
		return fmt.Errorf("seed profile: %w", err)
	}
	log.Println("profile: 1 data ditambahkan")
	return nil
}

func seedProjects(ctx context.Context, pool *pgxpool.Pool, repo *repository.ProjectRepository, dir string) error {
	empty, err := isEmpty(ctx, pool, "projects")
	if err != nil {
		return err
	}
	if !empty {
		log.Println("projects: dilewati (sudah berisi)")
		return nil
	}

	projects, err := loadJSON[[]model.Project](dir, "projects.json")
	if err != nil {
		return err
	}
	for i := range projects {
		if err := repo.Create(ctx, &projects[i]); err != nil {
			return fmt.Errorf("seed project %q: %w", projects[i].Slug, err)
		}
	}
	log.Printf("projects: %d data ditambahkan", len(projects))
	return nil
}

func seedPosts(ctx context.Context, pool *pgxpool.Pool, repo *repository.PostRepository, dir string) error {
	empty, err := isEmpty(ctx, pool, "posts")
	if err != nil {
		return err
	}
	if !empty {
		log.Println("posts: dilewati (sudah berisi)")
		return nil
	}

	posts, err := loadJSON[[]model.Post](dir, "posts.json")
	if err != nil {
		return err
	}
	for i := range posts {
		if posts[i].Published && posts[i].PublishedAt == nil {
			now := time.Now().UTC()
			posts[i].PublishedAt = &now
		}
		if err := repo.Create(ctx, &posts[i]); err != nil {
			return fmt.Errorf("seed post %q: %w", posts[i].Slug, err)
		}
	}
	log.Printf("posts: %d data ditambahkan", len(posts))
	return nil
}

func seedSkills(ctx context.Context, pool *pgxpool.Pool, repo *repository.SkillGroupRepository, dir string) error {
	empty, err := isEmpty(ctx, pool, "skill_groups")
	if err != nil {
		return err
	}
	if !empty {
		log.Println("skills: dilewati (sudah berisi)")
		return nil
	}

	groups, err := loadJSON[[]model.SkillGroup](dir, "skills.json")
	if err != nil {
		return err
	}
	for i := range groups {
		if err := repo.Create(ctx, &groups[i]); err != nil {
			return fmt.Errorf("seed skill group %q: %w", groups[i].Title.EN, err)
		}
	}
	log.Printf("skills: %d grup ditambahkan", len(groups))
	return nil
}

func seedExperiences(ctx context.Context, pool *pgxpool.Pool, repo *repository.ExperienceRepository, dir string) error {
	empty, err := isEmpty(ctx, pool, "experiences")
	if err != nil {
		return err
	}
	if !empty {
		log.Println("experiences: dilewati (sudah berisi)")
		return nil
	}

	experiences, err := loadJSON[[]model.Experience](dir, "experiences.json")
	if err != nil {
		return err
	}
	for i := range experiences {
		if err := repo.Create(ctx, &experiences[i]); err != nil {
			return fmt.Errorf("seed experience %q: %w", experiences[i].Company, err)
		}
	}
	log.Printf("experiences: %d data ditambahkan", len(experiences))
	return nil
}

func seedEducation(ctx context.Context, pool *pgxpool.Pool, repo *repository.EducationRepository, dir string) error {
	empty, err := isEmpty(ctx, pool, "education")
	if err != nil {
		return err
	}
	if !empty {
		log.Println("education: dilewati (sudah berisi)")
		return nil
	}

	items, err := loadJSON[[]model.Education](dir, "education.json")
	if err != nil {
		return err
	}
	for i := range items {
		if err := repo.Create(ctx, &items[i]); err != nil {
			return fmt.Errorf("seed education %q: %w", items[i].School, err)
		}
	}
	log.Printf("education: %d data ditambahkan", len(items))
	return nil
}

func seedAdmin(ctx context.Context, repo *repository.UserRepository, cfg config.Config) error {
	hash, err := auth.HashPassword(cfg.AdminPassword)
	if err != nil {
		return err
	}

	name := strings.TrimSpace(os.Getenv("ADMIN_NAME"))
	if name == "" {
		name = "Admin"
	}

	user := model.User{
		Email:        strings.ToLower(strings.TrimSpace(cfg.AdminEmail)),
		Name:         name,
		PasswordHash: hash,
	}
	if err := repo.Upsert(ctx, &user); err != nil {
		return fmt.Errorf("seed admin: %w", err)
	}
	log.Printf("admin: %s siap digunakan", user.Email)
	return nil
}

func isEmpty(ctx context.Context, pool *pgxpool.Pool, table string) (bool, error) {
	var empty bool
	if err := pool.QueryRow(ctx, "SELECT NOT EXISTS (SELECT 1 FROM "+table+")").Scan(&empty); err != nil {
		return false, fmt.Errorf("check table %s: %w", table, err)
	}
	return empty, nil
}

func loadJSON[T any](dir, name string) (T, error) {
	var value T

	raw, err := os.ReadFile(filepath.Join(dir, name))
	if err != nil {
		return value, fmt.Errorf("read %s: %w", name, err)
	}
	if err := json.Unmarshal(raw, &value); err != nil {
		return value, fmt.Errorf("decode %s: %w", name, err)
	}
	return value, nil
}
