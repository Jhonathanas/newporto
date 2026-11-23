# DeployPortfolio — opsi gratis

Karena belum punya domain dan server, ini perbandingan opsi yang benar-benar bisa dipakai tanpa biaya (per Nov 2026).

| Opsi | Frontend | Backend Go | Database | Catatan penting |
| --- | --- | --- | --- | --- |
| **A. Rekomendasi** | Vercel (`*.vercel.app`) | Render free (`*.onrender.com`) | Neon Free | Tanpa kartu kredit, tanpa domain. `/api` + `/uploads` di-proxy Vercel jadi satu origin, cookie admin aman. Render tidur setelah 15 menit idle (±1 menit bangun). Neon 0,5 GB + 100 CU-jam. |
| B. Cloudflare Pages | Cloudflare Pages (`*.pages.dev`) | Render / Koyeb | Neon | Bandwidth statik praktis unlimited, tapi proxy ke backend butuh Pages Function tambahan. |
| C. Semua di Render | Render Static Site | Render Web Service | Render Postgres | Paling simple, tapi **Postgres gratis expired 30 hari** → tidak cocok untuk data permanen. |
| D. Koyeb | Vercel / Cloudflare | Koyeb free | Neon | Koyeb free 512 MB, tapi sejak 2026 minta kartu dengan pre-auth ~$29. Dilewati. |

Kesimpulan: pakai **Vercel + Render + Neon**. Semua punya subdomain gratis, jadi tidak perlu beli domain dulu. Domain custom bisa ditambahkan nanti.

## Arsitektur

```
Browser
  └── https://<project>.vercel.app        (frontend statik + SPA)
        ├── /api/v1/*   ──rewrite──> https://<api>.onrender.com/api/v1/*
        ├── /uploads/*  ──rewrite──> https://<api>.onrender.com/uploads/*
        └── /health     ──rewrite──> https://<api>.onrender.com/health
                                      │
                                      └── DATABASE_URL ──> Neon PostgreSQL
```

Rewrite Vercel penting karena backend memakai cookie HttpOnly `SameSite=Lax` dan tidak punya CORS. Dengan rewrite, browser tetap melihat satu origin, jadi login admin tidak perlu ubah kode.

## Yang sudah disiapkan di repo

- `backend/Dockerfile` — build 3 binary (`api`, `migrate`, `seed`) + image runtime Alpine.
- `backend/scripts/start.sh` — jalankan `migrate up`, `seed`, lalu API saat container start.
- `backend/.env.production.example` — template environment production.
- `frontend/vercel.json.example` — aturan rewrite. Salin menjadi `frontend/vercel.json` setelah URL backend diketahui.
- `AGENT.md` / README diperbarui.

## Langkah deploy

### 1. Buat akun (semua gratis)

- GitHub — simpan kode.
- Neon — `https://neon.com` → PostgreSQL gratis.
- Render — `https://render.com` → Web Service gratis.
- Vercel — `https://vercel.com` → static hosting gratis.

### 2. Push kode ke GitHub

Repo lokal sudah diinisialisasi dan sudah ada commit awal. Buat repo baru di GitHub (kosong, tanpa README), lalu:

```bash
git remote add origin https://github.com/<USER>/<REPO>.git
git branch -M main
git push -u origin main
```

### 3. Neon (database)

1. Create project → nama bebas, region pilih yang dekat (mis. Singapore).
2. Copy **connection string** dari dashboard. Biasanya:
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`
3. Simpan sementara. Jangan commit.

Catatan: project Neon gratis akan sleep setelah ±5 menit tanpa aktivitas dan bangun otomatis saat ada koneksi. Itu normal.

### 4. Vercel (reserve URL frontend dulu)

1. Import repo GitHub.
2. **Root Directory:** `frontend`.
3. Framework Preset: `Vite`, Build Command `npm run build`, Output Directory `dist`.
4. Set **Project Name**, misal `portfolio-jonathan`, sehingga URL-nya `https://portfolio-jonathan.vercel.app`.
5. Deploy boleh dulu apa adanya; nanti akan di-deploy ulang setelah rewrite ditambahkan.

### 5. Render (backend Go)

1. New → **Web Service** → connect repo GitHub yang sama.
2. **Root Directory:** `backend`.
3. **Dockerfile Path:** `Dockerfile` (relatif terhadap Root Directory).
4. Plan: **Free**.
5. **Health Check Path:** `/health`.
6. Environment Variables:

