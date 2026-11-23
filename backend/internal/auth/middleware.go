package auth

import (
	"context"
	"net/http"
	"time"

	"portfolio/backend/internal/httpx"
)

const CookieName = "session"

type claimsKey struct{}

func (m *Manager) SetCookie(w http.ResponseWriter, token string, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(m.ttl / time.Second),
	})
}

func (m *Manager) ClearCookie(w http.ResponseWriter, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func (m *Manager) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(CookieName)
		if err != nil || cookie.Value == "" {
			httpx.Error(w, http.StatusUnauthorized, "unauthorized", "Silakan login terlebih dahulu")
			return
		}

		claims, err := m.Parse(cookie.Value)
		if err != nil {
			httpx.Error(w, http.StatusUnauthorized, "unauthorized", "Sesi tidak valid atau sudah kedaluwarsa")
			return
		}

		ctx := context.WithValue(r.Context(), claimsKey{}, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	claims, ok := ctx.Value(claimsKey{}).(*Claims)
	return claims, ok
}
