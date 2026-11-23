package service

import (
	"context"
	"fmt"
	"strings"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

type ProfileService struct {
	profile *repository.ProfileRepository
}

func NewProfileService(profile *repository.ProfileRepository) *ProfileService {
	return &ProfileService{profile: profile}
}

func (s *ProfileService) Get(ctx context.Context) (*model.Profile, error) {
	profile, err := s.profile.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("get profile: %w", err)
	}
	return profile, nil
}

func (s *ProfileService) Update(ctx context.Context, profile *model.Profile) (*model.Profile, error) {
	profile.Name = strings.TrimSpace(profile.Name)
	profile.Initials = strings.TrimSpace(profile.Initials)
	profile.Location = strings.TrimSpace(profile.Location)
	profile.Email = strings.TrimSpace(profile.Email)
	profile.Phone = strings.TrimSpace(profile.Phone)

	validation := apperr.NewValidation()
	requireString(validation, "name", profile.Name, 120)
	requireString(validation, "initials", profile.Initials, 8)
	requireLocalized(validation, "role", profile.Role)
	requireLocalized(validation, "tagline", profile.Tagline)
	requireLocalized(validation, "bio", profile.Bio)
	requireString(validation, "location", profile.Location, 120)
	requireEmail(validation, "email", profile.Email)
	requireLocalized(validation, "availability", profile.Availability)
	if len(profile.Socials) > 10 {
		validation.Add("socials", "Maksimal 10 tautan sosial")
	}
	for i := range profile.Socials {
		profile.Socials[i].Label = strings.TrimSpace(profile.Socials[i].Label)
		profile.Socials[i].URL = strings.TrimSpace(profile.Socials[i].URL)
		if profile.Socials[i].Label == "" || profile.Socials[i].URL == "" {
			validation.Add(fmt.Sprintf("socials.%d", i), "Label dan URL wajib diisi")
		}
	}
	if err := validation.Err(); err != nil {
		return nil, err
	}
	if profile.Socials == nil {
		profile.Socials = []model.SocialLink{}
	}

	if err := s.profile.Upsert(ctx, profile); err != nil {
		return nil, fmt.Errorf("update profile: %w", err)
	}
	return s.Get(ctx)
}
