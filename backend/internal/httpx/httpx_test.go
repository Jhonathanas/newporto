package httpx

import (
	"net/http/httptest"
	"strings"
	"testing"
)

type payload struct {
	Name string `json:"name"`
}

func TestDecodeAcceptsValidJSON(t *testing.T) {
	request := httptest.NewRequest("POST", "/", strings.NewReader(`{"name":"Jonathan"}`))
	recorder := httptest.NewRecorder()

	var body payload
	if err := Decode(recorder, request, &body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Name != "Jonathan" {
		t.Errorf("name = %q, want Jonathan", body.Name)
	}
}

func TestDecodeRejectsUnknownField(t *testing.T) {
	request := httptest.NewRequest("POST", "/", strings.NewReader(`{"name":"Jonathan","admin":true}`))
	recorder := httptest.NewRecorder()

	var body payload
	if err := Decode(recorder, request, &body); err == nil {
		t.Fatal("field tidak dikenal seharusnya ditolak")
	}
}

func TestDecodeRejectsMultipleObjects(t *testing.T) {
	request := httptest.NewRequest("POST", "/", strings.NewReader(`{"name":"a"}{"name":"b"}`))
	recorder := httptest.NewRecorder()

	var body payload
	if err := Decode(recorder, request, &body); err == nil {
		t.Fatal("dua objek JSON seharusnya ditolak")
	}
}
