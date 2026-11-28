# DeployPortfolio — opsi gratis

Karena belum punya domain dan server, ini perbandingan opsi yang benar-benar bisa dipakai tanpa biaya (per Nov 2026).

| Opsi | Frontend | Backend Go | Database | Catatan penting |
| --- | --- | --- | --- | --- |
| **A. Rekomendasi** | Vercel (`*.vercel.app`) | Render free (`*.onrender.com`) | Neon Free | Tanpa kartu kredit, tanpa domain. `/api` + `/uploads` di-proxy Vercel jadi satu origin, cookie admin aman. Render tidur setelah 15 menit idle (±1 menit bangun). Neon 0,5 GB + 100 CU-jam. |
| **A2. Cadangan tanpa kartu** | Vercel | SnapDeploy free (`*.containers.snapdeploy.app`) | Neon Free | Dipakai kalau Render tetap meminta payment method. Juga tanpa kartu, gratis permanen, 4 container / 100 jam per bulan, tidur 15 menit. |
| B. Cloudflare Pages | Cloudflare Pages (`*.pages.dev`) | Render / SnapDeploy | Neon | Bandwidth statik praktis unlimited, tapi proxy ke backend butuh Pages Function tambahan. |
| C. Semua di Render | Render Static Site | Render Web Service | Render Postgres | Paling simple, tapi **Postgres gratis expired 30 hari** → tidak cocok untuk data permanen. |
| D. Koyeb | Vercel / Cloudflare | Koyeb free | Neon | Koyeb free 512 MB, tapi sejak 2026 minta kartu dengan pre-auth ~$29. Dilewati. |
| E. AWS | Vercel | EC2 / ECS | Neon (jangan RDS) | Bisa daftar tanpa kartu di alur baru, tapi Free Tier hanya $200 / 6 bulan dan setup jauh lebih ribet. Tidak disarankan untuk kasus ini. |

Kesimpulan: pakai **Vercel + Render + Neon**. Kalau Render meminta kartu, ganti backend ke **SnapDeploy** (langkah 5b). Semua punya subdomain gratis, jadi tidak perlu beli domain dulu. Domain custom bisa ditambahkan nanti.

## Arsitektur

```
Browser
  └── https://<project>.vercel.app        (frontend statik + SPA)
        ├── /api/v1/*   ──rewrite──> https://<backend-host>/api/v1/*
        ├── /uploads/*  ──rewrite──> https://<backend-host>/uploads/*
        └── /health     ──rewrite──> https://<backend-host>/health
                                      │
                                      └── DATABASE_URL ──> Neon PostgreSQL

<backend-host> = https://<api>.onrender.com  (Render)
              atau https://<nama>.containers.snapdeploy.app  (SnapDeploy)
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
git remote add origin https://github.com/Jhonathanas/newporto.git
git branch -M main
git push -u origin main
```

### 3. Neon (database lewat integrasi Vercel)

Neon sekarang disarankan dibuat lewat Marketplace Vercel (bukan dari console Neon langsung).

1. Di dashboard Vercel, buka project → tab **Storage** (atau **Marketplace**) → cari **Neon Postgres** → **Install**.
2. Pilih mode **Vercel-Managed / Native Integration** (billing lewat Vercel, cocok untuk akun baru). Pilih plan **Free** kalau tersedia.
3. Beri nama resource, pilih region terdekat (mis. Singapore), lalu **Create**.
4. Saat diminta, **Connect to Project** → pilih project Vercel portofolio. Kalau dilewati, buka Storage → database → **Connect to Project**.
5. Integrasi akan menyuntik env var ke project Vercel. Untuk backend Go di Render, ambil connection string **tanpa pooling**:
   - Buka project Vercel → **Settings → Environment Variables**, salin nilai `DATABASE_URL_UNPOOLED` (atau `DATABASE_URL` dengan connection pooling dimatikan di Neon Console → **Connect**).
   - Atau di Storage → database → **Connect**, matikan **Connection pooling**, lalu copy string-nya.
6. Bentuk umum:
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

