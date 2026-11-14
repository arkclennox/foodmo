# Direktori Kuliner

Direktori restoran, cafe, dan warung makan Indonesia — Next.js 15 App Router + Prisma.

Setup:

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Buka http://localhost:3000. Admin di `/admin/login` dengan kredensial dari `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Hosting: situs statis di Cloudflare

Situs publik (foodmo.id) adalah **static export**. Semua halaman dibuat saat build lalu dilayani sebagai *static assets* Cloudflare Workers. Tidak ada Worker script yang berjalan, jadi tidak ada batas CPU atau kuota permintaan. Admin dan API **tidak** ikut dipublikasikan: keduanya hanya berjalan di komputer Anda.

### Mengelola konten

1. Buat `.env.local` berisi variabel production (`DATABASE_URL`, `R2_*`, `ADMIN_SESSION_SECRET`, `JWT_SECRET`, `API_KEY_HASH_SECRET`, serta `NEXT_PUBLIC_SITE_URL=https://www.foodmo.id` dan `NEXT_PUBLIC_GA_ID`).
2. Jalankan `npm run dev`, buka http://localhost:3000/admin, lalu edit listing atau artikel seperti biasa. Data langsung tersimpan di database Supabase.
3. Terbitkan perubahan ke situs:

   ```bash
   npm run deploy:static
   ```

   Perintah ini menjalankan `build:static` (membuat ./out dari database, sekitar 10–15 menit untuk ±5.000 listing), lalu `wrangler deploy`. Sekali di komputer ini, jalankan dulu `npx wrangler login`.

### Catatan

- Pencarian, filter, dan pagination di `/tempat-makan`, `/kota/*`, `/kategori/*`, dan `/blog` berjalan di browser. Halaman pertama ada di HTML; filter lain memakai `/data/listings.json`.
- Form kontak membuka aplikasi email pengunjung (mailto ke hello@foodmo.id), karena tidak ada server untuk menerima form.
- `scripts/build-static.mjs` memindahkan sementara `src/app/admin`, `src/app/api`, dan `src/middleware.ts` selama build, lalu selalu mengembalikannya. Kalau build terputus di tengah jalan, jalankan lagi dan file akan dipulihkan otomatis.
- Domain: `www.foodmo.id` adalah custom domain Worker `foodmo-web` (lihat `wrangler.jsonc`). `foodmo.id` dialihkan (301) ke www oleh Worker kecil di `cloudflare/apex-redirect/`, yang di-deploy dengan `npx wrangler deploy -c cloudflare/apex-redirect/wrangler.jsonc`.
- Batas paket gratis Cloudflare: 20.000 file per deploy. Saat ini sekitar 12.100 file (2 file per listing).
