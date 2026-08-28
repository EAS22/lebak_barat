require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  const defaultBody = fs.readFileSync('public/pemberitahuan.md', 'utf-8').trim();

  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS letter_body text`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS sign_ketua varchar(100)`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS sign_sekretaris varchar(100)`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS sign_kades varchar(100)`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS sign_dirbumdes varchar(100)`;
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS letter_seq integer DEFAULT 12`;

  await sql`CREATE TABLE IF NOT EXISTS letter_recipients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    is_default boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp DEFAULT now()
  )`;

  const existing = await sql`SELECT letter_body FROM settings WHERE id=1`;
  if (!existing[0] || !existing[0].letter_body) {
    await sql`UPDATE settings SET letter_body = ${defaultBody}, letter_seq = 12 WHERE id=1`;
    console.log('letter_body seeded');
  } else {
    console.log('letter_body exists');
  }

  const cnt = await sql`SELECT count(*)::int as c FROM letter_recipients`;
  if (cnt[0].c === 0) {
    const defaults = [
      ['Kapolsek Banjaran', 1],
      ['Danramil 1704 Talaga/Banjaran', 2],
      ['Camat Banjaran', 3],
    ];
    for (const [name, order] of defaults) {
      await sql`INSERT INTO letter_recipients (name, is_default, sort_order) VALUES (${name}, true, ${order})`;
    }
    console.log('recipients seeded');
  }

  const settings = await sql`SELECT id, letter_body, letter_seq, sign_ketua, sign_sekretaris, sign_kades, sign_dirbumdes FROM settings WHERE id=1`;
  console.log(settings[0]);
  const recs = await sql`SELECT * FROM letter_recipients ORDER BY sort_order`;
  console.log(recs);
})();