| Key | Value |
| --- | --- |
| `APP_ENV` | `production` |
| `DATABASE_URL` | connection string Neon dari langkah 3 |
| `FRONTEND_ORIGIN` | `https://portfolio-jonathan.vercel.app` (URL Vercel asli) |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `COOKIE_SECURE` | `true` |
| `ADMIN_EMAIL` | email admin production |
| `ADMIN_PASSWORD` | password kuat, jangan pakai password development |
| `ADMIN_NAME` | `Jonathan Adi Saputro` |
| `UPLOAD_DIR` | `/app/uploads` |

`PORT` diisi otomatis oleh Render, tidak perlu ditambahkan.

7. Deploy. Cek `https://<api>.onrender.com/health` — harus balas JSON dengan `"status":"ok"` dan `"migrationVersion"` terisi. Kalau gagal, lihat log: script akan menjalankan migrasi dan seed lebih dulu.

### 6. Pasang rewrite Vercel

Setelah URL Render diketahui (misal `https://portfolio-api.onrender.com`):

```bash
cp frontend/vercel.json.example frontend/vercel.json
```

Lalu edit `frontend/vercel.json`, ganti semua `YOUR_BACKEND.onrender.com` dengan host Render asli, misalnya:

```json
{
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://portfolio-api.onrender.com/api/$1" },
    { "source": "/uploads/(.*)", "destination": "https://portfolio-api.onrender.com/uploads/$1" },
    { "source": "/health", "destination": "https://portfolio-api.onrender.com/health" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Commit dan push. Vercel akan auto-deploy.

### 7. Cek akhir

- `https://<project>.vercel.app/` → profil, proyek, blog, dan form kontak muncul.
- `https://<project>.vercel.app/health` → JSON dari backend Render.
- `https://<project>.vercel.app/admin/login` → login dengan `ADMIN_EMAIL` / `ADMIN_PASSWORD` production.
- Kirim pesan kontak uji, lalu cek di admin → Messages. Hapus setelah selesai.

## Keterbatasan yang perlu diketahui

1. **Render free tidur setelah 15 menit tanpa traffic.** Request pertama bisa memakan ±1 menit. Opsi: daftar URL `https://<api>.onrender.com/health` di cron-job.org atau UptimeRobot dengan interval 10 menit supaya tetap hangat. Ini masih gratis.
2. **Upload gambar tidak persisten.** Render free tidak punya disk permanen; file di `/app/uploads` hilang saat restart/deploy. Konten seed saat ini tidak memakai `/uploads`, jadi situs tetap tampil. Kalau nanti admin sering upload gambar, solusinya pindahkan ke object storage (Cloudinary / ImageKit / Cloudflare R2) — butuh perubahan kode backend.
3. **Seed hanya mengisi tabel kosong.** Aman dijalankan ulang, tetapi `ADMIN_EMAIL` / `ADMIN_PASSWORD` selalu di-upsert saat container start. Untuk ganti password admin: ubah env `ADMIN_PASSWORD` di Render lalu redeploy.
4. **Link sosial di seed masih pointing ke Netlify lama.** Kalau mau diganti ke URL baru, edit `backend/seed/profile.json` **sebelum deploy pertama**. Setelah database terisi, seed tidak akan menimpanya.
5. **Halaman admin masih pakai endpoint get-by-id yang terbatas** seperti di development; tidak berubah saat deploy.

## Troubleshooting singkat

| Gejala | Penyebab | Fix |
| --- | --- | --- |
| Login admin 403 `origin tidak diizinkan` | `FRONTEND_ORIGIN` di Render beda dengan URL Vercel | Samakan persis (termasuk `https://`, tanpa trailing `/`), lalu redeploy Render |
| Situs blank / 404 di `/projects` | `vercel.json` belum dibuat atau rewrite catch-all belum ada | Pastikan file sudah di-copy dan di-push |
| `/health` 503 | Neon belum bisa dijangkau / migration gagal | Cek `DATABASE_URL` (harus `sslmode=require`) dan log Render |
| Form kontak 429 | Rate limit 3 pesan/menit per IP | Tunggu sebentar |
| Gambar upload hilang | Render restart | Lihat keterbatasan nomor 2 |

## Kalau nanti mau domain sendiri

Beli domain di registrar mana pun, lalu tambahkan di Vercel (Domain → Add). `FRONTEND_ORIGIN` di Render harus diganti ke domain baru tersebut. Backend tetap memakai URL Render; tidak perlu domain terpisah karena sudah di-proxy.
