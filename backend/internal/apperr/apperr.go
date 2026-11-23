package apperr

import "errors"

var (
	ErrNotFound     = errors.New("data tidak ditemukan")
	ErrConflict     = errors.New("data sudah ada")
	ErrUnauthorized = errors.New("tidak terautentikasi")
)

type Validation struct {
	Fields map[string]string
}

func (e *Validation) Error() string {
	return "data tidak valid"
}

func NewValidation() *Validation {
	return &Validation{Fields: map[string]string{}}
}

func (e *Validation) Add(field, message string) {
	e.Fields[field] = message
}

func (e *Validation) Empty() bool {
	return len(e.Fields) == 0
}

func (e *Validation) Err() error {
	if e.Empty() {
		return nil
	}
	return e
}
