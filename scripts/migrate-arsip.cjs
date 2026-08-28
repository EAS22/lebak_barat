require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
(async () => {
  const sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS letter_archives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor varchar(100) NOT NULL,
    seq integer NOT NULL,
    kepada text,
    item_count integer DEFAULT 0 NOT NULL,
    tanggal_surat date NOT NULL,
    created_by uuid REFERENCES users(id),
    created_at timestamp DEFAULT now()
  )`;
  const rows = await sql`SELECT * FROM letter_archives ORDER BY seq DESC LIMIT 5`;
  console.log('letter_archives', rows);
  const inv = await sql`SELECT id, invoice_number, invoice_generated_at FROM bookings WHERE invoice_number IS NOT NULL ORDER BY invoice_generated_at DESC LIMIT 3`;
  console.log('invoices', inv);
})();
