# Design Spec: Landing Page Revamp "Playful Scout" — Buper Lebak Barat

Date: 2026-07-27
Status: Approved

## Goal
Revamp landing page dari style standard menjadi playful scout theme: warna cerah, ornamen perkemahan/pramuka (siluet gunung, pinus, tenda, api unggun, kompas, badge, tali, kontur topografi), full animasi (parallax, floating, scroll reveal, micro-interactions). Admin dashboard TIDAK diubah.

## Palet Warna
- Primary CTA: emerald-600 (#059669) tetap
- Scout green: #2E7D32 (hijau tua heading/footer)
- Tent yellow: #FBC02D (amber-400 accent)
- Campfire orange: #FF7043
- Cream bg: #FFF8E1 (amber-50) section selang-seling
- Sky: gradient #E3F2FD -> #BBDEFB hero
- Text heading: #3E2723 (brown-900), body: slate-700

## Komponen Ornamen Baru (`src/components/landing/ornaments/`)
Semua SVG inline React components, no external images:

1. `MountainDivider.tsx` — siluet gunung 3 layer (untuk hero bottom + section divider), props flip/color
2. `PineDivider.tsx` — barisan pohon pinus siluet wave
3. `TentIllustration.tsx` — tenda segitiga + api unggun di hero, api flicker via CSS animation
4. `CampfireFlame.tsx` — api unggun kecil animasi flicker (untuk kontak)
5. `ScoutBadge.tsx` — emblem lingkaran dengan stitch border (dashed), props icon + label (untuk stats & keunggulan)
6. `RopeBorder.tsx` — SVG tali & simpul dekoratif horizontal
7. `TopoPattern.tsx` — background pattern kontur topografi halus (opacity rendah, absolute)
8. `Stars.tsx` — bintang berkelap-kelip untuk footer (CSS twinkle, random posisi)
9. `CloudsSun.tsx` — awan floating loop + matahari untuk hero sky

## Animasi Engine
- `src/hooks/useReveal.ts` — IntersectionObserver hook: return ref + visible boolean. Support delay via CSS var.
- CSS keyframes di `index.css`: `flicker`, `float`, `drift` (awan), `twinkle`, `spin-slow`, `pulse-soft`, `reveal-up`, `reveal-left`, `reveal-right`, `count-up` handled in JS
- Semua respect `prefers-reduced-motion: reduce` (media query disable animation)
- Parallax hero: mouse move transform layer gunung (translateX kecil), scroll translateY
- Counter stats: count-up JS saat visible

## Section Revamp

### Navbar
- Logo: ikon tenda SVG kecil + teks
- Transparan di atas, scroll > 40px -> bg white/90 blur + shadow (state scrolled)
- Link hover: underline animasi width

### Hero
- BG: sky gradient, CloudsSun (awan drift loop, matahari ray spin-slow)
- MountainDivider 3 layer parallax di bottom
- TentIllustration (tenda + api flicker) di kanan
- Badge "3 Hari 2 Malam" ScoutBadge dengan rotate hover
- Headline font-bold besar brown-900, subtext, 2 CTA (Lihat Kalender emerald, Booking WA amber)
- Stats mini 3 col dengan counter count-up: e.g. "10+ Fasilitas", "1 Akses Aman", "3H2M Paket"

### Divider antar section
- PineDivider / MountainDivider selang-seling warna sesuai bg section berikutnya

### Tentang (bg cream + TopoPattern)
- Reveal left (teks) / right (keunggulan)
- Keunggulan pakai ScoutBadge kecil per item
- Ikon kompas spin on hover

### Kalender
- Card putih dengan RopeBorder di atas card
- Bulan transisi: fade/slide saat ganti bulan
- Day cell hover scale-105, booked tetap red-500 tooltip "Terbooking"
- Reveal-up on scroll

### Fasilitas (bg cream + TopoPattern)
- Card badge-style: rounded-2xl dengan border dashed amber (stitch look), ikon dalam lingkaran emerald-50
- Hover: lift (-translate-y-1) + shadow + slight tilt (rotate-1)
- Scroll reveal stagger: delay bertingkat per index (CSS var --delay)

### Kontak
- Card dengan CampfireFlame kecil di atas
- Tombol WA pulse-soft
- Reveal-up

### Footer
- BG scout green gelap (#1B3A1F / green-950 vibe) dengan Stars twinkle
- PineDivider siluet di atas footer (transisi dari section sebelumnya)
- Tenda kecil dengan lingkaran cahaya amber di dekat brand
- Konten sama: brand+alamat, navigasi, kontak (WA + 3 email)

## Non-Goals
- Admin dashboard tidak berubah
- Tidak ada library animasi eksternal (no framer-motion, no lottie) — CSS + IntersectionObserver only
- Bundle tambahan target < 25kb

## Files
- Create: `src/components/landing/ornaments/*.tsx` (9 files), `src/hooks/useReveal.ts`
- Modify: semua `src/components/landing/*.tsx`, `src/index.css` (keyframes + theme colors), `src/pages/landing.tsx` (divider placement)
