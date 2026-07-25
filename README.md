# Bumi Perkemahan Lebak Barat - Landing & Booking Management

Landing page status booking Buper Lebak Barat, Desa Girimulya, Banjaran, Majalengka. Paket 3H2M, kalender publik read-only dengan hover "Terbooking", booking via WhatsApp, dashboard admin dengan 2 role (`super_admin` / `booking_admin`), exclusive 1 booking per tanggal dengan overlap check 409.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite 6
- **Backend API:** Hono (serverless on Vercel Functions)
- **Database:** PostgreSQL (Neon Serverless) + Drizzle ORM
- **Auth:** JWT (jose) + bcryptjs
- **UI:** Radix UI primitives, Lucide React icons, Sonner toasts
- **Validation:** Zod
- **Deploy:** Vercel (Serverless + SPA rewrites)

## Project Structure

```
.
├── api/
│   └── index.ts              # Hono API entry (Vercel serverless function)
├── public/
│   └── images/               # Static assets (placeholder images)
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── BookingForm.tsx
│   │   │   └── CalendarAdmin.tsx
│   │   ├── landing/
│   │   └── ui/               # shadcn/ui primitives
│   ├── lib/
│   │   ├── adminApi.ts       # Admin API client
│   │   ├── api.ts            # Public API client
│   │   ├── auth.ts           # JWT sign/verify helpers
│   │   ├── db.ts             # Drizzle DB instance
│   │   ├── migrate.ts        # Migration helper
│   │   ├── schema.ts         # Drizzle schema (users, bookings, settings)
│   │   ├── seed.ts           # Seed script (tables + superadmin + settings)
│   │   ├── utils.ts          # Utility helpers
│   │   └── validation.ts     # Zod schemas
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── bookings.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── settings.tsx
│   │   │   └── users.tsx
│   │   └── landing.tsx       # Public landing page + calendar
│   ├── App.tsx               # Router config
│   ├── main.tsx              # React entry
│   └── index.css             # Tailwind entry
├── vercel.json               # Vercel deploy config
├── drizzle.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon) | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | `your-random-secret-at-least-32-chars` |
| `SUPERADMIN_USERNAME` | Seed superadmin username | `admin` |
| `SUPERADMIN_PASSWORD` | Seed superadmin password | `strong-password` |

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill values
cp .env.example .env

# 3. Seed database (creates tables + superadmin + default settings)
npm run seed

# 4. Start dev server (Vite)
npm run dev
```

## Build & Preview

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

## Database

```bash
# Generate migration files (after schema changes)
npx drizzle-kit generate

# Push schema directly (or use seed which handles raw SQL)
npx drizzle-kit push
```

## Deploy to Vercel

1. Push to a **private** GitHub repo (`main` branch) — auto-deploys via Vercel.
2. Vercel project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Set environment variables in Vercel Dashboard (same as `.env`).
4. `vercel.json` handles rewrites:
   - `/api/*` → `/api/index.ts` (serverless Hono function)
   - `/*` → `/index.html` (SPA fallback)
5. Custom domain:
   - `lebakbarat.girimulya.com` → DNS CNAME to `cname.vercel-dns.com`
   - Add domain in Vercel Dashboard → Domains

## Fasilitas Bumi Perkemahan

1. Area perkemahan luas & teduh
2. Toilet & kamar mandi bersih
3. Mushola
4. Aula / pendopo
5. Area parkir kendaraan
6. Air bersih (PDAM + sumur)
7. Penerangan listrik
8. Api unggun area
9. Spot foto & selfie
10. Akses jalan mobil

## Flow

### Public
1. Buka landing page → lihat kalender ketersediaan (read-only)
2. Hover tanggal → tampilkan status "Terbooking" (jika sudah dipesan)
3. Klik "Booking via WA" → redirect ke `wa.me/{landing_wa_number}?text=...`

### Admin
1. Login di `/admin/login` (username + password)
2. Dashboard kalender admin → manage booking (CRUD)
3. Export booking ke CSV
4. Manage users (super_admin only)
5. Settings (WA number landing utama, dst.)

## Phase 2 (Planned)

- Vercel Blob upload untuk galeri foto
