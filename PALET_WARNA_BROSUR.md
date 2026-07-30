# Palet Warna & Panduan Desain — Bumi Perkemahan Lebak Barat
> Untuk brosur, pamflet, dan materi cetak. Diselaraskan dengan landing page https://lebakbarat.girimulya.com

**Font:** Inter (Google Fonts) — 400/500/600/700/800
**Tema:** Playful Scout — ceria outdoor, kaki Gunung Ciremai, pramuka & school camp

---

## 1. Palet Utama

| Role | Token | HEX | Tailwind | Penggunaan |
|---|---|---|---|---|
| **Hijau Utama** | primary | `#059669` | `emerald-600` | CTA utama "Lihat Kalender", tombol Login, ikon, badge sekolah, hover link |
| **Hijau Scout Tua** | scout | `#2E7D32` | `green-800` custom | Heading besar, divider gunung/pinus, footer hutan malam base |
| **Hijau Gelap Footer** | scout-dark | `#14301c` | `#14301c` custom | Footer background gradient start, admin sidebar |
| **Kuning Tenda** | tent | `#FBC02D` | `amber-400` | CTA Booking WA secondary, badge 3H2M, border jahitan, glow logo footer |
| **Oranye Api Unggun** | campfire | `#FF7043` | `orange-400` | Detail ikon kecil, ornamen flame (jarang, accent) |
| **Krem Hangat** | cream | `#FFF8E1` | `amber-50` / `#FFF8E1` | Background section selang-seling About, Profil, Fasilitas (hangat outdoor) |
| **Coklat Tua** | brown | `#3E2723` | `brown` custom | Judul section, tooltip kalender, subheading penting |

### Varian Emerald (untuk gradasi & state)

- `emerald-50 #ecfdf5` — BG ikon fasilitas, summary "Hari Tersedia", hover subtle
- `emerald-100 #d1fae5` — Badge Final, badge Pemdes
- `emerald-200 #a7f3d0` — Border card list client, summary border
- `emerald-300 #6ee7b7` — Border card fasilitas, border kalender dashed
- `emerald-500 #10b981` — Ikon aktif, avatar admin
- `emerald-600 #059669` — Primary button, WA button, link email
- `emerald-700 #047857` — Hover primary

### Varian Amber / Kuning (untuk negosiasi & aksen)

- `amber-50 #fffbeb` — Hero bottom gradient, summary negosiasi
- `amber-100 #fef3c7` — Badge "Negosiasi" light, badge Jadwal Kemah pill
- `amber-300/400 #fbbf24 #FBC02D` — Border stitch card, CTA booking

### Netral

- Putih `#FFFFFF` — Card, landing bg utama, navbar scrolled
- Slate-50 `#f8fafc` — BG muted list, skeleton, card social
- Slate-100 `#f1f5f9` — Skeleton loader, hari lewat kalender, border halus
- Slate-200/300 `#e2e8f0 / #cbd5e1` — Border card, legend tersedia
- Slate-400/500 `#94a3b8 / #64748b` — Teks sekunder, deskripsi, placeholder
- Slate-600/700 `#475569 / #334155` — Body text, p keterangan
- Slate-900 `#0f172a` — Teks gelap anti-aliased

### Warna Status Kalender & Booking

| Status | HEX Background | Text | Deskripsi Landing |
|---|---|---|---|
| **Tersedia** | `emerald-50 #ecfdf5` + border `emerald-300` | `emerald-800 #065f46` | Hari bisa dibooking |
| **Negosiasi** | `amber-400 #fbbf24` (solid) | `brown #3E2723` | Lagi proses dengan sekolah lain |
| **Final / Penuh** | `red-500 #ef4444` | putih + label "PENUH" 9px | Sudah terisi fix |
| **Lewat** | `slate-50 #f8fafc` | `slate-300` | Hari sudah lewat |
| **Hari Ini** | ring `amber-400` + offset putih 1px | — | Highlight border |
| **Fix badge** (daftar tahun) | `emerald-100 / amber-100` | `emerald-700 / amber-700` | List kanan kalender: "Final"/"Negosiasi" |
| **Batal** | otomatis jadi hijau Tersedia (tidak dikirim API) | — | Dibatalkan = kembali tersedia |

### Bulan List Client (12 warna badge tanggal)

Untuk card "Sudah Booking {tahun}" — angka tanggal per bulan warna berbeda agar mudah scan:
- Jan sky `bg-sky-100 text-sky-700`, Feb rose, Mar emerald, Apr amber, Mei violet, Jun teal, Jul orange, Agu lime, Sep cyan, Okt fuchsia, Nov indigo, Des red

---

## 2. Background Section Landing (selang-seling)

