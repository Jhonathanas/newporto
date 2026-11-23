package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

type ProfileRepository struct {
	db *pgxpool.Pool
}

func NewProfileRepository(db *pgxpool.Pool) *ProfileRepository {
	return &ProfileRepository{db: db}
}

func (r *ProfileRepository) Get(ctx context.Context) (*model.Profile, error) {
	const query = `
		SELECT name, initials,
		       role_id, role_en,
		       tagline_id, tagline_en,
		       bio_id, bio_en,
		       location, email, phone, socials,
		       availability_id, availability_en,
		       updated_at
		FROM profile
		WHERE id = 1`

	var profile model.Profile
	var socialsRaw []byte

	err := r.db.QueryRow(ctx, query).Scan(
		&profile.Name,
		&profile.Initials,
		&profile.Role.ID,
		&profile.Role.EN,
		&profile.Tagline.ID,
		&profile.Tagline.EN,
		&profile.Bio.ID,
		&profile.Bio.EN,
		&profile.Location,
		&profile.Email,
		&profile.Phone,
		&socialsRaw,
		&profile.Availability.ID,
		&profile.Availability.EN,
		&profile.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get profile: %w", mapDBError(err))
	}

	socials, err := decodeJSON[[]model.SocialLink](socialsRaw, "socials")
	if err != nil {
		return nil, err
	}
	profile.Socials = socials
	if profile.Socials == nil {
		profile.Socials = []model.SocialLink{}
	}

	return &profile, nil
}

func (r *ProfileRepository) Upsert(ctx context.Context, profile *model.Profile) error {
	const query = `
		INSERT INTO profile (
			id, name, initials,
			role_id, role_en, tagline_id, tagline_en,
			bio_id, bio_en, location, email, phone, socials,
			availability_id, availability_en, updated_at
		) VALUES (
			1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now()
		)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			initials = EXCLUDED.initials,
			role_id = EXCLUDED.role_id,
			role_en = EXCLUDED.role_en,
			tagline_id = EXCLUDED.tagline_id,
			tagline_en = EXCLUDED.tagline_en,
			bio_id = EXCLUDED.bio_id,
			bio_en = EXCLUDED.bio_en,
			location = EXCLUDED.location,
			email = EXCLUDED.email,
			phone = EXCLUDED.phone,
			socials = EXCLUDED.socials,
			availability_id = EXCLUDED.availability_id,
			availability_en = EXCLUDED.availability_en,
			updated_at = now()`

	_, err := r.db.Exec(ctx, query,
		profile.Name,
		profile.Initials,
		profile.Role.ID,
		profile.Role.EN,
		profile.Tagline.ID,
		profile.Tagline.EN,
		profile.Bio.ID,
		profile.Bio.EN,
		profile.Location,
		profile.Email,
		profile.Phone,
		profile.Socials,
		profile.Availability.ID,
		profile.Availability.EN,
	)
	if err != nil {
		return fmt.Errorf("upsert profile: %w", err)
	}
	return nil
}
