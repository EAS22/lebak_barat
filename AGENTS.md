# AGENTS — Aturan Wajib

## Versi (WAJIB)
- Setiap ada perubahan landing page atau aplikasi SaaS superadmin/admin, versi HARUS naik 1 level.
- Contoh: 1.2.1 → 1.2.2 → 1.2.3 seterusnya (patch increment untuk fix/feat kecil, minor untuk feat besar).
- Tempat ubah:
  - `src/lib/version.ts` → `APP_VERSION = "X.Y.Z"`
  - `package.json` → `version: "X.Y.Z"`
  - Sidebar admin & footer landing otomatis baca dari `version.ts`
- Commit message wajib mention bump version.
- Tag git `vX.Y.Z` untuk setiap bump.
- Sebelum push, jalankan `npm run build` untuk memastikan build OK.
- Scripts tersedia: `npm run version:patch|minor|major` yang update kedua file otomatis.

## Build Check
- `npm run build` harus success sebelum push.
- Vercel deploy otomatis dari `main` push.

## Floating Cards Coordination
- `NextEventCard` kiri bawah z-[90], `ShareFloat` kanan bawah z-[88] (z-[92] saat modal open).
- Saat ShareFloat modal open → NextEventCard auto hidden (CustomEvent `sharefloat:open` / `sharefloat:close`).
- Kedua floating harus tidak saling menutupi modal masing-masing.
