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

export const bookingStatusEnum = pgEnum("booking_status", [
  "confirmed",
  "cancelled",
]);

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
  picWa: varchar("pic_wa", { length: 20 }).notNull(),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
  price: bigint("price", { mode: "number" }),
  status: bookingStatusEnum("status").default("confirmed").notNull(),
  keterangan: text("keterangan"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
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
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});