| Section | BG | Ornamen |
|---|---|---|
| **Hero** | Gradient `from-sky-100 #e0f2fe → to-amber-50 #fffbeb` + awan drift putih + matahari amber spin | `CloudsSun`, `MountainDivider` hijau #A5D6A7 / #66BB6A / #FFF8E1 |
| **Tentang** | `cream #FFF8E1` + pattern kontur topografi hijau #2E7D32 opacity 0.06 | `TopoPattern` |
| **Profil & Sejarah** | `cream #FFF8E1` + TopoPattern, video card border dashed amber-300 | Emblem badge scout |
| **Kalender Jadwal Kemah** | Putih `#FFFFFF` + shadow-lg card border dashed amber-300 | `RopeBorder` dulu ada (now removed), badge amber-100 pill |
| **Daftar Booking Tahun** | Putih, border dashed emerald-300, item slate-50/60 hover emerald | thumb warna bulanan |
| **Fasilitas** | `cream #FFF8E1` + TopoPattern | card putih dashed amber hover emerald |
| **Kontak & Lokasi** | Putih, card denah & kontak putih dashed emerald-300 | `CampfireFlame` flicker |
| **Footer** | Gradient `from-[#14301c] to-[#1b3a24]` hijau hutan malam + bintang twinkle putih + PineDivider | `Stars`, GlowTent amber #FBC02D glow 35% |

### Divider Ornamen
- **MountainDivider** SVG 3 lapis gunung 1440x120 (perserveAspectRatio none) warna `[#A5D6A7, #66BB6A, #2E7D32]` atau `["#FFECB3","#FFE082","#FFF8E1"]` transisi ke cream
- **PineDivider** barisan pinus segitiga 1440x80 tinggi 10-16, warna `#2E7D32`, `#ffffff`, atau `#A5D6A7`

---

## 3. Tombol & Interaksi

| Tombol | Style | Hover |
|---|---|---|
| **Lihat Kalender** (primary) | Putih text, bg `emerald-600 #059669`, rounded-lg | `bg-emerald-700`, lift -2px, shadow glow `rgba(5,150,105,0.25)`, shimmer putih slide 20% |
| **Booking via WhatsApp** (secondary) | Text `brown #3E2723`, bg `tent #FBC02D`, rounded-lg | `amber-400`, lift -2px, shadow amber-400/30, shimmer putih 30%, ikon rotate 12° + scale 1.1, pulse-soft |
| **Navbar Login** | Putih text, bg `emerald-600` | `emerald-700` |
| **Kontak WA modal** | Gold amber `bg-tent #FBC02D` text `brown` bold | `amber-400`, shadow-md→lg |
| **Badge "Fix/Final"** | `emerald-100 / amber-100` + text 700 | — |

### Animasi Keyframes (CSS di `index.css`)

- `flicker` — api unggun skala + rotasi kecil 1.6s infinite
- `drift` — awan -8% → 108% linear 60-90s loop
- `floaty` — tenda/logo mengambang translateY 0→-8px 5s
- `twinkle` — bintang 0.25→1 opacity 2.4s
- `spin-slow` — matahari ray 360° 24s linear
- `pulse-soft` — shadow emeral 0→12px 2.4s out (untuk WA button)
- `reveal` — fade up/slide left/right 0.7s ease + stagger `--delay`

---

## 4. Komponen Elemen Landing

| Elemen | Warna / Style |
|---|---|
| **Navbar logo** | `h-10` img drop-shadow-sm, text brand `brown` bold + truncate |
| **ScoutBadge** | Lingkaran 40-56px, border dashed (jahitan) amber-300, ikon `emerald-600`, label opsional di bawah |
| **TentIllustration** | Tenda segitiga amber #FBC02D + outline brown bolder, api flicker tengah, pohon pinus kecil hijau |
| **CampfireFlame** | Batang coklat + flame oranye/amber dengan `anim-flicker` |
| **RopeBorder** | Dulu di kalender (now removed), tali coklat #8D6E63 + simpul |
| **TopoPattern** | Pattern SVG kontur gelombang irregular, stroke #2E7D32, opacity 0.06, pointer-events-none |
| **Stars** | 24 titik putih r 1-2 random pos, `anim-twinkle` delay random 0-2s |
| **CloudsSun** | Matahari bulat #FBC02D r26 + 12 ray stroke #FBC02D, awan ellipse putih opacity 0.9 |
| **Facility Card** | `grid 2→5 kolom`, putih, rounded-xl border-2 dashed amber-300 hover emerald-400, ikon bulat `emerald-50 → emerald-600 hover putih` scale 110%, teks `brown 14px bold` + desc `slate-500 12px`, badge opsional `emerald-50 text-emerald-600 10px` |
| **Contact WA modal** | Putih rounded-2xl shadow-2xl border-2 dashed amber-300, CampfireFlame 44px top, list admin card `emerald-50 border-emerald-200 hover emerald-100/300` + avatar bulat emerald-600 + UserRound icon |
| **Denah card** | Putih dashed emerald-300, gambar `object-cover` fill full no gap, bg `white` seamless, border amber-200, zoom modal black/80 backdrop |
| **Footer email** | Umum lebakbarat@girimulya.com + Booking booking.lebakbarat@girimulya.com, hover putih, text 14px, sosmed card slate-50/60 hover emerald border |
| **Social cards** | Ikon gradient `from-emerald-500 to-emerald-700` bulat 36px, label `brown 14px bold` + desc `slate-500 12px` |

