package service

import (
	"context"
	"fmt"
	"strings"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

type SkillGroupService struct {
	groups *repository.SkillGroupRepository
}

func NewSkillGroupService(groups *repository.SkillGroupRepository) *SkillGroupService {
	return &SkillGroupService{groups: groups}
}

func (s *SkillGroupService) List(ctx context.Context) ([]model.SkillGroup, error) {
	groups, err := s.groups.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list skill groups: %w", err)
	}
	return groups, nil
}

func (s *SkillGroupService) Create(ctx context.Context, group *model.SkillGroup) (*model.SkillGroup, error) {
	normalizeSkillGroup(group)
	if err := validateSkillGroup(group); err != nil {
		return nil, err
	}
	if err := s.groups.Create(ctx, group); err != nil {
		return nil, fmt.Errorf("create skill group: %w", err)
	}
	return s.groups.GetByID(ctx, group.ID)
}

func (s *SkillGroupService) Update(ctx context.Context, group *model.SkillGroup) (*model.SkillGroup, error) {
	normalizeSkillGroup(group)
	if err := validateSkillGroup(group); err != nil {
		return nil, err
	}
	if err := s.groups.Update(ctx, group); err != nil {
		return nil, fmt.Errorf("update skill group: %w", err)
	}
	return s.groups.GetByID(ctx, group.ID)
}

func (s *SkillGroupService) Delete(ctx context.Context, id string) error {
	if err := s.groups.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete skill group: %w", err)
	}
	return nil
}

func normalizeSkillGroup(group *model.SkillGroup) {
	group.Title = trimLocalized(group.Title)
	if group.Items == nil {
		group.Items = []string{}
	}
	for i := range group.Items {
		group.Items[i] = strings.TrimSpace(group.Items[i])
	}
}

func validateSkillGroup(group *model.SkillGroup) error {
	validation := apperr.NewValidation()
	requireLocalized(validation, "title", group.Title)
	if len(group.Items) == 0 {
		validation.Add("items", "Minimal satu item")
	}
	if len(group.Items) > 50 {
		validation.Add("items", "Maksimal 50 item")
	}
	return validation.Err()
}

type ExperienceService struct {
	experiences *repository.ExperienceRepository
}

func NewExperienceService(experiences *repository.ExperienceRepository) *ExperienceService {
	return &ExperienceService{experiences: experiences}
}

func (s *ExperienceService) List(ctx context.Context) ([]model.Experience, error) {
	experiences, err := s.experiences.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list experiences: %w", err)
	}
	return experiences, nil
}

func (s *ExperienceService) Create(ctx context.Context, experience *model.Experience) (*model.Experience, error) {
	normalizeExperience(experience)
	if err := validateExperience(experience); err != nil {
		return nil, err
	}
	if err := s.experiences.Create(ctx, experience); err != nil {
		return nil, fmt.Errorf("create experience: %w", err)
	}
	return s.experiences.GetByID(ctx, experience.ID)
}

func (s *ExperienceService) Update(ctx context.Context, experience *model.Experience) (*model.Experience, error) {
	normalizeExperience(experience)
	if err := validateExperience(experience); err != nil {
		return nil, err
	}
	if err := s.experiences.Update(ctx, experience); err != nil {
		return nil, fmt.Errorf("update experience: %w", err)
	}
	return s.experiences.GetByID(ctx, experience.ID)
}

func (s *ExperienceService) Delete(ctx context.Context, id string) error {
	if err := s.experiences.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete experience: %w", err)
	}
	return nil
}

func normalizeExperience(experience *model.Experience) {
	experience.Company = strings.TrimSpace(experience.Company)
	experience.Role = trimLocalized(experience.Role)
	experience.Period = trimLocalized(experience.Period)
	experience.Description = trimLocalized(experience.Description)
	if experience.Highlights == nil {
		experience.Highlights = []model.Localized{}
	}
	for i := range experience.Highlights {
		experience.Highlights[i] = trimLocalized(experience.Highlights[i])
	}
	if experience.Tech == nil {
		experience.Tech = []string{}
	}
	for i := range experience.Tech {
		experience.Tech[i] = strings.TrimSpace(experience.Tech[i])
	}
}

func validateExperience(experience *model.Experience) error {
	validation := apperr.NewValidation()
	requireString(validation, "company", experience.Company, 200)
	requireLocalized(validation, "role", experience.Role)
	requireLocalized(validation, "period", experience.Period)
	requireLocalized(validation, "description", experience.Description)
	if len(experience.Highlights) > 20 {
		validation.Add("highlights", "Maksimal 20 poin")
	}
	if len(experience.Tech) > 30 {
		validation.Add("tech", "Maksimal 30 teknologi")
	}
	return validation.Err()
}

type EducationService struct {
	education *repository.EducationRepository
}

func NewEducationService(education *repository.EducationRepository) *EducationService {
	return &EducationService{education: education}
}

func (s *EducationService) List(ctx context.Context) ([]model.Education, error) {
	items, err := s.education.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list education: %w", err)
	}
	return items, nil
}

func (s *EducationService) Create(ctx context.Context, item *model.Education) (*model.Education, error) {
	normalizeEducation(item)
	if err := validateEducation(item); err != nil {
		return nil, err
	}
	if err := s.education.Create(ctx, item); err != nil {
		return nil, fmt.Errorf("create education: %w", err)
	}
	return s.education.GetByID(ctx, item.ID)
}

func (s *EducationService) Update(ctx context.Context, item *model.Education) (*model.Education, error) {
	normalizeEducation(item)
	if err := validateEducation(item); err != nil {
		return nil, err
	}
	if err := s.education.Update(ctx, item); err != nil {
		return nil, fmt.Errorf("update education: %w", err)
	}
	return s.education.GetByID(ctx, item.ID)
}

func (s *EducationService) Delete(ctx context.Context, id string) error {
	if err := s.education.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete education: %w", err)
	}
	return nil
}

func normalizeEducation(item *model.Education) {
	item.School = strings.TrimSpace(item.School)
	item.Degree = trimLocalized(item.Degree)
	item.Details = trimLocalized(item.Details)
	if item.Period != nil {
		period := trimLocalized(*item.Period)
		if period.ID == "" && period.EN == "" {
			item.Period = nil
		} else {
			item.Period = &period
		}
	}
	if item.Highlights == nil {
		item.Highlights = []model.Localized{}
	}
	for i := range item.Highlights {
		item.Highlights[i] = trimLocalized(item.Highlights[i])
	}
}

func validateEducation(item *model.Education) error {
	validation := apperr.NewValidation()
	requireString(validation, "school", item.School, 200)
	requireLocalized(validation, "degree", item.Degree)
	requireLocalized(validation, "details", item.Details)
	if len(item.Highlights) > 20 {
		validation.Add("highlights", "Maksimal 20 poin")
	}
	return validation.Err()
}
