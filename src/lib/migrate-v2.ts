import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const FACILITIES: { name: string; category: string; sort: number }[] = [
  { name: "Camping Ground Peserta", category: "utama", sort: 1 },
  { name: "Camping Ground Panitia", category: "utama", sort: 2 },
  { name: "Lapangan Upacara", category: "utama", sort: 3 },
  { name: "Anjungan Besar Panitia", category: "utama", sort: 4 },
  { name: "Dapur Umum", category: "utama", sort: 5 },
  { name: "Komplek Pedagang", category: "utama", sort: 6 },
  { name: "Komplek Parkir (Termasuk Keamanan Portal & Parkir Area)", category: "utama", sort: 7 },
  { name: "Mushola Peserta", category: "utama", sort: 8 },
  { name: "Tempat Wudhu", category: "utama", sort: 9 },
  { name: "Toilet Peserta Pria", category: "utama", sort: 10 },
  { name: "Toilet Peserta Wanita", category: "utama", sort: 11 },
  { name: "Toilet Panitia", category: "utama", sort: 12 },
  { name: "Sound System", category: "utama", sort: 13 },
  { name: "Peralatan P3K", category: "utama", sort: 14 },
  { name: "Listrik & Lighting", category: "utama", sort: 15 },
  { name: "Keamanan (Piket Ronda)", category: "utama", sort: 16 },
  { name: "Kayu Bakar", category: "utama", sort: 17 },
  { name: "Tenda (Opsional)", category: "opsional", sort: 18 },
  { name: "Cathering (Opsional)", category: "opsional", sort: 19 },
  { name: "Route Jelajah (Opsional)", category: "opsional", sort: 20 },
  { name: "Pemateri Kepramukaan / Keagamaan", category: "opsional", sort: 21 },
  { name: "Fasilitas / Kebutuhan Lainnya (By request / dapat didiskusikan)", category: "opsional", sort: 22 },
];

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("1. Convert bookings.status to varchar...");
  await sql`ALTER TABLE bookings ALTER COLUMN status DROP DEFAULT`;
  await sql`ALTER TABLE bookings ALTER COLUMN status TYPE varchar(20) USING status::text`;

  console.log("2. Map old statuses...");
  await sql`UPDATE bookings SET status = 'final' WHERE status = 'confirmed'`;
  await sql`UPDATE bookings SET status = 'batal' WHERE status = 'cancelled'`;

  console.log("3. Set new default + check constraint...");
  await sql`ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'negosiasi'`;
  await sql`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check`;
  await sql`ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('final','negosiasi','batal'))`;

  console.log("4. pic_wa nullable...");
  await sql`ALTER TABLE bookings ALTER COLUMN pic_wa DROP NOT NULL`;

  console.log("5. Create facilities table...");
  await sql`CREATE TABLE IF NOT EXISTS facilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    category varchar(20) NOT NULL DEFAULT 'utama',
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`;

  const existing = await sql`SELECT COUNT(*)::int AS cnt FROM facilities`;
  const cnt = (existing[0] as { cnt: number }).cnt;
  if (cnt === 0) {
    console.log("6. Seed default facilities...");
    for (const f of FACILITIES) {
      await sql`INSERT INTO facilities (name, category, sort_order) VALUES (${f.name}, ${f.category}, ${f.sort})`;
    }
  } else {
    console.log(`6. Facilities already has ${cnt} rows, skip seed.`);
  }

  console.log("Migration v2 done.");
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
