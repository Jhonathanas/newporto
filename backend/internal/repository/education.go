package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

const educationColumns = `id::text, school,
	degree_id, degree_en, period_id, period_en, details_id, details_en,
	highlights, sort_order`

type EducationRepository struct {
	db *pgxpool.Pool
}

func NewEducationRepository(db *pgxpool.Pool) *EducationRepository {
	return &EducationRepository{db: db}
}

func (r *EducationRepository) List(ctx context.Context) ([]model.Education, error) {
	query := `SELECT ` + educationColumns + ` FROM education ORDER BY sort_order ASC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list education: %w", err)
	}
	defer rows.Close()

	items := make([]model.Education, 0)
	for rows.Next() {
		item, err := scanEducation(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate education: %w", err)
	}
	return items, nil
}

func (r *EducationRepository) GetByID(ctx context.Context, id string) (*model.Education, error) {
	query := `SELECT ` + educationColumns + ` FROM education WHERE id = $1`
	return scanEducation(r.db.QueryRow(ctx, query, id))
}

func (r *EducationRepository) Create(ctx context.Context, item *model.Education) error {
	const query = `
		INSERT INTO education (
			school, degree_id, degree_en, period_id, period_en,
			details_id, details_en, highlights, sort_order
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id::text`

	err := r.db.QueryRow(ctx, query,
		item.School,
		item.Degree.ID,
		item.Degree.EN,
		periodValue(item.Period, true),
		periodValue(item.Period, false),
		item.Details.ID,
		item.Details.EN,
		nonNilLocalized(item.Highlights),
		item.SortOrder,
	).Scan(&item.ID)
	if err != nil {
		return fmt.Errorf("create education: %w", mapDBError(err))
	}
	return nil
}

func (r *EducationRepository) Update(ctx context.Context, item *model.Education) error {
	const query = `
		UPDATE education SET
			school = $2, degree_id = $3, degree_en = $4,
			period_id = $5, period_en = $6,
			details_id = $7, details_en = $8,
			highlights = $9, sort_order = $10, updated_at = now()
		WHERE id = $1`

	tag, err := r.db.Exec(ctx, query,
		item.ID,
		item.School,
		item.Degree.ID,
		item.Degree.EN,
		periodValue(item.Period, true),
		periodValue(item.Period, false),
		item.Details.ID,
		item.Details.EN,
		nonNilLocalized(item.Highlights),
		item.SortOrder,
	)
	if err != nil {
		return fmt.Errorf("update education: %w", mapDBError(err))
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("update education: %w", errNoRows)
	}
	return nil
}

func (r *EducationRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM education WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete education: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("delete education: %w", errNoRows)
	}
	return nil
}

func scanEducation(row rowScanner) (*model.Education, error) {
	var item model.Education
	var periodID, periodEN *string
	var highlightsRaw []byte

	err := row.Scan(
		&item.ID,
		&item.School,
		&item.Degree.ID,
		&item.Degree.EN,
		&periodID,
		&periodEN,
		&item.Details.ID,
		&item.Details.EN,
		&highlightsRaw,
		&item.SortOrder,
	)
	if err != nil {
		return nil, fmt.Errorf("scan education: %w", mapDBError(err))
	}

	if periodID != nil || periodEN != nil {
		period := model.Localized{}
		if periodID != nil {
			period.ID = *periodID
		}
		if periodEN != nil {
			period.EN = *periodEN
		}
		item.Period = &period
	}

	highlights, err := decodeJSON[[]model.Localized](highlightsRaw, "highlights")
	if err != nil {
		return nil, err
	}
	item.Highlights = nonNilLocalized(highlights)

	return &item, nil
}

func periodValue(period *model.Localized, indonesian bool) *string {
	if period == nil {
		return nil
	}
	if indonesian {
		return &period.ID
	}
	return &period.EN
}
