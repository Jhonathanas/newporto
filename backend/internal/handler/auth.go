package handler

import (
	"net/http"

	"portfolio/backend/internal/auth"
	"portfolio/backend/internal/httpx"
)

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var input loginInput
	if !h.decode(w, r, &input) {
		return
	}

	token, user, err := h.auth.Login(r.Context(), input.Email, input.Password)
	if err != nil {
		h.fail(w, r, err)
		return
	}

	h.tokens.SetCookie(w, token, h.cookieSecure)
	httpx.JSON(w, http.StatusOK, map[string]any{"user": user})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	h.tokens.ClearCookie(w, h.cookieSecure)
	httpx.JSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		httpx.Error(w, http.StatusUnauthorized, "unauthorized", "Silakan login terlebih dahulu")
		return
	}

	user, err := h.auth.UserByID(r.Context(), claims.UserID)
	if err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]any{"user": user})
}