---

## 5. Admin SaaS (superadmin/admin)

- **Font:** Inter sama (di `index.html` link Google Fonts)
- **Sidebar:** Gradient `from-[#14301c] to-[#1b3a24]`, text `emerald-100 #d1fae5`, active `bg-emerald-500/20 white + left bar 4px rounded-r emerald-400`
- **Sidebar collapse:** w-64 → w-[68px], icon only + title tooltip, localStorage key `buper_sidebar_collapsed`
- **Avatar admin:** Circle `emerald-500 #10b981` bg putih text, initials 2 huruf uppercase dari displayName/username, header chip sama di top-right
- **Header:** Putih border-b, tinggi 64px, fixed (h-screen flex layout, main `flex-1 overflow-y-auto`)
- **Main BG:** `slate-50/80 #f8fafc 80%`
- **Status badge admin:** Final `emerald-100 text-emerald-700 border-emerald-200`, Negosiasi `amber-100 amber-700 amber-200`, Batal `slate-100 slate-500 slate-200`
- **CalendarAdmin cell:** Final `emerald-500 text-white`, Negosiasi `amber-400 text-brown`, Batal `slate-300 slate-600 line-through`

---

## 6. Panduan untuk Brosur Cetak

### Rekomendasi Kombinasi Brosur

- **Header / Hero Brosur:** Background forest green gelap `#14301c` + teks putih + aksen tenda kuning `#FBC02D` untuk judul
- **Badge & Emblem:** Gunakan style ScoutBadge — lingkaran dashed amber-300 di Illustrator/Canva (stroke dash 6-4)
- **Pemisah section brosur:** Pakai siluet gunung atau pinus (export SVG MountainDivider)
- **Tabel fasilitas:** Gunakan border dashed amber-300 halus, seperti card landing, grouping Utama vs Opsional beda warna header
- **QR Code ke WhatsApp:** Linkkan ke `https://wa.me/{nomor}?text=...` — pakai salah satu admin dari `/api/public/contacts`
- **QR Code ke Maps:** Link `https://maps.app.goo.gl/K9xTHjgc4boF3YQu5`

### Warna CMYK Approximation (untuk cetak)

- Emerald #059669 ≈ C 82 M 0 Y 70 K 8
- Scout Green #2E7D32 ≈ C 78 M 0 Y 78 K 51
- Tent Yellow #FBC02D ≈ C 0 M 22 Y 84 K 0
- Brown #3E2723 ≈ C 0 M 23 Y 33 K 76 / K 85
- Cream #FFF8E1 ≈ C 0 M 3 Y 12 K 0 (background)

### Pantone Reference (nearest)

- Emerald 7725 C / Green 7726
- Scout Green 349 C
- Tent Yellow 123 C (atau 14-0846 TCX)
- Brown 476 C

### Tip Cetak

- Jangan pakai terlalu banyak emoji — gunakan ikon lucide style outline (Tenda, Api Unggun, Kompas, Sekolah, Pohon Pinus, Tenda Kemah)
- Untuk kertas: gunakan matte textured / kraft untuk kesan outdoor, bukan glossy
- Logo: gunakan `public/images/logo.png` asli, background transparan (PNG 192KB) — hindari JPG dengan background putih menempel

---

## 7. Asset Path

- Logo: `public/images/logo.png` (192KB, 896px-ish, ada drop-shadow amber glow di footer)
- Denah: `public/images/denah.png` (674KB 896x1200, 3:4 portrait, cover di card kontak)
- Favicon / OG: `/images/logo.png` — sudah di `index.html` + `og:image https://lebakbarat.girimulya.com/images/logo.png`

## 8. Link Penting

- Landing: https://lebakbarat.girimulya.com / https://lebak-barat.vercel.app
- API public: `/api/public/settings`, `/api/public/bookings?month=YYYY-MM`, `/api/public/bookings/year?year=YYYY`, `/api/public/contacts`, `/api/public/facilities`
- Admin: `/admin/login` → `superadmin` etc.

---

_Siapkan materi brosur dengan warna di atas agar senada landing. Jika butuh file .ASE, .JSON palet, atau Figma style export, minta formatnya._

_Dokumen ini sengaja tidak di-push ke repo (ada di .gitignore). Hanya local untuk kebutuhan brosur._
