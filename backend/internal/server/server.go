package server

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	"portfolio/backend/internal/auth"
	"portfolio/backend/internal/config"
	"portfolio/backend/internal/handler"
	"portfolio/backend/internal/httpx"
	appmw "portfolio/backend/internal/middleware"
)

type Dependencies struct {
	Config  config.Config
	Handler *handler.Handler
	Tokens  *auth.Manager
	DB      *pgxpool.Pool
	Logger  *slog.Logger
}

func New(deps Dependencies) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(appmw.RequestLogger(deps.Logger))
	r.Use(middleware.Recoverer)
	r.Use(appmw.SecurityHeaders)
	r.Use(middleware.Timeout(60 * time.Second))

	loginLimiter := appmw.NewIPLimiter(5*time.Second, 5)
	contactLimiter := appmw.NewIPLimiter(1*time.Minute, 3)

	r.Get("/health", healthHandler(deps.DB))
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_, _ = w.Write([]byte(`{"name":"portfolio-api","docs":"/api/v1"}`))
	})

	uploads := http.StripPrefix("/uploads/", http.FileServer(http.Dir(deps.Config.UploadDir)))
	r.Handle("/uploads/*", cacheUploads(uploads))

	r.Route("/api/v1", func(api chi.Router) {
		api.Use(appmw.SameOrigin(deps.Config.FrontendOrigin))

		api.Get("/profile", deps.Handler.PublicProfile)
		api.Get("/projects", deps.Handler.PublicProjects)
		api.Get("/projects/{slug}", deps.Handler.PublicProject)
		api.Get("/posts", deps.Handler.PublicPosts)
		api.Get("/posts/{slug}", deps.Handler.PublicPost)
		api.Get("/skills", deps.Handler.PublicSkills)
		api.Get("/experiences", deps.Handler.PublicExperiences)
		api.Get("/education", deps.Handler.PublicEducation)

		api.With(contactLimiter.Middleware).Post("/contact", deps.Handler.SubmitContact)

		api.Route("/auth", func(authRouter chi.Router) {
			authRouter.With(loginLimiter.Middleware).Post("/login", deps.Handler.Login)
			authRouter.Post("/logout", deps.Handler.Logout)
			authRouter.With(deps.Tokens.RequireAuth).Get("/me", deps.Handler.Me)
		})

		api.Route("/admin", func(admin chi.Router) {
			admin.Use(deps.Tokens.RequireAuth)

			admin.Get("/profile", deps.Handler.AdminProfile)
			admin.Put("/profile", deps.Handler.AdminUpdateProfile)

			admin.Get("/projects", deps.Handler.AdminProjects)
			admin.Post("/projects", deps.Handler.AdminCreateProject)
			admin.Put("/projects/{id}", deps.Handler.AdminUpdateProject)
			admin.Delete("/projects/{id}", deps.Handler.AdminDeleteProject)

			admin.Get("/posts", deps.Handler.AdminPosts)
			admin.Post("/posts", deps.Handler.AdminCreatePost)
			admin.Get("/posts/{id}", deps.Handler.AdminPost)
			admin.Put("/posts/{id}", deps.Handler.AdminUpdatePost)
			admin.Delete("/posts/{id}", deps.Handler.AdminDeletePost)

			admin.Get("/skills", deps.Handler.AdminSkills)
			admin.Post("/skills", deps.Handler.AdminCreateSkill)
			admin.Put("/skills/{id}", deps.Handler.AdminUpdateSkill)
			admin.Delete("/skills/{id}", deps.Handler.AdminDeleteSkill)

			admin.Get("/experiences", deps.Handler.AdminExperiences)
			admin.Post("/experiences", deps.Handler.AdminCreateExperience)
			admin.Put("/experiences/{id}", deps.Handler.AdminUpdateExperience)
			admin.Delete("/experiences/{id}", deps.Handler.AdminDeleteExperience)

			admin.Get("/education", deps.Handler.AdminEducation)
			admin.Post("/education", deps.Handler.AdminCreateEducation)
			admin.Put("/education/{id}", deps.Handler.AdminUpdateEducation)
			admin.Delete("/education/{id}", deps.Handler.AdminDeleteEducation)

			admin.Get("/messages", deps.Handler.AdminMessages)
			admin.Patch("/messages/{id}/read", deps.Handler.AdminSetMessageRead)
			admin.Delete("/messages/{id}", deps.Handler.AdminDeleteMessage)

			admin.Post("/uploads", deps.Handler.AdminUpload)
		})
	})

	return r
}

func cacheUploads(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		next.ServeHTTP(w, r)
	})
}

type healthResponse struct {
	Status           string `json:"status"`
	DB               string `json:"db"`
	MigrationVersion *int   `json:"migrationVersion,omitempty"`
	MigrationDirty   *bool  `json:"migrationDirty,omitempty"`
}

func healthHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()

		response := healthResponse{Status: "ok", DB: "up"}
		status := http.StatusOK

		if err := db.Ping(ctx); err != nil {
			response.Status = "degraded"
			response.DB = "down"
			status = http.StatusServiceUnavailable
		} else {
			var version int
			var dirty bool
			if err := db.QueryRow(ctx, `SELECT version, dirty FROM schema_migrations LIMIT 1`).Scan(&version, &dirty); err == nil {
				response.MigrationVersion = &version
				response.MigrationDirty = &dirty
			}
		}

		httpx.JSON(w, status, response)
	}
}
