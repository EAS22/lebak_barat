require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE facilities ADD COLUMN IF NOT EXISTS icon varchar(50)`;
  const rows = await sql`SELECT id, name, icon FROM facilities ORDER BY sort_order LIMIT 5`;
  console.log(rows);
})();
