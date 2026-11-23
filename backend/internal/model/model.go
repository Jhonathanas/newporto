package model

import "time"

type Localized struct {
	ID string `json:"id"`
	EN string `json:"en"`
}

type SocialLink struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type Profile struct {
	Name         string       `json:"name"`
	Initials     string       `json:"initials"`
	Role         Localized    `json:"role"`
	Tagline      Localized    `json:"tagline"`
	Bio          Localized    `json:"bio"`
	Location     string       `json:"location"`
	Email        string       `json:"email"`
	Phone        string       `json:"phone"`
	Socials      []SocialLink `json:"socials"`
	Availability Localized    `json:"availability"`
	UpdatedAt    time.Time    `json:"updatedAt"`
}

type Project struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	Title       Localized `json:"title"`
	Summary     Localized `json:"summary"`
	Description Localized `json:"description"`
	Tech        []string  `json:"tech"`
	Status      string    `json:"status"`
	Year        int       `json:"year"`
	LiveURL     *string   `json:"liveUrl,omitempty"`
	RepoURL     *string   `json:"repoUrl,omitempty"`
	CoverURL    *string   `json:"coverUrl,omitempty"`
	Featured    bool      `json:"featured"`
	SortOrder   int       `json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Post struct {
	ID             string     `json:"id"`
	Slug           string     `json:"slug"`
	Title          Localized  `json:"title"`
	Excerpt        Localized  `json:"excerpt"`
	Content        Localized  `json:"content"`
	Tags           []string   `json:"tags"`
	ReadingMinutes int        `json:"readingMinutes"`
	CoverURL       *string    `json:"coverUrl,omitempty"`
	Published      bool       `json:"published"`
	PublishedAt    *time.Time `json:"publishedAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type SkillGroup struct {
	ID        string    `json:"id"`
	Title     Localized `json:"title"`
	Items     []string  `json:"items"`
	SortOrder int       `json:"sortOrder"`
}

type Experience struct {
	ID          string      `json:"id"`
	Company     string      `json:"company"`
	Role        Localized   `json:"role"`
	Period      Localized   `json:"period"`
	Description Localized   `json:"description"`
	Highlights  []Localized `json:"highlights"`
	Tech        []string    `json:"tech"`
	SortOrder   int         `json:"sortOrder"`
}

type Education struct {
	ID         string      `json:"id"`
	School     string      `json:"school"`
	Degree     Localized   `json:"degree"`
	Period     *Localized  `json:"period,omitempty"`
	Details    Localized   `json:"details"`
	Highlights []Localized `json:"highlights"`
	SortOrder  int         `json:"sortOrder"`
}

type ContactMessage struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"isRead"`
	CreatedAt time.Time `json:"createdAt"`
}

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
}