String ini dipakai di Render sebagai `DATABASE_URL`. Jangan commit. Variabel `DATABASE_URL` di Vercel aman untuk frontend statik karena tidak diawali `VITE_`, jadi tidak masuk bundle browser.

Catatan: project Neon gratis akan sleep setelah ±5 menit tanpa aktivitas dan bangun otomatis saat ada koneksi. Itu normal.

### 4. Vercel (reserve URL frontend dulu)

1. Import repo GitHub.
2. **Root Directory:** `frontend`.
3. Framework Preset: `Vite`, Build Command `npm run build`, Output Directory `dist`.
4. Set **Project Name**, misal `portfolio-jonathan`, sehingga URL-nya `https://portfolio-jonathan.vercel.app`.
5. Deploy boleh dulu apa adanya; nanti akan di-deploy ulang setelah rewrite ditambahkan.

### 5. Render (backend Go)

> Kalau muncul prompt **payment method / card number required**, cek dulu bagian **Compute**: harus dipilih **Free** (`$0/month`), bukan Starter/Standard. Kalau sudah Free tapi tetap diminta kartu, jangan isi kartu — lompat ke **5b**.

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

### 5b. SnapDeploy (alternatif kalau Render memaksa kartu)

1. Daftar di `https://snapdeploy.dev` pakai GitHub/email — **tanpa kartu**.
2. **New app** → connect repo `Jhonathanas/newporto`.
3. Pilih **Dockerfile**, root directory `backend`, path `Dockerfile`.
4. Size **Small** (512 MB) — gratis.
5. Environment variables sama seperti tabel di langkah 5 (`APP_ENV`, `DATABASE_URL`, `FRONTEND_ORIGIN`, `SESSION_SECRET`, `COOKIE_SECURE`, `ADMIN_*`, `UPLOAD_DIR`). `PORT` diisi otomatis.
6. Deploy dan cek `https://<nama>.containers.snapdeploy.app/health`.
7. Di langkah 6 nanti, ganti host rewrite ke `<nama>.containers.snapdeploy.app`.

Catatan: Dockerfile repo sudah `CGO_ENABLED=0` dan berbasis Alpine, jadi bisa build di ARM64 (AWS Graviton) yang dipakai SnapDeploy. Free SnapDeploy tidur setelah 15 menit idle dan bangun ±1 menit, sama seperti Render. Kuota 100 jam/bulan dan 10 deploy/hari.

### 6. Pasang rewrite Vercel

Setelah URL backend diketahui (misal `https://portfolio-api.containers.snapdeploy.app`):

```bash
cp frontend/vercel.json.example frontend/vercel.json
```

Lalu edit `frontend/vercel.json`, ganti semua `YOUR_BACKEND.containers.snapdeploy.app` dengan host backend asli, misalnya:

```json
{
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://portfolio-api.containers.snapdeploy.app/api/$1" },
    { "source": "/uploads/(.*)", "destination": "https://portfolio-api.containers.snapdeploy.app/uploads/$1" },
    { "source": "/health", "destination": "https://portfolio-api.containers.snapdeploy.app/health" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Commit dan push. Vercel akan auto-deploy.

### 6b. CI/CD

Repo sudah punya GitHub Actions di `.github/workflows/ci.yml`. Tiap push / PR ke `main` otomatis menjalankan:

- Backend: `go test ./...`, `go vet ./...`, `docker build -t portfolio-api:ci ./backend`
- Frontend: `npm ci`, `npm run build` (typecheck + Vite build)

Deploymentnya sendiri sudah otomatis dari platform:

- **SnapDeploy** auto-deploy backend setiap push ke `main`
- **Vercel** auto-deploy frontend setiap push ke `main`

Jadi tidak perlu workflow deploy manual.

### 7. Cek akhir

- `https://<project>.vercel.app/` → profil, proyek, blog, dan form kontak muncul.
- `https://<project>.vercel.app/health` → JSON dari backend SnapDeploy.
- `https://<project>.vercel.app/admin/login` → login dengan `ADMIN_EMAIL` / `ADMIN_PASSWORD` production.
- Kirim pesan kontak uji, lalu cek di admin → Messages. Hapus setelah selesai.

