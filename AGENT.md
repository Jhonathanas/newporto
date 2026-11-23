# Project: Portfolio Website

Portofolio pribadi: profil, proyek, pengalaman, pendidikan, dan blog.
Frontend React + backend Go + PostgreSQL.

## Stack

- React + TypeScript + Vite + Tailwind CSS + shadcn/ui (di `frontend/`)
- Go + chi + pgx (di `backend/`)
- PostgreSQL 16, migrasi pakai golang-migrate
- Auth admin: JWT di cookie HttpOnly + bcrypt
- Upload gambar ke disk lokal

## Struktur

- `frontend/src/lib/api.ts` — client fetch publik + admin, auth, dan upload
- `frontend/src/lib/content.tsx` — provider yang memuat semua konten publik sekali
- `frontend/src/components/ui/` — komponen shadcn/ui untuk situs publik
- `frontend/src/admin/` — panel admin lazy-loaded: auth, layout, halaman, komponen form
- `frontend/src/data/` — sudah dihapus; konten hanya dari API
- `backend/cmd/api/` — server HTTP
- `backend/cmd/migrate/` — runner migrasi
- `backend/cmd/seed/` — seed konten + admin
- `backend/internal/` — config, model, repository, service, handler, middleware
- `backend/migrations/` — file migrasi (jangan diedit setelah dijalankan)
- `backend/seed/` — konten awal dalam JSON
- `backend/Dockerfile` + `backend/scripts/start.sh` — image produksi (migrasi + seed + API)
- `frontend/vercel.json.example` — template rewrite Vercel untuk same-origin API
- `DEPLOYMENT.md` — panduan deploy gratis (Vercel + Render + Neon)
- `docker-compose.yml` — PostgreSQL development

## Commands

```bash
# Infrastruktur
docker compose up -d

# Backend
cd backend
go run ./cmd/migrate up
go run ./cmd/seed
go run ./cmd/api
go test ./...
golangci-lint run

# Frontend
cd frontend
npm run dev
npm run build
```

## Panel admin

Panel admin ada di `/admin/*` (SPA lazy-loaded) dan hanya membungkus rute admin;
`ContentProvider` khusus situs publik. Rute:

- `/admin/login` — login (JWT di cookie HttpOnly)
- `/admin` — dasbor statistik + pesan terbaru
- `/admin/profile` — edit profil dan tautan sosial
- `/admin/projects` — daftar + form tambah/edit/hapus proyek
- `/admin/posts` — daftar + form tambah/edit/hapus tulisan
- `/admin/messages` — inbox kontak, tandai dibaca, balas, hapus

Konvensi panel:

- Client admin memakai `credentials: 'include'`; respons `401` memicu event
  `admin:unauthorized` yang mengakhiri sesi dan mengarahkan ke login
- Form memakai kontrol native React (tanpa dependency form/editor baru);
  pratinjau Markdown memakai komponen `Markdown` yang sama dengan situs publik
- Form bilingual selalu mengirim field `id` dan `en`; `PUT` bersifat full
  replacement, jadi semua field dikirim ulang
- Error `422` dipetakan ke field lewat `error.fields`
- Panel memakai namespace i18n `admin` dan mengikuti toggle bahasa ID/EN
- Upload gambar lewat multipart, maksimal 5MB, URL relatif `/uploads/...`
  harus diterima (jangan memakai `input[type=url]` untuk field URL gambar)
- Perubahan admin baru terlihat di situs publik setelah reload (konten publik
  di-cache selama sesi)

## Konvensi

- Backend: handler → service → repository
- Error selalu di-wrap, jangan panic
- Jangan ubah file migrasi yang sudah ada; buat migrasi baru
- Konten bilingual memakai pasangan `{ id, en }`
- Respons list: `{ data, meta: { page, limit, total } }`
- Respons error: `{ error: { code, message, fields? } }`
- Data API dan seed memakai bentuk yang sama dengan tipe frontend
- Frontend memuat konten publik lewat `ContentProvider`; jangan menambah data statis baru
- Situs publik memakai komponen shadcn/ui di `components/ui/` dan token tema di
  `src/index.css`; jangan menambah library UI lain tanpa keputusan eksplisit
- Panel admin memakai `admin` i18n namespace dan client API yang sama (`lib/api.ts`)
- Form kontak mengirim ke `POST /api/v1/contact`
- `backend/.env` tidak boleh di-commit; template ada di `.env.example`

## Definition of done

- Test lulus, lint bersih, tidak ada TODO tertinggal
- Endpoint publik dan admin diuji dengan curl
- Alur admin (login, simpan proyek/tulisan, inbox, logout) diuji di browser
- Frontend memakai API, bukan data statis
- `npm run build` dan typecheck frontend lulus
