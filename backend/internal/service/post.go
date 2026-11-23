package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

type PostService struct {
	posts *repository.PostRepository
}

func NewPostService(posts *repository.PostRepository) *PostService {
	return &PostService{posts: posts}
}

func (s *PostService) List(ctx context.Context, filter repository.PostFilter) ([]model.Post, int, error) {
	posts, total, err := s.posts.List(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("list posts: %w", err)
	}
	return posts, total, nil
}

func (s *PostService) GetBySlug(ctx context.Context, slug string, includeUnpublished bool) (*model.Post, error) {
	post, err := s.posts.GetBySlug(ctx, slug, includeUnpublished)
	if err != nil {
		return nil, fmt.Errorf("get post %q: %w", slug, err)
	}
	return post, nil
}

func (s *PostService) GetByID(ctx context.Context, id string) (*model.Post, error) {
	post, err := s.posts.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get post %q: %w", id, err)
	}
	return post, nil
}

func (s *PostService) Create(ctx context.Context, post *model.Post) (*model.Post, error) {
	normalizePost(post)
	if err := validatePost(post); err != nil {
		return nil, err
	}
	if err := s.posts.Create(ctx, post); err != nil {
		return nil, fmt.Errorf("create post: %w", err)
	}
	return s.GetByID(ctx, post.ID)
}

func (s *PostService) Update(ctx context.Context, post *model.Post) (*model.Post, error) {
	normalizePost(post)
	if err := validatePost(post); err != nil {
		return nil, err
	}
	if err := s.posts.Update(ctx, post); err != nil {
		return nil, fmt.Errorf("update post: %w", err)
	}
	return s.GetByID(ctx, post.ID)
}

func (s *PostService) Delete(ctx context.Context, id string) error {
	if err := s.posts.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete post: %w", err)
	}
	return nil
}

func normalizePost(post *model.Post) {
	post.Title = trimLocalized(post.Title)
	post.Excerpt = trimLocalized(post.Excerpt)
	post.Content = trimLocalized(post.Content)
	post.Slug = slugify(post.Slug)
	if post.Slug == "" {
		post.Slug = slugify(post.Title.EN)
	}
	if post.Slug == "" {
		post.Slug = slugify(post.Title.ID)
	}
	post.CoverURL = emptyToNil(stringValue(post.CoverURL))

	if post.Tags == nil {
		post.Tags = []string{}
	}
	for i := range post.Tags {
		post.Tags[i] = strings.TrimSpace(post.Tags[i])
	}

	if post.ReadingMinutes <= 0 {
		content := post.Content.EN
		if strings.TrimSpace(content) == "" {
			content = post.Content.ID
		}
		post.ReadingMinutes = calculateReadingMinutes(content)
	}

	if post.Published {
		if post.PublishedAt == nil {
			now := time.Now().UTC()
			post.PublishedAt = &now
		}
	} else {
		post.PublishedAt = nil
	}
}

func validatePost(post *model.Post) error {
	validation := apperr.NewValidation()
	requireString(validation, "slug", post.Slug, 200)
	requireLocalized(validation, "title", post.Title)
	requireLocalized(validation, "excerpt", post.Excerpt)
	requireLocalized(validation, "content", post.Content)
	if post.ReadingMinutes < 1 || post.ReadingMinutes > 180 {
		validation.Add("readingMinutes", "Harus antara 1 dan 180 menit")
	}
	if len(post.Tags) > 20 {
		validation.Add("tags", "Maksimal 20 tag")
	}
	return validation.Err()
}