## Keterbatasan yang perlu diketahui

1. **SnapDeploy free tidur setelah 15 menit tanpa traffic.** Request pertama bisa memakan ±1 menit. Opsi: daftar URL `https://<nama>.containers.snapdeploy.app/health` di cron-job.org atau UptimeRobot dengan interval 10 menit supaya tetap hangat. Ini masih gratis.
2. **Upload gambar tidak persisten.** SnapDeploy free tidak punya disk permanen; file di `/app/uploads` hilang saat restart/deploy. Konten seed saat ini tidak memakai `/uploads`, jadi situs tetap tampil. Kalau nanti admin sering upload gambar, solusinya pindahkan ke object storage (Cloudinary / ImageKit / Cloudflare R2) — butuh perubahan kode backend.
3. **Seed hanya mengisi tabel kosong.** Aman dijalankan ulang, tetapi `ADMIN_EMAIL` / `ADMIN_PASSWORD` selalu di-upsert saat container start. Untuk ganti password admin: ubah env `ADMIN_PASSWORD` di SnapDeploy lalu redeploy.
4. **Link sosial di seed masih pointing ke Netlify lama.** Kalau mau diganti ke URL baru, edit `backend/seed/profile.json` **sebelum deploy pertama**. Setelah database terisi, seed tidak akan menimpanya.
5. **Halaman admin masih pakai endpoint get-by-id yang terbatas** seperti di development; tidak berubah saat deploy.

## Troubleshooting singkat

| Gejala | Penyebab | Fix |
| --- | --- | --- |
| Login admin 403 `origin tidak diizinkan` | `FRONTEND_ORIGIN` di backend beda dengan URL Vercel | Samakan persis (termasuk `https://`, tanpa trailing `/`), lalu redeploy backend |
| Situs blank / 404 di `/projects` | `vercel.json` belum dibuat atau rewrite catch-all belum ada | Pastikan file sudah di-copy dan di-push |
| `/health` 503 | Neon belum bisa dijangkau / migration gagal | Cek `DATABASE_URL` (harus `sslmode=require`) dan log backend |
| `Port mismatch detected` di SnapDeploy | Port tidak di-set eksplisit / Dockerfile tidak terdeteksi | Settings → Container → Port `8080`, health path `/health`, lalu redeploy. Dockerfile sudah punya `EXPOSE 8080` |
| Log `env=development` | `APP_ENV` tidak di-set di SnapDeploy | Tambah `APP_ENV=production` di Environment Variables, lalu redeploy |
| 502 setelah lama idle | Container free sedang bangun dari sleep | Tunggu ±1 menit lalu cek ulang; atau daftarkan URL `/health` ke UptimeRobot interval 10 menit |
| Form kontak 429 | Rate limit 3 pesan/menit per IP | Tunggu sebentar |
| Gambar upload hilang | Backend restart | Lihat keterbatasan nomor 2 |
| Render/SnapDeploy minta kartu | Compute bukan Free, atau verifikasi akun | Pilih **Free**; kalau tetap diminta, pakai SnapDeploy (5b) |

## Kalau nanti mau domain sendiri

Beli domain di registrar mana pun, lalu tambahkan di Vercel (Domain → Add). `FRONTEND_ORIGIN` di SnapDeploy harus diganti ke domain baru tersebut. Backend tetap memakai URL SnapDeploy; tidak perlu domain terpisah karena sudah di-proxy.

## Deploy aktual

| Item | Nilai |
| --- | --- |
| Frontend | `https://newporto-cyan.vercel.app` |
| Backend | `https://porto-505d3.containers.snapdeploy.app` |
| Database | Neon Free (via Vercel Marketplace), memakai `DATABASE_URL_UNPOOLED` sebagai `DATABASE_URL` |
| `FRONTEND_ORIGIN` | `https://newporto-cyan.vercel.app` (tanpa trailing `/`) |
| CI | `.github/workflows/ci.yml` |

Rewrite Vercel ada di `frontend/vercel.json`.
