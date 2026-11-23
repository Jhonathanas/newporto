package service

import (
	"context"
	"fmt"
	"strings"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

type ContactService struct {
	messages *repository.MessageRepository
}

func NewContactService(messages *repository.MessageRepository) *ContactService {
	return &ContactService{messages: messages}
}

func (s *ContactService) Submit(ctx context.Context, message *model.ContactMessage) (*model.ContactMessage, error) {
	message.Name = strings.TrimSpace(message.Name)
	message.Email = strings.ToLower(strings.TrimSpace(message.Email))
	message.Subject = strings.TrimSpace(message.Subject)
	message.Message = strings.TrimSpace(message.Message)

	validation := apperr.NewValidation()
	requireString(validation, "name", message.Name, 100)
	requireEmail(validation, "email", message.Email)
	requireString(validation, "subject", message.Subject, 200)
	requireString(validation, "message", message.Message, 5000)
	if err := validation.Err(); err != nil {
		return nil, err
	}

	if err := s.messages.Create(ctx, message); err != nil {
		return nil, fmt.Errorf("submit message: %w", err)
	}
	return message, nil
}

type MessageService struct {
	messages *repository.MessageRepository
}

func NewMessageService(messages *repository.MessageRepository) *MessageService {
	return &MessageService{messages: messages}
}

func (s *MessageService) List(ctx context.Context, limit, offset int) ([]model.ContactMessage, int, error) {
	messages, total, err := s.messages.List(ctx, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list messages: %w", err)
	}
	return messages, total, nil
}

func (s *MessageService) SetRead(ctx context.Context, id string, read bool) error {
	if err := s.messages.SetRead(ctx, id, read); err != nil {
		return fmt.Errorf("set message read: %w", err)
	}
	return nil
}

func (s *MessageService) Delete(ctx context.Context, id string) error {
	if err := s.messages.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete message: %w", err)
	}
	return nil
}
