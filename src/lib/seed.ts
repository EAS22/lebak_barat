import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  await sql`
    DO $$ BEGIN
      CREATE TYPE role AS ENUM ('super_admin', 'booking_admin');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role role DEFAULT 'booking_admin' NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      wa_number VARCHAR(20),
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_name VARCHAR(200) NOT NULL,
      participant_count INTEGER NOT NULL,
      pic_name VARCHAR(100) NOT NULL,
      pic_wa VARCHAR(20) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      price BIGINT,
      status booking_status DEFAULT 'confirmed' NOT NULL,
      keterangan TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      landing_wa_number VARCHAR(20) DEFAULT '6280000000000' NOT NULL,
      landing_wa_label VARCHAR(100) DEFAULT 'Admin Booking' NOT NULL,
      buper_name VARCHAR(100) DEFAULT 'Bumi Perkemahan Lebak Barat' NOT NULL,
      updated_by UUID REFERENCES users(id),
      updated_at TIMESTAMP DEFAULT now()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_start ON bookings(start_date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_end ON bookings(end_date);`;

  await sql`
    INSERT INTO settings (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING;
  `;

  const superadminPassword = await hash(
    process.env.SUPERADMIN_PASSWORD || "admin123",
    10
  );

  await sql`
    INSERT INTO users (username, password_hash, role, display_name)
    VALUES (
      ${process.env.SUPERADMIN_USERNAME || "admin"},
      ${superadminPassword},
      'super_admin',
      'Super Admin'
    )
    ON CONFLICT (username) DO NOTHING;
  `;

  console.log("Seed done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
