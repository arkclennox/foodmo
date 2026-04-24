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
