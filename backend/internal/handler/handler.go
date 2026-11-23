package handler

import (
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"portfolio/backend/internal/apperr"
	"portfolio/backend/internal/auth"
	"portfolio/backend/internal/httpx"
	"portfolio/backend/internal/service"
)

type Handler struct {
	logger *slog.Logger
	tokens *auth.Manager

	auth       *service.AuthService
	profile    *service.ProfileService
	projects   *service.ProjectService
	posts      *service.PostService
	skills     *service.SkillGroupService
	experience *service.ExperienceService
	education  *service.EducationService
	contact    *service.ContactService
	messages   *service.MessageService

	cookieSecure bool
	uploadDir    string
}

type Dependencies struct {
	Logger       *slog.Logger
	Tokens       *auth.Manager
	Auth         *service.AuthService
	Profile      *service.ProfileService
	Projects     *service.ProjectService
	Posts        *service.PostService
	Skills       *service.SkillGroupService
	Experience   *service.ExperienceService
	Education    *service.EducationService
	Contact      *service.ContactService
	Messages     *service.MessageService
	CookieSecure bool
	UploadDir    string
}

func New(deps Dependencies) *Handler {
	return &Handler{
		logger:       deps.Logger,
		tokens:       deps.Tokens,
		auth:         deps.Auth,
		profile:      deps.Profile,
		projects:     deps.Projects,
		posts:        deps.Posts,
		skills:       deps.Skills,
		experience:   deps.Experience,
		education:    deps.Education,
		contact:      deps.Contact,
		messages:     deps.Messages,
		cookieSecure: deps.CookieSecure,
		uploadDir:    deps.UploadDir,
	}
}

func (h *Handler) fail(w http.ResponseWriter, r *http.Request, err error) {
	var validation *apperr.Validation
	if errors.As(err, &validation) {
		httpx.ValidationError(w, validation.Fields)
		return
	}

	switch {
	case errors.Is(err, apperr.ErrNotFound):
		httpx.Error(w, http.StatusNotFound, "not_found", "Data tidak ditemukan")
	case errors.Is(err, apperr.ErrConflict):
		httpx.Error(w, http.StatusConflict, "conflict", "Data dengan identitas tersebut sudah ada")
	case errors.Is(err, apperr.ErrUnauthorized):
		httpx.Error(w, http.StatusUnauthorized, "unauthorized", "Email atau password salah")
	default:
		h.logger.Error("request failed",
			"error", err,
			"method", r.Method,
			"path", r.URL.Path,
			"request_id", middleware.GetReqID(r.Context()),
		)
		httpx.Error(w, http.StatusInternalServerError, "internal_error", "Terjadi kesalahan pada server")
	}
}

func (h *Handler) decode(w http.ResponseWriter, r *http.Request, dst any) bool {
	if err := httpx.Decode(w, r, dst); err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid_json", "Body request tidak valid: "+err.Error())
		return false
	}
	return true
}

func pagination(r *http.Request) (page, limit, offset int) {
	page = 1
	limit = 10

	if value, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil && value > 0 {
		page = value
	}
	if value, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && value > 0 {
		limit = value
	}
	if limit > 50 {
		limit = 50
	}
	offset = (page - 1) * limit
	return page, limit, offset
}

func pathID(r *http.Request) string {
	return strings.TrimSpace(chi.URLParam(r, "id"))
}

func queryBool(r *http.Request, key string) (*bool, bool) {
	raw := strings.TrimSpace(r.URL.Query().Get(key))
	if raw == "" {
		return nil, true
	}
	value, err := strconv.ParseBool(raw)
	if err != nil {
		return nil, false
	}
	return &value, true
}
