package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"portfolio/backend/internal/httpx"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

func (h *Handler) PublicProfile(w http.ResponseWriter, r *http.Request) {
	profile, err := h.profile.Get(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, profile)
}

func (h *Handler) PublicProjects(w http.ResponseWriter, r *http.Request) {
	featured, ok := queryBool(r, "featured")
	if !ok {
		httpx.Error(w, http.StatusBadRequest, "invalid_query", "Parameter featured harus berupa boolean")
		return
	}

	filter := repository.ProjectFilter{
		Featured: featured,
		Tech:     r.URL.Query().Get("tech"),
		Status:   r.URL.Query().Get("status"),
	}

	projects, err := h.projects.List(r.Context(), filter)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, projects)
}

func (h *Handler) PublicProject(w http.ResponseWriter, r *http.Request) {
	project, err := h.projects.GetBySlug(r.Context(), chi.URLParam(r, "slug"))
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, project)
}

func (h *Handler) PublicPosts(w http.ResponseWriter, r *http.Request) {
	page, limit, offset := pagination(r)

	posts, total, err := h.posts.List(r.Context(), repository.PostFilter{
		Tag:    r.URL.Query().Get("tag"),
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		h.fail(w, r, err)
		return
	}

	httpx.JSON(w, http.StatusOK, httpx.ListResponse[model.Post]{
		Data: posts,
		Meta: httpx.Meta{Page: page, Limit: limit, Total: total},
	})
}

func (h *Handler) PublicPost(w http.ResponseWriter, r *http.Request) {
	post, err := h.posts.GetBySlug(r.Context(), chi.URLParam(r, "slug"), false)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, post)
}

func (h *Handler) PublicSkills(w http.ResponseWriter, r *http.Request) {
	groups, err := h.skills.List(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, groups)
}

func (h *Handler) PublicExperiences(w http.ResponseWriter, r *http.Request) {
	experiences, err := h.experience.List(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, experiences)
}

func (h *Handler) PublicEducation(w http.ResponseWriter, r *http.Request) {
	items, err := h.education.List(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}

type contactInput struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
	Website string `json:"website"`
}

func (h *Handler) SubmitContact(w http.ResponseWriter, r *http.Request) {
	var input contactInput
	if !h.decode(w, r, &input) {
		return
	}

	// Honeypot: bot mengisi field tersembunyi. Balas sukses tanpa menyimpan.
	if input.Website != "" {
		httpx.JSON(w, http.StatusCreated, map[string]any{"data": map[string]bool{"received": true}})
		return
	}

	message, err := h.contact.Submit(r.Context(), &model.ContactMessage{
		Name:    input.Name,
		Email:   input.Email,
		Subject: input.Subject,
		Message: input.Message,
	})
	if err != nil {
		h.fail(w, r, err)
		return
	}

	httpx.JSON(w, http.StatusCreated, map[string]any{
		"data": map[string]any{
			"received":  true,
			"createdAt": message.CreatedAt,
		},
	})
}
