# Portfolio Backend

API Go untuk website portofolio Jonathan Adi Saputro.

## Stack

- Go + chi
- PostgreSQL 16
- pgx (query database)
- golang-migrate (migrasi)
- JWT + bcrypt (auth admin)
- Upload gambar ke disk lokal

## Setup

```bash
# dari root repo
docker compose up -d

cd backend
cp .env.example .env
# isi SESSION_SECRET (minimal 32 karakter) dan kredensial admin
# contoh: openssl rand -hex 32

go mod download
go run ./cmd/migrate up
go run ./cmd/seed
go run ./cmd/api
```

API berjalan di `http://localhost:8080`.

## Environment

| Variable | Keterangan |
| --- | --- |
| `APP_ENV` | `development` atau `production` |
| `PORT` | Port API, default `8080` |
| `DATABASE_URL` | DSN PostgreSQL |
| `SESSION_SECRET` | Secret JWT, minimal 32 karakter |
| `FRONTEND_ORIGIN` | Origin frontend yang diizinkan; pisahkan dengan koma jika lebih dari satu, mis. `http://localhost:5173,http://localhost:4173` |
| `COOKIE_SECURE` | `true` untuk HTTPS |
| `UPLOAD_DIR` | Folder upload, default `./uploads` |
| `ADMIN_EMAIL` | Email admin untuk seed |
| `ADMIN_PASSWORD` | Password admin untuk seed |
| `ADMIN_NAME` | Nama admin (opsional) |

## Perintah

```bash
go run ./cmd/migrate up       # jalankan migrasi
go run ./cmd/migrate down     # rollback satu langkah
go run ./cmd/migrate version  # lihat versi skema
go run ./cmd/seed             # isi data awal
go run ./cmd/api              # jalankan API
go test ./...
golangci-lint run
```

Seed hanya mengisi tabel yang masih kosong. User admin selalu di-upsert dari
`ADMIN_EMAIL` / `ADMIN_PASSWORD`, sehingga password bisa direset dengan
menjalankan seed lagi.

## Docker / production

`Dockerfile` membangun `api`, `migrate`, dan `seed`, lalu `scripts/start.sh`
menjalankan migrasi + seed sebelum menyalakan API. Environment production
contoh ada di `.env.production.example`. Panduan deploy gratis lengkap ada di
`../DEPLOYMENT.md`.

## Endpoint publik

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/health` | Status API, database, dan versi migrasi |
| GET | `/api/v1/profile` | Profil |
| GET | `/api/v1/projects` | Semua proyek (`?featured=`, `?tech=`, `?status=`) |
| GET | `/api/v1/projects/{slug}` | Detail proyek |
| GET | `/api/v1/posts` | Post published (`?tag=`, `?page=`, `?limit=`) |
| GET | `/api/v1/posts/{slug}` | Detail post published |
| GET | `/api/v1/skills` | Grup skill |
| GET | `/api/v1/experiences` | Pengalaman kerja |
| GET | `/api/v1/education` | Pendidikan |
| POST | `/api/v1/contact` | Kirim pesan kontak |

## Auth admin

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Login, set cookie `session` (HttpOnly) |
| POST | `/api/v1/auth/logout` | Hapus cookie |
| GET | `/api/v1/auth/me` | User aktif |

Semua route `/api/v1/admin/*` membutuhkan cookie login.

Contoh:

```bash
curl -c cookies.txt -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"..."}'

curl -b cookies.txt http://localhost:8080/api/v1/admin/messages
```

## Endpoint admin

| Resource | Endpoint |
| --- | --- |
| Profil | `GET/PUT /api/v1/admin/profile` |
| Proyek | `GET/POST /api/v1/admin/projects`, `PUT/DELETE /api/v1/admin/projects/{id}` |
| Post | `GET/POST /api/v1/admin/posts`, `GET/PUT/DELETE /api/v1/admin/posts/{id}` |
| Skill | `GET/POST /api/v1/admin/skills`, `PUT/DELETE /api/v1/admin/skills/{id}` |
| Pengalaman | `GET/POST /api/v1/admin/experiences`, `PUT/DELETE /api/v1/admin/experiences/{id}` |
| Pendidikan | `GET/POST /api/v1/admin/education`, `PUT/DELETE /api/v1/admin/education/{id}` |
| Pesan | `GET /api/v1/admin/messages`, `PATCH /api/v1/admin/messages/{id}/read`, `DELETE /api/v1/admin/messages/{id}` |
| Upload | `POST /api/v1/admin/uploads` (multipart field `file`) |

## Bentuk respons

Konten bilingual selalu berbentuk:

```json
{ "id": "teks Indonesia", "en": "English text" }
```

List berpaginasi:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0 }
}
```

Error:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Data tidak valid",
    "fields": { "email": "Format email tidak valid" }
  }
}
```

## Upload

- Field multipart: `file`
- Maksimal 5MB
- Hanya JPEG, PNG, WEBP, GIF (dicek lewat MIME sniffing)
- Nama file acak, disimpan di `UPLOAD_DIR`
- URL publik: `/uploads/{nama-file}`

## Catatan produksi

- Jalankan di belakang HTTPS dan set `COOKIE_SECURE=true`.
- Set `FRONTEND_ORIGIN` ke origin frontend sebenarnya.
- Mount `UPLOAD_DIR` ke volume persisten.
- Rate limiter masih in-memory; cukup untuk satu instance.
- Saat ini backend memakai `r.RemoteAddr` sebagai IP klien. Jika di belakang
  reverse proxy, tambahkan penanganan `X-Forwarded-For` dari proxy tepercaya.
