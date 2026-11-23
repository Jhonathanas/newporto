package handler

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"portfolio/backend/internal/httpx"
)

const maxUploadBytes = 5 << 20

var allowedImageTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

func (h *Handler) AdminUpload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes+(1<<20))

	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			httpx.Error(w, http.StatusRequestEntityTooLarge, "file_too_large", "Ukuran file maksimal 5MB")
			return
		}
		httpx.Error(w, http.StatusBadRequest, "invalid_upload", "Gagal membaca file upload")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		httpx.Error(w, http.StatusBadRequest, "invalid_upload", "Field file wajib diisi")
		return
	}
	defer func() {
		_ = file.Close()
	}()

	if header.Size > maxUploadBytes {
		httpx.Error(w, http.StatusRequestEntityTooLarge, "file_too_large", "Ukuran file maksimal 5MB")
		return
	}

	head := make([]byte, 512)
	read, err := io.ReadFull(file, head)
	if err != nil && !errors.Is(err, io.ErrUnexpectedEOF) {
		h.fail(w, r, fmt.Errorf("read upload header: %w", err))
		return
	}
	head = head[:read]

	contentType := http.DetectContentType(head)
	extension, ok := allowedImageTypes[contentType]
	if !ok {
		httpx.Error(w, http.StatusUnsupportedMediaType, "unsupported_type", "Hanya file JPEG, PNG, WEBP, atau GIF yang diizinkan")
		return
	}

	if _, err := file.Seek(0, io.SeekStart); err != nil {
		h.fail(w, r, fmt.Errorf("rewind upload: %w", err))
		return
	}

	if err := os.MkdirAll(h.uploadDir, 0o755); err != nil {
		h.fail(w, r, fmt.Errorf("create upload dir: %w", err))
		return
	}

	name, err := randomFileName(extension)
	if err != nil {
		h.fail(w, r, err)
		return
	}

	destination := filepath.Join(h.uploadDir, name)
	out, err := os.OpenFile(destination, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		h.fail(w, r, fmt.Errorf("create upload file: %w", err))
		return
	}

	written, copyErr := io.Copy(out, io.LimitReader(file, maxUploadBytes+1))
	closeErr := out.Close()
	if copyErr != nil {
		_ = os.Remove(destination)
		h.fail(w, r, fmt.Errorf("write upload: %w", copyErr))
		return
	}
	if closeErr != nil {
		_ = os.Remove(destination)
		h.fail(w, r, fmt.Errorf("close upload: %w", closeErr))
		return
	}
	if written > maxUploadBytes {
		_ = os.Remove(destination)
		httpx.Error(w, http.StatusRequestEntityTooLarge, "file_too_large", "Ukuran file maksimal 5MB")
		return
	}

	httpx.JSON(w, http.StatusCreated, map[string]any{
		"url":         "/uploads/" + name,
		"size":        written,
		"contentType": contentType,
	})
}

func randomFileName(extension string) (string, error) {
	buffer := make([]byte, 16)
	if _, err := rand.Read(buffer); err != nil {
		return "", fmt.Errorf("generate filename: %w", err)
	}
	return hex.EncodeToString(buffer) + extension, nil
}
