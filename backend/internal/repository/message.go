package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

const messageColumns = `id::text, name, email, subject, message, is_read, created_at`

type MessageRepository struct {
	db *pgxpool.Pool
}

func NewMessageRepository(db *pgxpool.Pool) *MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(ctx context.Context, message *model.ContactMessage) error {
	const query = `
		INSERT INTO contact_messages (name, email, subject, message)
		VALUES ($1, $2, $3, $4)
		RETURNING id::text, is_read, created_at`

	err := r.db.QueryRow(ctx, query,
		message.Name,
		message.Email,
		message.Subject,
		message.Message,
	).Scan(&message.ID, &message.IsRead, &message.CreatedAt)
	if err != nil {
		return fmt.Errorf("create message: %w", mapDBError(err))
	}
	return nil
}

func (r *MessageRepository) List(ctx context.Context, limit, offset int) ([]model.ContactMessage, int, error) {
	var total int
	if err := r.db.QueryRow(ctx, `SELECT count(*) FROM contact_messages`).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count messages: %w", err)
	}

	query := `SELECT ` + messageColumns + ` FROM contact_messages ORDER BY created_at DESC LIMIT $1 OFFSET $2`
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list messages: %w", err)
	}
	defer rows.Close()

	messages := make([]model.ContactMessage, 0)
	for rows.Next() {
		var message model.ContactMessage
		if err := rows.Scan(
			&message.ID,
			&message.Name,
			&message.Email,
			&message.Subject,
			&message.Message,
			&message.IsRead,
			&message.CreatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("scan message: %w", mapDBError(err))
		}
		messages = append(messages, message)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate messages: %w", err)
	}
	return messages, total, nil
}

func (r *MessageRepository) SetRead(ctx context.Context, id string, read bool) error {
	tag, err := r.db.Exec(ctx, `UPDATE contact_messages SET is_read = $2 WHERE id = $1`, id, read)
	if err != nil {
		return fmt.Errorf("update message: %w", mapDBError(err))
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("update message: %w", errNoRows)
	}
	return nil
}

func (r *MessageRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM contact_messages WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete message: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("delete message: %w", errNoRows)
	}
	return nil
}
