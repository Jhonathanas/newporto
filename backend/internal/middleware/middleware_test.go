package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestClientIP(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"192.168.1.10:54321", "192.168.1.10"},
		{"[::1]:8080", "::1"},
		{"tanpa-port", "tanpa-port"},
	}

	for _, test := range tests {
		if got := clientIP(test.input); got != test.want {
			t.Errorf("clientIP(%q) = %q, want %q", test.input, got, test.want)
		}
	}
}

func TestIPLimiterPerAddress(t *testing.T) {
	limiter := NewIPLimiter(time.Hour, 1)

	if !limiter.allow("10.0.0.1") {
		t.Fatal("permintaan pertama seharusnya diizinkan")
	}
	if limiter.allow("10.0.0.1") {
		t.Fatal("permintaan kedua dari IP yang sama seharusnya ditolak")
	}
	if !limiter.allow("10.0.0.2") {
		t.Fatal("IP berbeda seharusnya punya kuota sendiri")
	}
}

func TestSameOrigin(t *testing.T) {
	handler := SameOrigin("http://localhost:5173, http://localhost:4173")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	request := httptest.NewRequest(http.MethodPost, "/", nil)
	request.Header.Set("Origin", "http://evil.example")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusForbidden {
		t.Errorf("origin asing = %d, want %d", recorder.Code, http.StatusForbidden)
	}

	request = httptest.NewRequest(http.MethodPost, "/", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Errorf("origin diizinkan = %d, want %d", recorder.Code, http.StatusOK)
	}

	request = httptest.NewRequest(http.MethodPost, "/", nil)
	request.Header.Set("Origin", "http://localhost:4173")
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Errorf("origin preview diizinkan = %d, want %d", recorder.Code, http.StatusOK)
	}

	request = httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("Origin", "http://evil.example")
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Errorf("GET dengan origin asing = %d, want %d", recorder.Code, http.StatusOK)
	}
}
