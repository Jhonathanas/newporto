package service

import (
	"testing"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/model"
)

func TestSlugify(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Hello World", "hello-world"},
		{"  Aplikasi Internal Enterprise  ", "aplikasi-internal-enterprise"},
		{"React & TypeScript", "react-typescript"},
		{"sudah-slug", "sudah-slug"},
		{"--banyak---strip--", "banyak-strip"},
		{"", ""},
	}

	for _, test := range tests {
		if got := slugify(test.input); got != test.want {
			t.Errorf("slugify(%q) = %q, want %q", test.input, got, test.want)
		}
	}
}

func TestCalculateReadingMinutes(t *testing.T) {
	if got := calculateReadingMinutes(""); got != 1 {
		t.Errorf("konten kosong = %d, want 1", got)
	}
	if got := calculateReadingMinutes("satu dua tiga"); got != 1 {
		t.Errorf("tiga kata = %d, want 1", got)
	}

	long := ""
	for i := 0; i < 450; i++ {
		long += "kata "
	}
	if got := calculateReadingMinutes(long); got != 3 {
		t.Errorf("450 kata = %d, want 3", got)
	}
}

func TestNormalizeProjectFillsSlugAndDefaults(t *testing.T) {
	project := model.Project{
		Title: model.Localized{ID: "Aplikasi Baru", EN: "New Application"},
	}

	normalizeProject(&project)

	if project.Slug != "new-application" {
		t.Errorf("slug = %q, want %q", project.Slug, "new-application")
	}
	if project.Status != "completed" {
		t.Errorf("status = %q, want completed", project.Status)
	}
	if project.Tech == nil {
		t.Error("tech seharusnya slice kosong, bukan nil")
	}
}

func TestValidateProjectRejectsInvalidData(t *testing.T) {
	project := model.Project{
		Slug:   "",
		Status: "unknown",
		Year:   1000,
	}

	err := validateProject(&project)
	if err == nil {
		t.Fatal("data tidak valid seharusnya ditolak")
	}
}

func TestNormalizePostPublishing(t *testing.T) {
	post := model.Post{
		Title:     model.Localized{ID: "Judul", EN: "Title"},
		Content:   model.Localized{ID: "isi", EN: "content"},
		Published: true,
	}

	normalizePost(&post)

	if post.Slug != "title" {
		t.Errorf("slug = %q, want title", post.Slug)
	}
	if post.PublishedAt == nil {
		t.Error("post yang dipublikasikan seharusnya mendapat publishedAt")
	}
	if post.ReadingMinutes != 1 {
		t.Errorf("readingMinutes = %d, want 1", post.ReadingMinutes)
	}
	if post.Tags == nil {
		t.Error("tags seharusnya slice kosong, bukan nil")
	}

	post.Published = false
	normalizePost(&post)
	if post.PublishedAt != nil {
		t.Error("post yang tidak dipublikasikan seharusnya tidak punya publishedAt")
	}
}

func TestValidatePostRequiresBilingualContent(t *testing.T) {
	post := model.Post{
		Slug:           "contoh",
		Title:          model.Localized{ID: "Judul", EN: ""},
		Excerpt:        model.Localized{ID: "ringkasan", EN: "excerpt"},
		Content:        model.Localized{ID: "isi", EN: "content"},
		ReadingMinutes: 1,
	}

	if err := validatePost(&post); err == nil {
		t.Fatal("judul EN kosong seharusnya ditolak")
	}
}

func TestValidateContactValidation(t *testing.T) {
	validation := apperr.NewValidation()
	requireEmail(validation, "email", "bukan-email")
	if validation.Err() == nil {
		t.Fatal("email tidak valid seharusnya menghasilkan error validasi")
	}

	valid := apperr.NewValidation()
	requireEmail(valid, "email", "admin@example.com")
	if err := valid.Err(); err != nil {
		t.Fatalf("email valid seharusnya lolos: %v", err)
	}
}
