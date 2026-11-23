package handler

import (
	"net/http"

	"portfolio/backend/internal/httpx"
	"portfolio/backend/internal/model"
)

func (h *Handler) AdminMessages(w http.ResponseWriter, r *http.Request) {
	page, limit, offset := pagination(r)

	messages, total, err := h.messages.List(r.Context(), limit, offset)
	if err != nil {
		h.fail(w, r, err)
		return
	}

	httpx.JSON(w, http.StatusOK, httpx.ListResponse[model.ContactMessage]{
		Data: messages,
		Meta: httpx.Meta{Page: page, Limit: limit, Total: total},
	})
}

type readInput struct {
	Read bool `json:"read"`
}

func (h *Handler) AdminSetMessageRead(w http.ResponseWriter, r *http.Request) {
	var input readInput
	if !h.decode(w, r, &input) {
		return
	}

	if err := h.messages.SetRead(r.Context(), pathID(r), input.Read); err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) AdminDeleteMessage(w http.ResponseWriter, r *http.Request) {
	if err := h.messages.Delete(r.Context(), pathID(r)); err != nil {
		h.fail(w, r, err)
		return
	}
	httpx.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}
