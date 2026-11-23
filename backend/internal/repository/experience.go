package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

const experienceColumns = `id::text, company,
	role_id, role_en, period_id, period_en, description_id, description_en,
	highlights, tech, sort_order`

type ExperienceRepository struct {
	db *pgxpool.Pool
}

func NewExperienceRepository(db *pgxpool.Pool) *ExperienceRepository {
	return &ExperienceRepository{db: db}
}

func (r *ExperienceRepository) List(ctx context.Context) ([]model.Experience, error) {
	query := `SELECT ` + experienceColumns + ` FROM experiences ORDER BY sort_order ASC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list experiences: %w", err)
	}
	defer rows.Close()

	experiences := make([]model.Experience, 0)
	for rows.Next() {
		experience, err := scanExperience(rows)
		if err != nil {
			return nil, err
		}
		experiences = append(experiences, *experience)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate experiences: %w", err)
	}
	return experiences, nil
}

func (r *ExperienceRepository) GetByID(ctx context.Context, id string) (*model.Experience, error) {
	query := `SELECT ` + experienceColumns + ` FROM experiences WHERE id = $1`
	return scanExperience(r.db.QueryRow(ctx, query, id))
}

func (r *ExperienceRepository) Create(ctx context.Context, experience *model.Experience) error {
	const query = `
		INSERT INTO experiences (
			company, role_id, role_en, period_id, period_en,
			description_id, description_en, highlights, tech, sort_order
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id::text`
	err := r.db.QueryRow(ctx, query,
		experience.Company,
		experience.Role.ID,
		experience.Role.EN,
		experience.Period.ID,
		experience.Period.EN,
		experience.Description.ID,
		experience.Description.EN,
		experience.Highlights,
		stringSlice(experience.Tech),
		experience.SortOrder,
	).Scan(&experience.ID)
	if err != nil {
		return fmt.Errorf("create experience: %w", mapDBError(err))
	}
	return nil
}

func (r *ExperienceRepository) Update(ctx context.Context, experience *model.Experience) error {
	const query = `
		UPDATE experiences SET
			company = $2, role_id = $3, role_en = $4,
			period_id = $5, period_en = $6,
			description_id = $7, description_en = $8,
			highlights = $9, tech = $10, sort_order = $11, updated_at = now()
		WHERE id = $1`
	tag, err := r.db.Exec(ctx, query,
		experience.ID,
		experience.Company,
		experience.Role.ID,
		experience.Role.EN,
		experience.Period.ID,
		experience.Period.EN,
		experience.Description.ID,
		experience.Description.EN,
		nonNilLocalized(experience.Highlights),
		stringSlice(experience.Tech),
		experience.SortOrder,
	)
	if err != nil {
		return fmt.Errorf("update experience: %w", mapDBError(err))
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("update experience: %w", errNoRows)
	}
	return nil
}

func (r *ExperienceRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM experiences WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete experience: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("delete experience: %w", errNoRows)
	}
	return nil
}

func scanExperience(row rowScanner) (*model.Experience, error) {
	var experience model.Experience
	var highlightsRaw []byte

	err := row.Scan(
		&experience.ID,
		&experience.Company,
		&experience.Role.ID,
		&experience.Role.EN,
		&experience.Period.ID,
		&experience.Period.EN,
		&experience.Description.ID,
		&experience.Description.EN,
		&highlightsRaw,
		&experience.Tech,
		&experience.SortOrder,
	)
	if err != nil {
		return nil, fmt.Errorf("scan experience: %w", mapDBError(err))
	}

	highlights, err := decodeJSON[[]model.Localized](highlightsRaw, "highlights")
	if err != nil {
		return nil, err
	}
	experience.Highlights = nonNilLocalized(highlights)

	return &experience, nil
}

func nonNilLocalized(values []model.Localized) []model.Localized {
	if values == nil {
		return []model.Localized{}
	}
	return values
}
