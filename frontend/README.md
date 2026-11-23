# Portfolio — Frontend

Frontend portofolio dengan React + TypeScript + Vite + Tailwind CSS.
Situs publik memakai komponen shadcn/ui (Radix + CVA) dengan token tema yang
disesuaikan; panel admin tetap memakai komponen native sendiri.
Konten diambil dari API Go di `backend/`; tidak ada lagi data statis di frontend.

## Menjalankan

Butuh Node.js 20+ dan backend yang berjalan di `http://localhost:8080`.

```bash
npm install
npm run dev
```

Buka http://localhost:5173. Perintah lain:

```bash
npm run build      # typecheck + build produksi ke dist/
npm run preview    # pratinjau hasil build
npm run typecheck  # cek TypeScript saja
```

## Deploy

Panduan lengkap opsi gratis (Vercel + Render + Neon) ada di `../DEPLOYMENT.md`.
Untuk Vercel, salin `vercel.json.example` menjadi `vercel.json` dan ganti
`YOUR_BACKEND.onrender.com` dengan URL backend setelah deploy.

## Struktur

```
src/
├── admin/        # panel admin (login, dasbor, profil, proyek, tulisan, pesan)
├── components/
│   ├── ui/       # komponen shadcn/ui (button, card, badge, input, dll.)
│   └── ...       # Navbar, Footer, kartu proyek, form kontak, markdown
├── lib/
│   ├── api.ts      # client fetch publik + admin, auth, upload
│   ├── content.tsx # provider yang memuat semua konten publik
│   ├── i18n.ts     # teks antarmuka ID/EN (namespace publik + admin)
│   ├── theme.tsx   # dark/light mode
│   └── useLocale.ts
├── pages/        # Home, Projects, ProjectDetail, Blog, BlogDetail, 404
└── types.ts      # tipe data yang mencerminkan model backend
```

## UI shadcn/ui (situs publik)

Komponen shadcn/ui hidup di `src/components/ui/` dan mengikuti konvensi
`components.json` (preset `radix-nova`, style `radix`). Tambah komponen baru
dengan:

```bash
npx shadcn@latest add <nama-komponen>
```

Token tema didefinisikan di `src/index.css` memakai CSS variables shadcn
(`--background`, `--primary`, `--muted`, `--border`, dll.). Nilainya disesuaikan
dengan identitas portofolio: aksen indigo, latar hangat, dan mode gelap.
Alias `@/*` sudah dikonfigurasi di `tsconfig.json` dan `vite.config.ts`.

Panel admin tidak dirework; helper CSS lama (`.btn-primary`, `.field`, `.chip`)
tetap dipakai di sana, tetapi sekarang memetakan token shadcn yang sama.

## Alur data

Saat aplikasi dibuka, `ContentProvider` memuat data berikut secara paralel:

- `GET /api/v1/profile`
- `GET /api/v1/projects`
- `GET /api/v1/posts?limit=50`
- `GET /api/v1/skills`
- `GET /api/v1/experiences`
- `GET /api/v1/education`

Selama memuat, ditampilkan layar loading. Jika gagal, muncul layar error dengan
tombol coba lagi. Setelah data siap, semua halaman memakai data yang sama tanpa
fetch ulang saat berpindah halaman.

Field teks memakai pasangan bahasa `{ id, en }`. Markdown dirender oleh
`react-markdown` sehingga mendukung heading, list, tabel, dan code block.

## Form kontak

Form mengirim `POST /api/v1/contact` dengan field `name`, `email`, `subject`,
`message`, dan honeypot `website`. Status yang ditangani:

- `201` — tampilkan konfirmasi
- `422` — tampilkan error validasi per field
- `429` — tampilkan pesan rate limit
- network error — tampilkan pesan koneksi

## Panel admin

Panel admin adalah SPA lazy-loaded di `/admin/*` dan memakai sesi JWT di cookie
HttpOnly. `ContentProvider` hanya membungkus situs publik, jadi panel tetap bisa
dibuka meskipun konten publik gagal dimuat.

Rute yang tersedia:

- `/admin/login` — login admin
- `/admin` — dasbor (statistik konten + pesan terbaru)
- `/admin/profile` — edit profil, bio, ketersediaan, dan tautan sosial
- `/admin/projects` — daftar proyek, tambah/edit/hapus
- `/admin/posts` — daftar tulisan dengan pagination, tambah/edit/hapus
- `/admin/messages` — inbox pesan kontak, tandai dibaca, balas, hapus

Semua formulir memakai kontrol native: input/textarea, `select`, checkbox, dan
`input[type=file]` untuk unggah gambar (maksimal 5MB, disajikan dari
`/uploads`). Tidak ada dependency form/editor tambahan; pratinjau Markdown
memakai komponen `Markdown` yang sama dengan situs publik.

Formulir bilingual menampilkan field Indonesia dan Inggris berdampingan.
Panel admin punya namespace terjemahan `admin` dan mengikuti toggle bahasa yang
sama dengan situs publik. Error validasi `422` dari API dipetakan ke field
terkait (`error.fields`), dan `401` pada endpoint admin otomatis mengakhiri sesi
lalu mengarahkan ke halaman login.

Perubahan konten baru terlihat di situs publik setelah halaman di-reload, karena
`ContentProvider` menyimpan hasil fetch selama sesi berlangsung.

## Proxy development

Vite mem-proxy request berikut ke backend Go:

- `/api` → `http://localhost:8080/api`
- `/uploads` → `http://localhost:8080/uploads`

Dengan begitu cookie auth tetap same-origin dan gambar upload bisa ditampilkan
tanpa konfigurasi CORS. Proxy yang sama juga dipakai oleh `npm run preview`.

Untuk deployment, cara paling aman adalah menyatukan origin: reverse proxy
`/api` dan `/uploads` dari web server frontend ke backend Go, lalu biarkan
`VITE_API_URL` default `/api/v1`. Jika API benar-benar berada di origin lain,
set `VITE_API_URL` dan tambahkan konfigurasi CORS di backend; CORS belum
diaktifkan saat ini.

## Fitur

- **Dark/light mode** — tersimpan di `localStorage`, mengikuti preferensi sistem
- **Dua bahasa (ID/EN)** — toggle di navbar, tersimpan di `localStorage`
- **Blog markdown** — halaman daftar dan detail
- **Filter proyek** berdasarkan teknologi
- **Form kontak live** ke database
- **Panel admin** — login, profil, proyek, tulisan, dan inbox pesan
- **Unduh CV** — tombol mengarah ke `public/cv.pdf`

## Catatan

- `public/cv.pdf` masih statis. Perbarui manual jika data berubah.
- Konten dikelola lewat panel admin di `/admin` atau langsung lewat API.
- Setelah mengubah konten lewat panel admin, reload situs publik untuk melihat
  data terbaru.
