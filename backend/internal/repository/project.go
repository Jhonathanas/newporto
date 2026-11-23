package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

const projectColumns = `id::text, slug,
	title_id, title_en, summary_id, summary_en, description_id, description_en,
	tech, status, year, live_url, repo_url, cover_url, featured, sort_order,
	created_at, updated_at`

type ProjectFilter struct {
	Featured *bool
	Tech     string
	Status   string
}

type ProjectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) List(ctx context.Context, filter ProjectFilter) ([]model.Project, error) {
	query := `SELECT ` + projectColumns + ` FROM projects WHERE 1 = 1`
	args := make([]any, 0, 3)

	if filter.Featured != nil {
		args = append(args, *filter.Featured)
		query += fmt.Sprintf(" AND featured = $%d", len(args))
	}
	if filter.Tech != "" {
		args = append(args, filter.Tech)
		query += fmt.Sprintf(" AND $%d = ANY(tech)", len(args))
	}
	if filter.Status != "" {
		args = append(args, filter.Status)
		query += fmt.Sprintf(" AND status = $%d", len(args))
	}
	query += ` ORDER BY sort_order ASC, year DESC, created_at DESC`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	defer rows.Close()

	projects := make([]model.Project, 0)
	for rows.Next() {
		project, err := scanProject(rows)
		if err != nil {
			return nil, err
		}
		projects = append(projects, *project)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate projects: %w", err)
	}
	return projects, nil
}

func (r *ProjectRepository) GetBySlug(ctx context.Context, slug string) (*model.Project, error) {
	query := `SELECT ` + projectColumns + ` FROM projects WHERE slug = $1`
	row := r.db.QueryRow(ctx, query, slug)
	return scanProject(row)
}

func (r *ProjectRepository) GetByID(ctx context.Context, id string) (*model.Project, error) {
	query := `SELECT ` + projectColumns + ` FROM projects WHERE id = $1`
	row := r.db.QueryRow(ctx, query, id)
	return scanProject(row)
}

func (r *ProjectRepository) Create(ctx context.Context, project *model.Project) error {
	const query = `
		INSERT INTO projects (
			slug, title_id, title_en, summary_id, summary_en, description_id, description_en,
			tech, status, year, live_url, repo_url, cover_url, featured, sort_order
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		RETURNING id::text, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		project.Slug,
		project.Title.ID,
		project.Title.EN,
		project.Summary.ID,
		project.Summary.EN,
		project.Description.ID,
		project.Description.EN,
		stringSlice(project.Tech),
		project.Status,
		project.Year,
		project.LiveURL,
		project.RepoURL,
		project.CoverURL,
		project.Featured,
		project.SortOrder,
	).Scan(&project.ID, &project.CreatedAt, &project.UpdatedAt)
	if err != nil {
		return fmt.Errorf("create project: %w", mapDBError(err))
	}
	return nil
}

func (r *ProjectRepository) Update(ctx context.Context, project *model.Project) error {
	const query = `
		UPDATE projects SET
			slug = $2,
			title_id = $3, title_en = $4,
			summary_id = $5, summary_en = $6,
			description_id = $7, description_en = $8,
			tech = $9, status = $10, year = $11,
			live_url = $12, repo_url = $13, cover_url = $14,
			featured = $15, sort_order = $16,
			updated_at = now()
		WHERE id = $1
		RETURNING created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		project.ID,
		project.Slug,
		project.Title.ID,
		project.Title.EN,
		project.Summary.ID,
		project.Summary.EN,
		project.Description.ID,
		project.Description.EN,
		stringSlice(project.Tech),
		project.Status,
		project.Year,
		project.LiveURL,
		project.RepoURL,
		project.CoverURL,
		project.Featured,
		project.SortOrder,
	).Scan(&project.CreatedAt, &project.UpdatedAt)
	if err != nil {
		return fmt.Errorf("update project: %w", mapDBError(err))
	}
	return nil
}

func (r *ProjectRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete project: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("delete project: %w", errNoRows)
	}
	return nil
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanProject(row rowScanner) (*model.Project, error) {
	var project model.Project

	err := row.Scan(
		&project.ID,
		&project.Slug,
		&project.Title.ID,
		&project.Title.EN,
		&project.Summary.ID,
		&project.Summary.EN,
		&project.Description.ID,
		&project.Description.EN,
		&project.Tech,
		&project.Status,
		&project.Year,
		&project.LiveURL,
		&project.RepoURL,
		&project.CoverURL,
		&project.Featured,
		&project.SortOrder,
		&project.CreatedAt,
		&project.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("scan project: %w", mapDBError(err))
	}
	return &project, nil
}

func stringSlice(values []string) []string {
	if values == nil {
		return []string{}
	}
	return values
}
