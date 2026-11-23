package repository

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"portfolio/backend/internal/apperr"
)

var errNoRows = pgx.ErrNoRows

func mapDBError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, errNoRows) {
		return apperr.ErrNotFound
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return apperr.ErrConflict
	}
	return err
}

func decodeJSON[T any](raw []byte, field string) (T, error) {
	var value T
	if len(raw) == 0 {
		return value, nil
	}
	if err := json.Unmarshal(raw, &value); err != nil {
		return value, fmt.Errorf("decode %s: %w", field, err)
	}
	return value, nil
}
