package service

import (
	"net/mail"
	"regexp"
	"strings"
	"unicode/utf8"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/model"
)

var slugSeparator = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = slugSeparator.ReplaceAllString(value, "-")
	return strings.Trim(value, "-")
}

func requireString(validation *apperr.Validation, field, value string, max int) {
	if value == "" {
		validation.Add(field, "Wajib diisi")
		return
	}
	if utf8.RuneCountInString(value) > max {
		validation.Add(field, "Terlalu panjang")
	}
}

func requireLocalized(validation *apperr.Validation, field string, value model.Localized) {
	requireString(validation, field+".id", strings.TrimSpace(value.ID), 5000)
	requireString(validation, field+".en", strings.TrimSpace(value.EN), 5000)
}

func requireEmail(validation *apperr.Validation, field, value string) {
	requireString(validation, field, value, 200)
	if value == "" {
		return
	}
	address, err := mail.ParseAddress(value)
	if err != nil || address.Address != value || !strings.Contains(value, "@") {
		validation.Add(field, "Format email tidak valid")
	}
}

func trimLocalized(value model.Localized) model.Localized {
	return model.Localized{
		ID: strings.TrimSpace(value.ID),
		EN: strings.TrimSpace(value.EN),
	}
}

func emptyToNil(value string) *string {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	return &value
}

func calculateReadingMinutes(content string) int {
	words := len(strings.Fields(content))
	if words == 0 {
		return 1
	}
	minutes := words / 200
	if words%200 != 0 {
		minutes++
	}
	if minutes < 1 {
		return 1
	}
	return minutes
}
