import {
  pgTable,
  uuid,
  varchar,
  integer,
  bigint,
  text,
  boolean,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["super_admin", "booking_admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: roleEnum("role").default("booking_admin").notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  waNumber: varchar("wa_number", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolName: varchar("school_name", { length: 200 }).notNull(),
  participantCount: integer("participant_count").notNull(),
  picName: varchar("pic_name", { length: 100 }).notNull(),
  picWa: varchar("pic_wa", { length: 20 }),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
  price: bigint("price", { mode: "number" }),
  status: varchar("status", { length: 20 }).default("negosiasi").notNull(),
  keterangan: text("keterangan"),
  invoiceNumber: varchar("invoice_number", { length: 30 }).unique(),
  invoiceGeneratedAt: timestamp("invoice_generated_at"),
  invoiceGeneratedBy: uuid("invoice_generated_by").references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  institution: varchar("institution", { length: 200 }).notNull(),
  eventName: varchar("event_name", { length: 200 }).notNull(),
  participantCount: integer("participant_count").notNull(),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
  keterangan: text("keterangan"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const facilities = pgTable("facilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 20 }).default("utama").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gallerySlots = pgTable("gallery_slots", {
  slotNumber: integer("slot_number").primaryKey(),
  caption: varchar("caption", { length: 100 }).default("").notNull(),
  year: varchar("year", { length: 10 }),
  imageBase64: text("image_base64"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  landingWaNumber: varchar("landing_wa_number", { length: 20 })
    .default("6280000000000")
    .notNull(),
  landingWaLabel: varchar("landing_wa_label", { length: 100 })
    .default("Admin Booking")
    .notNull(),
  buperName: varchar("buper_name", { length: 100 })
    .default("Bumi Perkemahan Lebak Barat")
    .notNull(),
  letterBody: text("letter_body"),
  letterSeq: integer("letter_seq").default(12),
  signKetua: varchar("sign_ketua", { length: 100 }),
  signSekretaris: varchar("sign_sekretaris", { length: 100 }),
  signKades: varchar("sign_kades", { length: 100 }),
  signDirBumdes: varchar("sign_dirbumdes", { length: 100 }),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const letterRecipients = pgTable("letter_recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  isDefault: boolean("is_default").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const letterArchives = pgTable("letter_archives", {
  id: uuid("id").primaryKey().defaultRandom(),
  nomor: varchar("nomor", { length: 100 }).notNull(),
  seq: integer("seq").notNull(),
  kepada: text("kepada"),
  itemCount: integer("item_count").default(0).notNull(),
  tanggalSurat: date("tanggal_surat").notNull(),
  lampiran: varchar("lampiran", { length: 50 }).default("1 (Satu) Berkas"),
  perihal: varchar("perihal", { length: 200 }).default("Pemberitahuan Kegiatan Perkemahan"),
  itemsJson: text("items_json"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});
