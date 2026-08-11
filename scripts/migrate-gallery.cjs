require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS gallery_slots (
    slot_number integer PRIMARY KEY,
    caption varchar(100) NOT NULL DEFAULT '',
    year varchar(10),
    image_base64 text,
    updated_at timestamp DEFAULT now()
  )`;
  for (let i = 1; i <= 8; i++) {
    await sql`INSERT INTO gallery_slots (slot_number, caption, year) VALUES (${i}, ${''}, ${''}) ON CONFLICT (slot_number) DO NOTHING`;
  }
  const rows = await sql`SELECT slot_number, caption FROM gallery_slots ORDER BY slot_number`;
  console.log('gallery_slots', rows);
})();
