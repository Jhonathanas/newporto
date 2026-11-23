package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

const userColumns = `id::text, email, name, password_hash, created_at`

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE lower(email) = lower($1)`
	return scanUser(r.db.QueryRow(ctx, query, email))
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*model.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE id = $1`
	return scanUser(r.db.QueryRow(ctx, query, id))
}

func (r *UserRepository) Upsert(ctx context.Context, user *model.User) error {
	const query = `
		INSERT INTO users (email, name, password_hash)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			password_hash = EXCLUDED.password_hash,
			updated_at = now()
		RETURNING id::text, created_at`

	err := r.db.QueryRow(ctx, query, user.Email, user.Name, user.PasswordHash).
		Scan(&user.ID, &user.CreatedAt)
	if err != nil {
		return fmt.Errorf("upsert user: %w", mapDBError(err))
	}
	return nil
}

func scanUser(row rowScanner) (*model.User, error) {
	var user model.User
	err := row.Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("scan user: %w", mapDBError(err))
	}
	return &user, nil
}
