package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

const skillGroupColumns = `id::text, title_id, title_en, items, sort_order`

type SkillGroupRepository struct {
	db *pgxpool.Pool
}

func NewSkillGroupRepository(db *pgxpool.Pool) *SkillGroupRepository {
	return &SkillGroupRepository{db: db}
}

func (r *SkillGroupRepository) List(ctx context.Context) ([]model.SkillGroup, error) {
	query := `SELECT ` + skillGroupColumns + ` FROM skill_groups ORDER BY sort_order ASC, title_id ASC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list skill groups: %w", err)
	}
	defer rows.Close()

	groups := make([]model.SkillGroup, 0)
	for rows.Next() {
		group, err := scanSkillGroup(rows)
		if err != nil {
			return nil, err
		}
		groups = append(groups, *group)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate skill groups: %w", err)
	}
	return groups, nil
}

func (r *SkillGroupRepository) GetByID(ctx context.Context, id string) (*model.SkillGroup, error) {
	query := `SELECT ` + skillGroupColumns + ` FROM skill_groups WHERE id = $1`
	return scanSkillGroup(r.db.QueryRow(ctx, query, id))
}

func (r *SkillGroupRepository) Create(ctx context.Context, group *model.SkillGroup) error {
	const query = `
		INSERT INTO skill_groups (title_id, title_en, items, sort_order)
		VALUES ($1, $2, $3, $4)
		RETURNING id::text`
	err := r.db.QueryRow(ctx, query,
		group.Title.ID,
		group.Title.EN,
		stringSlice(group.Items),
		group.SortOrder,
	).Scan(&group.ID)
	if err != nil {
		return fmt.Errorf("create skill group: %w", mapDBError(err))
	}
	return nil
}

func (r *SkillGroupRepository) Update(ctx context.Context, group *model.SkillGroup) error {
	const query = `
		UPDATE skill_groups SET
			title_id = $2, title_en = $3, items = $4, sort_order = $5, updated_at = now()
		WHERE id = $1`
	tag, err := r.db.Exec(ctx, query,
		group.ID,
		group.Title.ID,
		group.Title.EN,
		stringSlice(group.Items),
		group.SortOrder,
	)
	if err != nil {
		return fmt.Errorf("update skill group: %w", mapDBError(err))
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("update skill group: %w", errNoRows)
	}
	return nil
}

func (r *SkillGroupRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM skill_groups WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete skill group: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("delete skill group: %w", errNoRows)
	}
	return nil
}

func scanSkillGroup(row rowScanner) (*model.SkillGroup, error) {
	var group model.SkillGroup
	if err := row.Scan(&group.ID, &group.Title.ID, &group.Title.EN, &group.Items, &group.SortOrder); err != nil {
		return nil, fmt.Errorf("scan skill group: %w", mapDBError(err))
	}
	return &group, nil
}
