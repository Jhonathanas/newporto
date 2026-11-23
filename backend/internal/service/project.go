package service

import (
	"context"
	"fmt"
	"strings"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

var projectStatuses = map[string]bool{
	"completed":   true,
	"in_progress": true,
	"planned":     true,
}

type ProjectService struct {
	projects *repository.ProjectRepository
}

func NewProjectService(projects *repository.ProjectRepository) *ProjectService {
	return &ProjectService{projects: projects}
}

func (s *ProjectService) List(ctx context.Context, filter repository.ProjectFilter) ([]model.Project, error) {
	projects, err := s.projects.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	return projects, nil
}

func (s *ProjectService) GetBySlug(ctx context.Context, slug string) (*model.Project, error) {
	project, err := s.projects.GetBySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("get project %q: %w", slug, err)
	}
	return project, nil
}

func (s *ProjectService) GetByID(ctx context.Context, id string) (*model.Project, error) {
	project, err := s.projects.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get project %q: %w", id, err)
	}
	return project, nil
}

func (s *ProjectService) Create(ctx context.Context, project *model.Project) (*model.Project, error) {
	normalizeProject(project)
	if err := validateProject(project); err != nil {
		return nil, err
	}
	if err := s.projects.Create(ctx, project); err != nil {
		return nil, fmt.Errorf("create project: %w", err)
	}
	return s.GetByID(ctx, project.ID)
}

func (s *ProjectService) Update(ctx context.Context, project *model.Project) (*model.Project, error) {
	normalizeProject(project)
	if err := validateProject(project); err != nil {
		return nil, err
	}
	if err := s.projects.Update(ctx, project); err != nil {
		return nil, fmt.Errorf("update project: %w", err)
	}
	return s.GetByID(ctx, project.ID)
}

func (s *ProjectService) Delete(ctx context.Context, id string) error {
	if err := s.projects.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete project: %w", err)
	}
	return nil
}

func normalizeProject(project *model.Project) {
	project.Title = trimLocalized(project.Title)
	project.Summary = trimLocalized(project.Summary)
	project.Description = trimLocalized(project.Description)
	project.Status = strings.ToLower(strings.TrimSpace(project.Status))
	project.Slug = slugify(project.Slug)
	if project.Slug == "" {
		project.Slug = slugify(project.Title.EN)
	}
	if project.Slug == "" {
		project.Slug = slugify(project.Title.ID)
	}
	if project.Status == "" {
		project.Status = "completed"
	}
	project.LiveURL = emptyToNil(stringValue(project.LiveURL))
	project.RepoURL = emptyToNil(stringValue(project.RepoURL))
	project.CoverURL = emptyToNil(stringValue(project.CoverURL))
	if project.Tech == nil {
		project.Tech = []string{}
	}
	for i := range project.Tech {
		project.Tech[i] = strings.TrimSpace(project.Tech[i])
	}
}

func validateProject(project *model.Project) error {
	validation := apperr.NewValidation()
	requireString(validation, "slug", project.Slug, 200)
	requireLocalized(validation, "title", project.Title)
	requireLocalized(validation, "summary", project.Summary)
	requireLocalized(validation, "description", project.Description)
	if !projectStatuses[project.Status] {
		validation.Add("status", "Harus salah satu: completed, in_progress, planned")
	}
	if project.Year < 1900 || project.Year > 2200 {
		validation.Add("year", "Tahun tidak valid")
	}
	if len(project.Tech) > 30 {
		validation.Add("tech", "Maksimal 30 teknologi")
	}
	return validation.Err()
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
