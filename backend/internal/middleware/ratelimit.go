package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"

	"portfolio/backend/internal/httpx"
)

type ipEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type IPLimiter struct {
	mu      sync.Mutex
	entries map[string]*ipEntry
	every   time.Duration
	burst   int
}

func NewIPLimiter(every time.Duration, burst int) *IPLimiter {
	return &IPLimiter{
		entries: make(map[string]*ipEntry),
		every:   every,
		burst:   burst,
	}
}

func (l *IPLimiter) allow(ip string) bool {
	now := time.Now()

	l.mu.Lock()
	defer l.mu.Unlock()

	if len(l.entries) > 5000 {
		for key, entry := range l.entries {
			if now.Sub(entry.lastSeen) > 15*time.Minute {
				delete(l.entries, key)
			}
		}
	}

	entry, ok := l.entries[ip]
	if !ok {
		entry = &ipEntry{limiter: rate.NewLimiter(rate.Every(l.every), l.burst)}
		l.entries[ip] = entry
	}
	entry.lastSeen = now

	return entry.limiter.Allow()
}

func (l *IPLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !l.allow(clientIP(r.RemoteAddr)) {
			httpx.Error(w, http.StatusTooManyRequests, "rate_limited", "Terlalu banyak permintaan, coba lagi nanti")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func clientIP(remoteAddr string) string {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		return remoteAddr
	}
	return host
}
