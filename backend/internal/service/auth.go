package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/auth"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

type AuthService struct {
	users  *repository.UserRepository
	tokens *auth.Manager
}

func NewAuthService(users *repository.UserRepository, tokens *auth.Manager) *AuthService {
	return &AuthService{users: users, tokens: tokens}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, *model.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" || password == "" {
		validation := apperr.NewValidation()
		if email == "" {
			validation.Add("email", "Email wajib diisi")
		}
		if password == "" {
			validation.Add("password", "Password wajib diisi")
		}
		return "", nil, validation
	}

	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, apperr.ErrNotFound) {
			return "", nil, apperr.ErrUnauthorized
		}
		return "", nil, fmt.Errorf("login: %w", err)
	}

	if err := auth.CheckPassword(user.PasswordHash, password); err != nil {
		return "", nil, apperr.ErrUnauthorized
	}

	token, err := s.tokens.Issue(user.ID, user.Email)
	if err != nil {
		return "", nil, fmt.Errorf("issue token: %w", err)
	}
	return token, user, nil
}

func (s *AuthService) UserByID(ctx context.Context, id string) (*model.User, error) {
	user, err := s.users.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, apperr.ErrNotFound) {
			return nil, apperr.ErrUnauthorized
		}
		return nil, fmt.Errorf("get user: %w", err)
	}
	return user, nil
}
