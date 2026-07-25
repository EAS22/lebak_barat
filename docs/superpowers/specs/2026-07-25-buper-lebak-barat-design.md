# Design Spec: Landing Page & Booking Management — Bumi Perkemahan Lebak Barat

Date: 2026-07-25
Status: Approved
Domain: lebakbarat.girimulya.com
Location: Desa Girimulya, Kecamatan Banjaran, Kabupaten Majalengka

## 1. Overview
Landing page status booking untuk Buper Lebak Barat. Target utama pihak sekolah (school camp) dengan paket fixed 3 hari 2 malam. Landing menampilkan kalender booking final (read-only) + proses booking via WhatsApp admin. Internal app untuk manage booking date dengan 2 role.

Goals:
- Load cepat, responsive, SEO-friendly static content
- Kalender publik real-time dari DB (hanya status confirmed)
- Dashboard admin eksklusif 1 tanggal = 1 sekolah, anti double-booking
- Deploy Vercel private GH + Neon + DNS redirect

## 2. Architecture & Tech Stack
- **Frontend:** Vite + React + TypeScript + React Router v6, code-split: `/` landing, `/admin/*` dashboard
  - Landing styling: Tailwind CSS v4 custom, tema modern (putih bersih, accent emerald #10b981 / hijau tua, background slate-50, text slate-900) — responsive, no shadcn
  - Dashboard styling: shadcn/ui + Tailwind, lucide-react icons
- **Backend:** Hono v4 di Vercel Functions (`api/**/*.ts`), ESM, `vercel.json` rewrite `/api/*` -> function
- **DB:** Neon Postgres + Drizzle ORM + drizzle-kit migration
- **Auth:** username+password, bcrypt 10 rounds, JWT httpOnly cookie (Secure, SameSite=Lax), exp 12h
- **Validation:** Zod di BE & FE
- **Hosting:** Vercel (private GitHub repo), env: DATABASE_URL, JWT_SECRET, SEED_SUPERADMIN_PASSWORD
- **Domain:** lebakbarat.girimulya.com CNAME to cname.vercel-dns.com

### Project Structure
```
src/
  lib/
    db.ts               drizzle client neon
    schema.ts           users, bookings, settings
    auth.ts             JWT sign/verify, middleware
    validation.ts       zod schemas
  api/
    client.ts           fetch wrapper
  components/
    landing/            Hero, About, CalendarStatus, Facilities, Contact, Footer, Navbar
    ui/                 shadcn components
    admin/              layout, calendar-admin, booking-form, etc.
  pages/
    landing.tsx         composition landing
    admin/
      login.tsx
      dashboard.tsx
      bookings.tsx
      users.tsx
      settings.tsx
  App.tsx               router
api/
  auth/login.ts
  auth/logout.ts
  auth/me.ts
  users/index.ts + [id].ts
  bookings/index.ts + [id].ts + export.ts
  public/bookings.ts
  public/settings.ts
  settings/index.ts
drizzle/
  migrations/
public/images/
```

## 3. Data Model (Neon + Drizzle)
### users
- id uuid PK defaultRandom
- username varchar unique not null (lowercase, 3-50)
- password_hash varchar not null
- role enum: super_admin, booking_admin
- display_name varchar not null
- wa_number varchar nullable (e.g., 628xxxx)
- is_active bool default true
- created_at, updated_at timestamp

Seed: 1 super_admin from env (username superadmin or from env SUPERADMIN_USERNAME). Script `npm run seed`.

Rules: cannot delete self, at least 1 super_admin left, booking_admin cannot manage users/settings.

### bookings
- id uuid PK
- school_name varchar(200) not null
- participant_count int not null >0
- pic_name varchar(100) not null
- pic_wa varchar(20) not null
- start_date date not null
- end_date date not null (BE compute: start_date + 2 days, inclusive 3H2M)
- price bigint nullable (rupiah, >=0)
- status enum: confirmed, cancelled default confirmed
- keterangan text nullable
- created_by uuid FK users.id
- created_at, updated_at

Indexes: (status), (start_date), (end_date), composite (start_date, end_date, status)

Overlap logic (service layer + transaction):
```sql
SELECT id FROM bookings
WHERE status='confirmed'
AND id != :currentId
AND NOT (end_date < :newStart OR start_date > :newEnd)
LIMIT 1
```
If exists -> throw 409 "Tanggal bentrok dengan booking lain".

Pricing: store as bigint (rupiah), FE format IDR.

### settings (singleton id=1)
- id int PK default 1 check id=1
- landing_wa_number varchar not null
- landing_wa_label varchar default 'Admin Booking'
- buper_name varchar default 'Bumi Perkemahan Lebak Barat'
- updated_by uuid FK users nullable
- updated_at timestamp

Public API returns only landing_wa_number, landing_wa_label, buper_name.

## 4. API Design
Base: `/api`

### Auth
- POST /api/auth/login body {username, password} -> 200 set cookie `token=JWT httpOnly Secure SameSite=Lax` + {user}. 401 if fail. Rate limit considerations (simple in-memory).
- POST /api/auth/logout -> clear cookie
- GET /api/auth/me -> need auth, return user
- Middleware `authMiddleware`: verify cookie, attach user to Hono context. Roles: `requireRole('super_admin')`.

### Users (super_admin only)
- GET /api/users -> list, filter is_active
- POST /api/users body {username, password, display_name, wa_number?, role, is_active?} -> 201, hash password
- PATCH /api/users/:id body partial -> update, if password present hash, username uniqueness
- DELETE /api/users/:id -> soft? hard delete allowed but prevent self & last super_admin

Zod: username regex `^[a-z0-9_.-]+$`, password min 6.

### Bookings
Public:
- GET /api/public/bookings?month=YYYY-MM -> validate month param, compute month start/end, return array of {start_date, end_date, status} only confirmed. No school names. Optionally year range.

Admin:
- GET /api/bookings?month=YYYY-MM&status&search&from&to&page&limit -> full data, search school_name/pic_name ILIKE, pagination
- POST /api/bookings body {school_name, participant_count, pic_name, pic_wa, start_date (YYYY-MM-DD), price?, keterangan?, status?} -> BE compute end_date = start+2d, check overlap if confirmed, insert
- PUT /api/bookings/:id body partial -> recalc end if start changed, overlap check
- DELETE /api/bookings/:id -> hard delete, or set cancelled

Export:
- GET /api/bookings/export?from=YYYY-MM-DD&to=YYYY-MM-DD&status -> CSV content-disposition, columns sesuai field custom + dates

All admin routes need auth, booking_admin allowed untuk booking crud, super_admin all.

### Settings
- GET /api/public/settings -> {landing_wa_number, landing_wa_label, buper_name}
- GET /api/settings -> auth super_admin, full
- PUT /api/settings body {landing_wa_number, landing_wa_label?, buper_name?} -> super_admin only, validate WA number

Error format: {error: string, details?: zod issues}. 409 for overlap, 401, 403, 404 consistent.

Security: bcrypt, JWT secret 32+ chars, httpOnly cookie, CORS allow same origin + vercel domains, no credentials in logs, input sanitization via Zod.

## 5. Frontend Design
### Landing Page `/` (custom Tailwind modern, no shadcn)
Theme: modern clean - bg white, slate-50 sections, primary emerald-600 #059669, emerald-700 hover, accent lime-ish, text slate-900, muted slate-600. Max-width 1280, padded.

Sections order:
1. **Navbar** sticky top, backdrop-blur, logo "Buper Lebak Barat" + links anchor #tentang #kalender #fasilitas #kontak + CTA button "Booking WA" -> wa.me/landing_wa_number?text=template
2. **Hero** split: left h1 "Bumi Perkemahan Lebak Barat — Desa Girimulya", subtitle "Tempat ideal school camp 3H2M, aman, lengkap, alam asri", 2 CTAs (Lihat Kalender, Hubungi Admin), right placeholder image/illustration from /public/images/hero.jpg. Stats mini (kapasitas, akses 1 pintu, etc.)
3. **Tentang** 2-col: teks deskripsi buper (lokasi strategis Banjaran Majalengka, cocok sekolah), keunggulan bullet, plus small map link.
4. **Kalender Status Booking** — core feature:
   - Component: month navigator < > + bulan tahun, grid 7-col (Sen-Ming / lokal id-ID)
   - Fetch GET /api/public/bookings?month=YYYY-MM
   - Render: tanggal confirmed = bg-red-500/emerald? choose emerald for booked? Requirement: berwarna. Use red-500 bg + white text for booked to highlight. Today ring.
   - Hover tooltip custom: "Terbooking" only (no school name). Use absolute tooltip div.
   - Marked logic: date in range [start, end] inclusive -> booked.
   - Legend: ● Terbooking (red), ○ Tersedia (white border), Today.
   - Empty/loading skeleton.
   - Below: CTA "Cek ketersediaan & Booking via WhatsApp" -> wa.me/settings_number?text=Halo Admin Buper Lebak Barat, saya ingin cek ketersediaan tanggal...
   - Note: "Kalender menampilkan status final. Booking via WA admin."
5. **Fasilitas Grid** 10 items: gedung serbaguna 2 kamar multi fungsi, dapur umum, ruang logistik, toilet panitia, toilet mck pria, toilet mck wanita, mushola, tempat parkir khusus, area umkm, area aman 1 akses. Cards with icon (lucide: Building, Utensils, Package, Toilet, PersonStanding, Droplets, Church, Car, Store, Shield). Tailwind.
6. **Kontak Admin** center card: WA button besar from settings public, alamat text, jam operasional.
7. **Footer** 3-col: brand + alamat lengkap Desa Girimulya Kecamatan Banjaran Kabupaten Majalengka, links anchor, kontak WA label, copyright.

Behaviors: smooth scroll anchors, mobile hamburger, image lazy, no gallery phase1.

### Dashboard `/admin`
- **/admin/login** shadcn card, form username+password, error, redirect to /admin
- Layout: sidebar shadcn (Dashboard, Bookings, Users (super only), Settings (super only), Logout), header breadcrumb, main.
- **/admin (dashboard):**
  - Stats cards: total confirmed this month, upcoming 7 days, cancelled.
  - CalendarAdmin component: reuse calendar but admin version: shows confirmed emerald, cancelled slate, clickable to edit. Month nav, fetch admin bookings for month (full data). Hover shows school_name + pic. Click -> navigate to edit dialog.
  - Recent bookings table 5 rows.
- **/admin/bookings:**
  - Table shadcn: columns school, peserta, pic, wa, tgl mulai-selesai (render 3H2M), harga IDR, status badge, aksi edit/delete.
  - Filters: search input, month picker, status select, from-to date. Pagination.
  - Add button -> Dialog form.
  - Form: school_name (Input), participant_count (number), pic_name, pic_wa, start_date (Calendar popover), price (number IDR), status (Select), keterangan (Textarea). End date display computed start+2 (readOnly text). Submit Zod.
  - FE overlap pre-check maybe but BE source truth. Show 409 error toast.
  - Delete confirm dialog.
  - Export CSV button -> call /api/bookings/export with current filters, download file.
- **/admin/users** (super_admin guard):
  - Table: username, display_name, wa, role badge, active switch, actions.
  - Add/edit Dialog: username, password (only on create or optional on edit), display_name, wa_number, role select, is_active switch.
- **/admin/settings** (super_admin):
  - Form: landing_wa_number (required, validate 62...), landing_wa_label, buper_name. Save.

Ux: toasts sonner, loading skeletons, empty states, error boundaries, responsive.

## 6. Non-Functional
- Performance: Vite code-split, landing bundle <150kb gz, calendar lightweight, images optimized (webp), lazy.
- Responsive: mobile-first, breakpoints sm/md/lg, touch calendar swipe? phase1 buttons only.
- a11y: semantic, focus, aria for calendar.
- Timezone: WIB Asia/Jakarta, dates stored UTC date-only, FE format id-ID.
- Formatters: IDR currency, date id-ID.

## 7. Deployment & Infra
- Repo private GitHub, branch main auto deploy Vercel.
- vercel.json: {buildCommand: "npm run build", outputDirectory: "dist", functions: {"api/**/*.ts": {runtime: "@vercel/node"}}? Actually use Hono adapter. Use `api/index.ts` single entry using Hono's handle.
Simpler: Single `api/index.ts` exports Hono app handling all routes mounted.
Routes: /api/* -> rewrite to /api/index.ts

- Env vars Vercel: DATABASE_URL (Neon pooled), JWT_SECRET (32+), SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD
- Drizzle: `drizzle.config.ts`, `npm run db:generate`, `db:migrate`, `db:seed`
- Build: `vite build` -> dist, API out via Vercel Functions.
- Domain: lebakbarat.girimulya.com DNS CNAME to cname.vercel-dns.com, add in Vercel dashboard.
- Gallery images: /public/images/hero.jpg etc. Phase1 static. Phase2 ready to plug Vercel Blob via `api/upload` + `@vercel/blob`.
- .gitignore: .env, .vercel, node_modules, drizzler, .superpowers demo.

## 8. Edge Cases & Risks
- Overlap race: use transaction serializable or advisory lock; phase1 simple select then insert but warn.
- Deleted bookings still block? Cancelled tidak block, only confirmed blocks.
- Date inclusive: 3H2M means jika sekolah A start 10 Jan, end 12 Jan, sekolah B boleh start 13 Jan (no overlap). So check inclusive overlap is correct.
- WA number format: store 628xxxx, FE wa.me link uses number without +.
- Last super_admin protection.
- Public bookings leaking school names: ensure public API only returns dates + status, not school names.
- SEO: landing needs meta title/desc, OG.

## 9. Future Phase 2
- Image gallery admin upload via Vercel Blob
- Audit logs
- Rate limit login
- PWA offline calendar?

## 10. Implementation Plan Ref
7 phases: scaffold, db, api, landing, admin dashboard, polish/test, deploy docs.
