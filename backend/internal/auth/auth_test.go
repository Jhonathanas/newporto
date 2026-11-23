package auth

import (
	"testing"
	"time"
)

func TestIssueAndParseToken(t *testing.T) {
	manager := NewManager("test-secret-yang-panjang-sekali-123456", time.Hour)

	token, err := manager.Issue("user-123", "admin@example.com")
	if err != nil {
		t.Fatalf("issue token: %v", err)
	}

	claims, err := manager.Parse(token)
	if err != nil {
		t.Fatalf("parse token: %v", err)
	}
	if claims.UserID != "user-123" {
		t.Errorf("UserID = %q, want %q", claims.UserID, "user-123")
	}
	if claims.Email != "admin@example.com" {
		t.Errorf("Email = %q, want %q", claims.Email, "admin@example.com")
	}
}

func TestParseRejectsWrongSecret(t *testing.T) {
	issuer := NewManager("secret-pertama-yang-panjang-1234567", time.Hour)
	verifier := NewManager("secret-kedua-yang-panjang-7654321", time.Hour)

	token, err := issuer.Issue("user-123", "admin@example.com")
	if err != nil {
		t.Fatalf("issue token: %v", err)
	}

	if _, err := verifier.Parse(token); err == nil {
		t.Fatal("parse token dengan secret berbeda seharusnya gagal")
	}
}

func TestParseRejectsExpiredToken(t *testing.T) {
	manager := NewManager("test-secret-yang-panjang-sekali-123456", -time.Minute)

	token, err := manager.Issue("user-123", "admin@example.com")
	if err != nil {
		t.Fatalf("issue token: %v", err)
	}

	if _, err := manager.Parse(token); err == nil {
		t.Fatal("token kedaluwarsa seharusnya ditolak")
	}
}

func TestPasswordHashing(t *testing.T) {
	hash, err := HashPassword("rahasia-123")
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	if hash == "rahasia-123" {
		t.Fatal("password tidak boleh disimpan sebagai plain text")
	}

	if err := CheckPassword(hash, "rahasia-123"); err != nil {
		t.Errorf("password benar seharusnya lolos: %v", err)
	}
	if err := CheckPassword(hash, "salah"); err == nil {
		t.Error("password salah seharusnya ditolak")
	}
}
