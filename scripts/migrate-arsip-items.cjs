require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE letter_archives ADD COLUMN IF NOT EXISTS items_json text`;
  await sql`ALTER TABLE letter_archives ADD COLUMN IF NOT EXISTS lampiran varchar(50) DEFAULT '1 (Satu) Berkas'`;
  await sql`ALTER TABLE letter_archives ADD COLUMN IF NOT EXISTS perihal varchar(200) DEFAULT 'Pemberitahuan Kegiatan Perkemahan'`;
  const rows = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='letter_archives' ORDER BY ordinal_position`;
  console.log(rows.map(r=>r.column_name));
})();
