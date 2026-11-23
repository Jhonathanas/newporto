package handler

import (
	"net/http"

	"portfolio/backend/internal/httpx"
	"portfolio/backend/internal/model"
	"portfolio/backend/internal/repository"
)

func (h *Handler) AdminProfile(w http.ResponseWriter, r *http.Request) {
	profile, err := h.profile.Get(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, profile)
}

func (h *Handler) AdminUpdateProfile(w http.ResponseWriter, r *http.Request) {
	var profile model.Profile
	if !h.decode(w, r, &profile) {
		return
	}

	updated, err := h.profile.Update(r.Context(), &profile)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, updated)
}

func (h *Handler) AdminProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.projects.List(r.Context(), repository.ProjectFilter{})
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, projects)
}

func (h *Handler) AdminCreateProject(w http.ResponseWriter, r *http.Request) {
	var project model.Project
	if !h.decode(w, r, &project) {
		return
	}
	project.ID = ""

	created, err := h.projects.Create(r.Context(), &project)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, created)
}

func (h *Handler) AdminUpdateProject(w http.ResponseWriter, r *http.Request) {
	var project model.Project
	if !h.decode(w, r, &project) {
		return
	}
	project.ID = pathID(r)

	updated, err := h.projects.Update(r.Context(), &project)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, updated)
}

func (h *Handler) AdminDeleteProject(w http.ResponseWriter, r *http.Request) {
	if err := h.projects.Delete(r.Context(), pathID(r)); err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) AdminPosts(w http.ResponseWriter, r *http.Request) {
	page, limit, offset := pagination(r)

	posts, total, err := h.posts.List(r.Context(), repository.PostFilter{
		IncludeUnpublished: true,
		Limit:              limit,
		Offset:             offset,
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

func (h *Handler) AdminPost(w http.ResponseWriter, r *http.Request) {
	post, err := h.posts.GetByID(r.Context(), pathID(r))
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, post)
}

func (h *Handler) AdminCreatePost(w http.ResponseWriter, r *http.Request) {
	var post model.Post
	if !h.decode(w, r, &post) {
		return
	}
	post.ID = ""

	created, err := h.posts.Create(r.Context(), &post)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, created)
}

func (h *Handler) AdminUpdatePost(w http.ResponseWriter, r *http.Request) {
	var post model.Post
	if !h.decode(w, r, &post) {
		return
	}
	post.ID = pathID(r)

	updated, err := h.posts.Update(r.Context(), &post)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, updated)
}

func (h *Handler) AdminDeletePost(w http.ResponseWriter, r *http.Request) {
	if err := h.posts.Delete(r.Context(), pathID(r)); err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) AdminSkills(w http.ResponseWriter, r *http.Request) {
	groups, err := h.skills.List(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, groups)
}

func (h *Handler) AdminCreateSkill(w http.ResponseWriter, r *http.Request) {
	var group model.SkillGroup
	if !h.decode(w, r, &group) {
		return
	}
	group.ID = ""

	created, err := h.skills.Create(r.Context(), &group)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, created)
}

func (h *Handler) AdminUpdateSkill(w http.ResponseWriter, r *http.Request) {
	var group model.SkillGroup
	if !h.decode(w, r, &group) {
		return
	}
	group.ID = pathID(r)

	updated, err := h.skills.Update(r.Context(), &group)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, updated)
}

func (h *Handler) AdminDeleteSkill(w http.ResponseWriter, r *http.Request) {
	if err := h.skills.Delete(r.Context(), pathID(r)); err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) AdminExperiences(w http.ResponseWriter, r *http.Request) {
	experiences, err := h.experience.List(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, experiences)
}

func (h *Handler) AdminCreateExperience(w http.ResponseWriter, r *http.Request) {
	var experience model.Experience
	if !h.decode(w, r, &experience) {
		return
	}
	experience.ID = ""

	created, err := h.experience.Create(r.Context(), &experience)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, created)
}

func (h *Handler) AdminUpdateExperience(w http.ResponseWriter, r *http.Request) {
	var experience model.Experience
	if !h.decode(w, r, &experience) {
		return
	}
	experience.ID = pathID(r)

	updated, err := h.experience.Update(r.Context(), &experience)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, updated)
}

func (h *Handler) AdminDeleteExperience(w http.ResponseWriter, r *http.Request) {
	if err := h.experience.Delete(r.Context(), pathID(r)); err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) AdminEducation(w http.ResponseWriter, r *http.Request) {
	items, err := h.education.List(r.Context())
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, items)
}

func (h *Handler) AdminCreateEducation(w http.ResponseWriter, r *http.Request) {
	var item model.Education
	if !h.decode(w, r, &item) {
		return
	}
	item.ID = ""

	created, err := h.education.Create(r.Context(), &item)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusCreated, created)
}

func (h *Handler) AdminUpdateEducation(w http.ResponseWriter, r *http.Request) {
	var item model.Education
	if !h.decode(w, r, &item) {
		return
	}
	item.ID = pathID(r)

	updated, err := h.education.Update(r.Context(), &item)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, updated)
}

func (h *Handler) AdminDeleteEducation(w http.ResponseWriter, r *http.Request) {
	if err := h.education.Delete(r.Context(), pathID(r)); err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}
