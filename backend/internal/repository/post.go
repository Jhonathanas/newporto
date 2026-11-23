package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/model"
)

const postColumns = `id::text, slug,
	title_id, title_en, excerpt_id, excerpt_en, content_id, content_en,
	tags, reading_minutes, cover_url, published, published_at,
	created_at, updated_at`

type PostFilter struct {
	Tag                string
	IncludeUnpublished bool
	Limit              int
	Offset             int
}

type PostRepository struct {
	db *pgxpool.Pool
}

func NewPostRepository(db *pgxpool.Pool) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) List(ctx context.Context, filter PostFilter) ([]model.Post, int, error) {
	where := ` WHERE 1 = 1`
	args := make([]any, 0, 3)

	if !filter.IncludeUnpublished {
		where += ` AND published = true AND published_at IS NOT NULL AND published_at <= now()`
	}
	if filter.Tag != "" {
		args = append(args, filter.Tag)
		where += fmt.Sprintf(" AND $%d = ANY(tags)", len(args))
	}

	var total int
	if err := r.db.QueryRow(ctx, `SELECT count(*) FROM posts`+where, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count posts: %w", err)
	}

	query := `SELECT ` + postColumns + ` FROM posts` + where + ` ORDER BY published_at DESC NULLS LAST, created_at DESC`
	args = append(args, filter.Limit, filter.Offset)
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", len(args)-1, len(args))

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list posts: %w", err)
	}
	defer rows.Close()

	posts := make([]model.Post, 0)
	for rows.Next() {
		post, err := scanPost(rows)
		if err != nil {
			return nil, 0, err
		}
		posts = append(posts, *post)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate posts: %w", err)
	}
	return posts, total, nil
}

func (r *PostRepository) GetBySlug(ctx context.Context, slug string, includeUnpublished bool) (*model.Post, error) {
	query := `SELECT ` + postColumns + ` FROM posts WHERE slug = $1`
	if !includeUnpublished {
		query += ` AND published = true AND published_at IS NOT NULL AND published_at <= now()`
	}
	return scanPost(r.db.QueryRow(ctx, query, slug))
}

func (r *PostRepository) GetByID(ctx context.Context, id string) (*model.Post, error) {
	query := `SELECT ` + postColumns + ` FROM posts WHERE id = $1`
	return scanPost(r.db.QueryRow(ctx, query, id))
}

func (r *PostRepository) Create(ctx context.Context, post *model.Post) error {
	const query = `
		INSERT INTO posts (
			slug, title_id, title_en, excerpt_id, excerpt_en, content_id, content_en,
			tags, reading_minutes, cover_url, published, published_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id::text, created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		post.Slug,
		post.Title.ID,
		post.Title.EN,
		post.Excerpt.ID,
		post.Excerpt.EN,
		post.Content.ID,
		post.Content.EN,
		stringSlice(post.Tags),
		post.ReadingMinutes,
		post.CoverURL,
		post.Published,
		post.PublishedAt,
	).Scan(&post.ID, &post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return fmt.Errorf("create post: %w", mapDBError(err))
	}
	return nil
}

func (r *PostRepository) Update(ctx context.Context, post *model.Post) error {
	const query = `
		UPDATE posts SET
			slug = $2,
			title_id = $3, title_en = $4,
			excerpt_id = $5, excerpt_en = $6,
			content_id = $7, content_en = $8,
			tags = $9, reading_minutes = $10, cover_url = $11,
			published = $12, published_at = $13,
			updated_at = now()
		WHERE id = $1
		RETURNING created_at, updated_at`

	err := r.db.QueryRow(ctx, query,
		post.ID,
		post.Slug,
		post.Title.ID,
		post.Title.EN,
		post.Excerpt.ID,
		post.Excerpt.EN,
		post.Content.ID,
		post.Content.EN,
		stringSlice(post.Tags),
		post.ReadingMinutes,
		post.CoverURL,
		post.Published,
		post.PublishedAt,
	).Scan(&post.CreatedAt, &post.UpdatedAt)
	if err != nil {
		return fmt.Errorf("update post: %w", mapDBError(err))
	}
	return nil
}

func (r *PostRepository) Delete(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM posts WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete post: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("delete post: %w", errNoRows)
	}
	return nil
}

func scanPost(row rowScanner) (*model.Post, error) {
	var post model.Post

	err := row.Scan(
		&post.ID,
		&post.Slug,
		&post.Title.ID,
		&post.Title.EN,
		&post.Excerpt.ID,
		&post.Excerpt.EN,
		&post.Content.ID,
		&post.Content.EN,
		&post.Tags,
		&post.ReadingMinutes,
		&post.CoverURL,
		&post.Published,
		&post.PublishedAt,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("scan post: %w", mapDBError(err))
	}
	return &post, nil
}
