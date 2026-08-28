import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
} from "./_lib/auth.js";
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  bookingSchema,
  bookingUpdateSchema,
  settingsSchema,
  facilitySchema,
  facilityUpdateSchema,
  eventSchema,
  eventUpdateSchema,
} from "./_lib/validation.js";

type AuthUser = { id: string; username: string; role: string };

type AppEnv = {
  Variables: { user: AuthUser };
};

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

const app = new Hono<AppEnv>();

function addDaysStr(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0]!;
}

async function getAuthUser(c: {
  req: { raw: Request };
}): Promise<AuthUser | null> {
  const token = getCookie(c as Parameters<typeof getCookie>[0], "token");
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

async function requireAuth(
  c: { req: { raw: Request }; set: (k: string, v: unknown) => void; json: (data: unknown, status?: number) => Response },
  next: () => Promise<void>
) {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  c.set("user", user);
  await next();
}

async function requireSuper(
  c: { get: (k: string) => unknown; json: (data: unknown, status?: number) => Response },
  next: () => Promise<void>
) {
  const user = c.get("user") as AuthUser;
  if (user.role !== "super_admin")
    return c.json({ error: "Forbidden" }, 403);
  await next();
}

// ─── Public ──────────────────────────────────────────────────────

app.get("/api/public/facilities", async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT id, name, category, sort_order, icon FROM facilities WHERE is_active = true ORDER BY sort_order, created_at`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/settings", async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT landing_wa_number, landing_wa_label, buper_name FROM settings WHERE id = 1`;
    const row = rows[0];
    if (!row) {
      return c.json({
        landing_wa_number: "6280000000000",
        landing_wa_label: "Admin Booking",
        buper_name: "Bumi Perkemahan Lebak Barat",
      });
    }
    return c.json(row);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/contacts", async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT display_name, wa_number FROM users WHERE role = 'booking_admin' AND is_active = true AND wa_number IS NOT NULL AND wa_number != '' ORDER BY created_at`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/bookings/year", async (c) => {
  try {
    const sql = getSql();
    const year = c.req.query("year");
    if (!year || !/^\d{4}$/.test(year)) {
      return c.json({ error: "Parameter year harus format YYYY" }, 400);
    }
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const rows = await sql`SELECT id, school_name, start_date, end_date, status FROM bookings WHERE status IN ('final','negosiasi') AND start_date >= ${yearStart} AND start_date <= ${yearEnd} ORDER BY start_date`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/events", async (c) => {
  try {
    const sql = getSql();
    const month = c.req.query("month");
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return c.json({ error: "Parameter month harus format YYYY-MM" }, 400);
    }
    if (month) {
      const [y, m] = month.split("-").map(Number);
      const monthStart = `${month}-01`;
      const lastDay = new Date(y!, m!, 0).getUTCDate();
      const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;
      const rows = await sql`SELECT id, institution, event_name, start_date, end_date FROM events WHERE NOT (end_date < ${monthStart} OR start_date > ${monthEnd}) ORDER BY start_date`;
      return c.json(rows);
    }
    const rows = await sql`SELECT id, institution, event_name, start_date, end_date FROM events ORDER BY start_date`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/events/year", async (c) => {
  try {
    const sql = getSql();
    const year = c.req.query("year");
    if (!year || !/^\d{4}$/.test(year)) {
      return c.json({ error: "Parameter year harus format YYYY" }, 400);
    }
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const rows = await sql`SELECT id, institution, event_name, start_date, end_date FROM events WHERE start_date >= ${yearStart} AND start_date <= ${yearEnd} ORDER BY start_date`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/bookings", async (c) => {
  try {
    const sql = getSql();
    const month = c.req.query("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return c.json({ error: "Parameter month harus format YYYY-MM" }, 400);
    }
    const [y, m] = month.split("-").map(Number);
    const monthStart = `${month}-01`;
    const lastDay = new Date(y!, m!, 0).getUTCDate();
    const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;

    const rows = await sql`SELECT id, start_date, end_date, status FROM bookings WHERE status IN ('final','negosiasi') AND NOT (end_date < ${monthStart} OR start_date > ${monthEnd}) ORDER BY start_date`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/verify-invoice", async (c) => {
  try {
    const sql = getSql();
    const number = (c.req.query("number") || "").trim().toUpperCase();
    if (!number) {
      return c.json({ error: "Nomor invoice wajib diisi" }, 400);
    }
    const rows = await sql`SELECT
      b.id, b.invoice_number, b.school_name, b.participant_count,
      b.pic_name, b.start_date, b.end_date, b.status, b.price,
      b.invoice_generated_at, b.created_at,
      u.display_name AS generated_by_name
    FROM bookings b
    LEFT JOIN users u ON b.invoice_generated_by = u.id
    WHERE b.invoice_number = ${number}
    LIMIT 1`;

    if (rows.length === 0) {
      return c.json({ verified: false, message: "Invoice tidak ditemukan" }, 404);
    }

    const r = rows[0] as Record<string, unknown>;
    return c.json({
      verified: true,
      invoice_number: r.invoice_number,
      school_name: r.school_name,
      participant_count: r.participant_count,
      pic_name: r.pic_name,
      start_date: r.start_date,
      end_date: r.end_date,
      status: r.status,
      price: r.price,
      invoice_generated_at: r.invoice_generated_at,
      generated_by_name: r.generated_by_name,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

// ─── Auth ────────────────────────────────────────────────────────

app.post("/api/auth/login", async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const { username, password } = parsed.data;

    const rows = await sql`SELECT * FROM users WHERE username = ${username}`;
    const user = rows[0] as Record<string, unknown> | undefined;
    if (!user) return c.json({ error: "Username atau password salah" }, 401);
    if (!user.is_active)
      return c.json({ error: "Akun tidak aktif" }, 403);

    const ok = await verifyPassword(password, user.password_hash as string);
    if (!ok) return c.json({ error: "Username atau password salah" }, 401);

    const token = await signToken({
      id: user.id as string,
      username: user.username as string,
      role: user.role as string,
    });

    setCookie(c, "token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return c.json({
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/auth/logout", (c) => {
  deleteCookie(c, "token", { path: "/" });
  return c.json({ ok: true });
});

app.get("/api/auth/me", async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  return c.json(user);
});

// ─── Bookings (admin) ────────────────────────────────────────────

app.get("/api/bookings", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const month = c.req.query("month");
    const search = c.req.query("search");
    const status = c.req.query("status");
    const from = c.req.query("from");
    const to = c.req.query("to");
    const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conds: string[] = [];
    const vals: unknown[] = [];

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split("-").map(Number);
      const monthStart = `${month}-01`;
      const lastDay = new Date(y!, m!, 0).getUTCDate();
      const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;
      vals.push(monthEnd, monthStart);
      conds.push(`start_date <= $${vals.length - 1} AND end_date >= $${vals.length}`);
    }

    if (search) {
      vals.push(`%${search}%`, `%${search}%`);
      conds.push(`(school_name ILIKE $${vals.length - 1} OR pic_name ILIKE $${vals.length})`);
    }

    if (status) {
      vals.push(status);
      conds.push(`status = $${vals.length}`);
    }

    if (from && to) {
      vals.push(from, to);
      conds.push(`start_date >= $${vals.length - 1} AND end_date <= $${vals.length}`);
    }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

    const countRow = await sql.query(`SELECT COUNT(*)::int AS total FROM bookings ${where}`, vals);
    const total = (countRow[0] as Record<string, unknown>)?.total as number ?? 0;

    vals.push(limit, offset);
    const rows = await sql.query(
      `SELECT * FROM bookings ${where} ORDER BY start_date DESC LIMIT $${vals.length - 1} OFFSET $${vals.length}`,
      vals
    );

    return c.json({ data: rows, page, limit, total });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/bookings", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;
    const endDate = addDaysStr(d.startDate, 2);
    const status = d.status ?? "negosiasi";

    if (status === "final" || status === "negosiasi") {
      const overlap = await sql`SELECT id, status, school_name FROM bookings WHERE status IN ('final','negosiasi') AND NOT (end_date < ${d.startDate} OR start_date > ${endDate}) LIMIT 1`;
      if (overlap.length > 0) {
        const existing = overlap[0] as { status: string; school_name: string };
        return c.json(
          {
            error: `Tanggal bentrok dengan booking ${existing.status} lain (${existing.school_name}). 1 sesi 3 hari 2 malam tidak boleh tumpang tindih.`,
          },
          409
        );
      }
      const eventOverlap = await sql`SELECT id, event_name, institution FROM events WHERE NOT (end_date < ${d.startDate} OR start_date > ${endDate}) LIMIT 1`;
      if (eventOverlap.length > 0) {
        const ev = eventOverlap[0] as { event_name: string; institution: string };
        return c.json(
          {
            error: `Tanggal bentrok dengan event internal "${ev.event_name}" (${ev.institution}). Tanggal tersebut tidak tersedia untuk booking.`,
          },
          409
        );
      }
    }

    const user = c.get("user") as AuthUser;
    const rows = await sql`INSERT INTO bookings (school_name, participant_count, pic_name, pic_wa, start_date, end_date, price, status, keterangan, created_by) VALUES (${d.schoolName}, ${d.participantCount}, ${d.picName}, ${d.picWa}, ${d.startDate}, ${endDate}, ${d.price ?? null}, ${status}, ${d.keterangan ?? null}, ${user.id}) RETURNING *`;
    return c.json(rows[0], 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.put("/api/bookings/:id", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = bookingUpdateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;

    const curRows = await sql`SELECT * FROM bookings WHERE id = ${id}`;
    const cur = curRows[0] as Record<string, unknown> | undefined;
    if (!cur) return c.json({ error: "Booking tidak ditemukan" }, 404);

    const newStart = d.startDate ?? (cur.start_date as string);
    let newEnd = cur.end_date as string;
    if (d.startDate) newEnd = addDaysStr(d.startDate, 2);

    const newStatus = d.status ?? (cur.status as string);

    if (newStatus === "final" || newStatus === "negosiasi") {
      if (newStatus === "final") {
        const effectivePicWa =
          d.picWa !== undefined ? d.picWa : (cur.pic_wa as string | null);
        if (!effectivePicWa || effectivePicWa.length < 8) {
          return c.json(
            { error: "No. WhatsApp PIC wajib diisi untuk status Final" },
            400
          );
        }
      }
      const overlap = await sql`SELECT id, status, school_name FROM bookings WHERE id != ${id} AND status IN ('final','negosiasi') AND NOT (end_date < ${newStart} OR start_date > ${newEnd}) LIMIT 1`;
      if (overlap.length > 0) {
        const existing = overlap[0] as { status: string; school_name: string };
        return c.json(
          {
            error: `Tanggal bentrok dengan booking ${existing.status} lain (${existing.school_name}). 1 sesi 3 hari 2 malam tidak boleh tumpang tindih.`,
          },
          409
        );
      }
      const eventOverlap = await sql`SELECT id, event_name, institution FROM events WHERE NOT (end_date < ${newStart} OR start_date > ${newEnd}) LIMIT 1`;
      if (eventOverlap.length > 0) {
        const ev = eventOverlap[0] as { event_name: string; institution: string };
        return c.json(
          {
            error: `Tanggal bentrok dengan event internal "${ev.event_name}" (${ev.institution}).`,
          },
          409
        );
      }
    }

    const sets: string[] = [];
    const vals: unknown[] = [];

    if (d.schoolName !== undefined) { vals.push(d.schoolName); sets.push(`school_name = $${vals.length}`); }
    if (d.participantCount !== undefined) { vals.push(d.participantCount); sets.push(`participant_count = $${vals.length}`); }
    if (d.picName !== undefined) { vals.push(d.picName); sets.push(`pic_name = $${vals.length}`); }
    if (d.picWa !== undefined) { vals.push(d.picWa); sets.push(`pic_wa = $${vals.length}`); }
    if (d.startDate !== undefined) { vals.push(d.startDate); sets.push(`start_date = $${vals.length}`); vals.push(newEnd); sets.push(`end_date = $${vals.length}`); }
    if (d.price !== undefined) { vals.push(d.price ?? null); sets.push(`price = $${vals.length}`); }
    if (d.status !== undefined) { vals.push(d.status); sets.push(`status = $${vals.length}`); }
    if (d.keterangan !== undefined) { vals.push(d.keterangan ?? null); sets.push(`keterangan = $${vals.length}`); }

    sets.push(`updated_at = now()`);

    if (sets.length === 1) {
      const rows = await sql`SELECT * FROM bookings WHERE id = ${id}`;
      return c.json(rows[0]);
    }

    vals.push(id);
    const rows = await sql.query(
      `UPDATE bookings SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.delete("/api/bookings/:id", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    await sql`DELETE FROM bookings WHERE id = ${id}`;
    return c.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/bookings/export", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const from = c.req.query("from");
    const to = c.req.query("to");
    const status = c.req.query("status");

    const conds: string[] = [];
    const vals: unknown[] = [];
    if (from) { vals.push(from); conds.push(`start_date >= $${vals.length}`); }
    if (to) { vals.push(to); conds.push(`end_date <= $${vals.length}`); }
    if (status) { vals.push(status); conds.push(`status = $${vals.length}`); }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const rows = await sql.query(
      `SELECT school_name, participant_count, pic_name, pic_wa, start_date, end_date, price, status, keterangan, created_at FROM bookings ${where} ORDER BY start_date DESC`,
      vals
    );

    const header = "school_name,participant_count,pic_name,pic_wa,start_date,end_date,price,status,keterangan,created_at";
    const csvLines = rows.map((r: Record<string, unknown>) =>
      [
        r.school_name,
        r.participant_count,
        r.pic_name,
        r.pic_wa,
        r.start_date,
        r.end_date,
        r.price ?? "",
        r.status,
        r.keterangan ?? "",
        r.created_at,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...csvLines].join("\n");

    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", "attachment; filename=bookings.csv");
    return c.body(csv);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/bookings/:id/invoice", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");

    const curRows = await sql`SELECT * FROM bookings WHERE id = ${id}`;
    const cur = curRows[0] as Record<string, unknown> | undefined;
    if (!cur) return c.json({ error: "Booking tidak ditemukan" }, 404);

    const missing: string[] = [];
    if (!cur.participant_count || (cur.participant_count as number) <= 0) missing.push("Jumlah siswa");
    if (!cur.pic_name || String(cur.pic_name).trim().length < 2) missing.push("Nama PIC");
    if (!cur.pic_wa || String(cur.pic_wa).trim().length < 8) missing.push("Kontak PIC");
    if (cur.price === null || cur.price === undefined) missing.push("Harga sewa");

    if (missing.length > 0) {
      return c.json(
        {
          error: "Data belum lengkap untuk invoice",
          missing,
        },
        422
      );
    }

    if (cur.invoice_number) {
      return c.json({
        invoice_number: cur.invoice_number,
        school_name: cur.school_name,
        participant_count: cur.participant_count,
        pic_name: cur.pic_name,
        pic_wa: cur.pic_wa,
        start_date: cur.start_date,
        end_date: cur.end_date,
        status: cur.status,
        price: cur.price,
        invoice_generated_at: cur.invoice_generated_at,
      });
    }

    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    let invoiceNumber: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      const candidate = `INV-LB-${yyyymm}-${rand}`;
      try {
        const user = c.get("user") as AuthUser;
        const rows = await sql`UPDATE bookings SET invoice_number = ${candidate}, invoice_generated_at = now(), invoice_generated_by = ${user.id}, updated_at = now() WHERE id = ${id} AND invoice_number IS NULL RETURNING invoice_number, school_name, participant_count, pic_name, pic_wa, start_date, end_date, status, price, invoice_generated_at`;
        if (rows.length > 0) {
          invoiceNumber = candidate;
          return c.json(rows[0]);
        }
        const existing = await sql`SELECT invoice_number, school_name, participant_count, pic_name, pic_wa, start_date, end_date, status, price, invoice_generated_at FROM bookings WHERE id = ${id}`;
        if (existing.length > 0) return c.json(existing[0]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (!msg.includes("unique") && !msg.includes("duplicate")) throw e;
      }
    }

    if (!invoiceNumber) {
      return c.json({ error: "Gagal generate nomor invoice, coba lagi" }, 500);
    }

    return c.json({ invoice_number: invoiceNumber });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

// ─── Events (admin) — internal, block booking ─────────────────────

app.get("/api/events", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const month = c.req.query("month");
    const search = c.req.query("search");
    const from = c.req.query("from");
    const to = c.req.query("to");
    const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conds: string[] = [];
    const vals: unknown[] = [];

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const monthStart = `${month}-01`;
      const lastDay = new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getUTCDate();
      const monthEnd = `${month}-${String(lastDay).padStart(2, "0")}`;
      vals.push(monthEnd, monthStart);
      conds.push(`start_date <= $${vals.length - 1} AND end_date >= $${vals.length}`);
    }
    if (search) {
      vals.push(`%${search}%`, `%${search}%`);
      conds.push(`(institution ILIKE $${vals.length - 1} OR event_name ILIKE $${vals.length})`);
    }
    if (from && to) {
      vals.push(from, to);
      conds.push(`start_date >= $${vals.length - 1} AND end_date <= $${vals.length}`);
    }

    const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
    const countRow = await sql.query(`SELECT COUNT(*)::int AS total FROM events ${where}`, vals);
    const total = (countRow[0] as Record<string, unknown>)?.total as number ?? 0;

    vals.push(limit, offset);
    const rows = await sql.query(
      `SELECT * FROM events ${where} ORDER BY start_date DESC LIMIT $${vals.length - 1} OFFSET $${vals.length}`,
      vals
    );
    return c.json({ data: rows, page, limit, total });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/events", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;
    const endDate = d.endDate ?? addDaysStr(d.startDate, 2);

    const overlapBooking = await sql`SELECT id, school_name, status FROM bookings WHERE status IN ('final','negosiasi') AND NOT (end_date < ${d.startDate} OR start_date > ${endDate}) LIMIT 1`;
    if (overlapBooking.length > 0) {
      const ex = overlapBooking[0] as { school_name: string; status: string };
      return c.json({ error: `Tanggal bentrok dengan booking ${ex.status} (${ex.school_name})` }, 409);
    }
    const overlapEvent = await sql`SELECT id, event_name FROM events WHERE NOT (end_date < ${d.startDate} OR start_date > ${endDate}) LIMIT 1`;
    if (overlapEvent.length > 0) {
      const ev = overlapEvent[0] as { event_name: string };
      return c.json({ error: `Tanggal bentrok dengan event lain (${ev.event_name})` }, 409);
    }

    const user = c.get("user") as AuthUser;
    const rows = await sql`INSERT INTO events (institution, event_name, participant_count, start_date, end_date, keterangan, created_by) VALUES (${d.institution}, ${d.eventName}, ${d.participantCount}, ${d.startDate}, ${endDate}, ${d.keterangan ?? null}, ${user.id}) RETURNING *`;
    return c.json(rows[0], 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.put("/api/events/:id", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = eventUpdateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;

    const curRows = await sql`SELECT * FROM events WHERE id = ${id}`;
    const cur = curRows[0] as Record<string, unknown> | undefined;
    if (!cur) return c.json({ error: "Event tidak ditemukan" }, 404);

    const newStart = d.startDate ?? (cur.start_date as string);
    let newEnd = d.endDate ?? (cur.end_date as string);
    if (d.startDate && !d.endDate) newEnd = addDaysStr(d.startDate, 2);

    if (d.startDate || d.endDate) {
      const overlapBooking = await sql`SELECT id, school_name, status FROM bookings WHERE status IN ('final','negosiasi') AND NOT (end_date < ${newStart} OR start_date > ${newEnd}) LIMIT 1`;
      if (overlapBooking.length > 0) {
        const ex = overlapBooking[0] as { school_name: string; status: string };
        return c.json({ error: `Tanggal bentrok dengan booking ${ex.status} (${ex.school_name})` }, 409);
      }
      const overlapEvent = await sql`SELECT id, event_name FROM events WHERE id != ${id} AND NOT (end_date < ${newStart} OR start_date > ${newEnd}) LIMIT 1`;
      if (overlapEvent.length > 0) {
        const ev = overlapEvent[0] as { event_name: string };
        return c.json({ error: `Tanggal bentrok dengan event lain (${ev.event_name})` }, 409);
      }
    }

    const sets: string[] = [];
    const vals: unknown[] = [];
    if (d.institution !== undefined) { vals.push(d.institution); sets.push(`institution = $${vals.length}`); }
    if (d.eventName !== undefined) { vals.push(d.eventName); sets.push(`event_name = $${vals.length}`); }
    if (d.participantCount !== undefined) { vals.push(d.participantCount); sets.push(`participant_count = $${vals.length}`); }
    if (d.startDate !== undefined) { vals.push(d.startDate); sets.push(`start_date = $${vals.length}`); }
    if (d.endDate !== undefined || d.startDate !== undefined) { vals.push(newEnd); sets.push(`end_date = $${vals.length}`); }
    if (d.keterangan !== undefined) { vals.push(d.keterangan ?? null); sets.push(`keterangan = $${vals.length}`); }

    sets.push(`updated_at = now()`);
    if (sets.length === 1) {
      const rows = await sql`SELECT * FROM events WHERE id = ${id}`;
      return c.json(rows[0]);
    }
    vals.push(id);
    const rows = await sql.query(
      `UPDATE events SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.delete("/api/events/:id", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    await sql`DELETE FROM events WHERE id = ${id}`;
    return c.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

// ─── Users (super_admin) ─────────────────────────────────────────

app.get("/api/users", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT id, username, role, display_name, wa_number, is_active, created_at, updated_at FROM users ORDER BY created_at DESC`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/users", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;
    const pwHash = await hashPassword(d.password);

    const rows = await sql`INSERT INTO users (username, password_hash, role, display_name, wa_number, is_active) VALUES (${d.username}, ${pwHash}, ${d.role}, ${d.displayName}, ${d.waNumber ?? null}, ${d.isActive ?? true}) RETURNING id, username, role, display_name, wa_number, is_active, created_at`;
    return c.json(rows[0], 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique") || msg.includes("duplicate"))
      return c.json({ error: "Username sudah digunakan" }, 409);
    return c.json({ error: msg }, 500);
  }
});

app.patch("/api/users/:id", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;

    const user = c.get("user") as AuthUser;
    if (user.id === id && d.isActive === false) {
      return c.json({ error: "Tidak bisa menonaktifkan akun sendiri" }, 400);
    }

    const sets: string[] = [];
    const vals: unknown[] = [];

    if (d.username !== undefined) {
      vals.push(d.username);
      sets.push(`username = $${vals.length}`);
    }
    if (d.password !== undefined) {
      const pwHash = await hashPassword(d.password);
      vals.push(pwHash);
      sets.push(`password_hash = $${vals.length}`);
    }
    if (d.displayName !== undefined) {
      vals.push(d.displayName);
      sets.push(`display_name = $${vals.length}`);
    }
    if (d.waNumber !== undefined) {
      vals.push(d.waNumber ?? null);
      sets.push(`wa_number = $${vals.length}`);
    }
    if (d.role !== undefined) {
      vals.push(d.role);
      sets.push(`role = $${vals.length}`);
    }
    if (d.isActive !== undefined) {
      vals.push(d.isActive);
      sets.push(`is_active = $${vals.length}`);
    }

    if (sets.length === 0) {
      const rows = await sql`SELECT id, username, role, display_name, wa_number, is_active, created_at FROM users WHERE id = ${id}`;
      return c.json(rows[0]);
    }

    sets.push(`updated_at = now()`);
    vals.push(id);
    const rows = await sql.query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING id, username, role, display_name, wa_number, is_active, created_at`,
      vals
    );
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    if (msg.includes("unique") || msg.includes("duplicate"))
      return c.json({ error: "Username sudah digunakan" }, 409);
    return c.json({ error: msg }, 500);
  }
});

app.delete("/api/users/:id", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const user = c.get("user") as AuthUser;

    if (user.id === id)
      return c.json({ error: "Tidak bisa menghapus akun sendiri" }, 400);

    const targetRows = await sql`SELECT role FROM users WHERE id = ${id}`;
    const target = targetRows[0] as Record<string, unknown> | undefined;
    if (!target) return c.json({ error: "User tidak ditemukan" }, 404);

    if (target.role === "super_admin") {
      const cntRows = await sql`SELECT COUNT(*)::int AS cnt FROM users WHERE role = 'super_admin' AND id != ${id} AND is_active = true`;
      const cnt = (cntRows[0] as Record<string, unknown>)?.cnt as number ?? 0;
      if (cnt === 0)
        return c.json({ error: "Harus ada minimal satu super_admin aktif" }, 400);
    }

    await sql`DELETE FROM users WHERE id = ${id}`;
    return c.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

// ─── Settings ────────────────────────────────────────────────────

// ─── Facilities (super_admin) ────────────────────────────────────

app.get("/api/facilities", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM facilities ORDER BY sort_order, created_at`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/facilities", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json();
    const parsed = facilitySchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;
    let sortOrder = d.sortOrder;
    if (sortOrder === undefined) {
      const maxRows = await sql`SELECT COALESCE(MAX(sort_order),0)::int AS mx FROM facilities`;
      sortOrder = ((maxRows[0] as { mx: number }).mx ?? 0) + 1;
    }
    const rows = await sql`INSERT INTO facilities (name, category, sort_order, icon, is_active) VALUES (${d.name}, ${d.category}, ${sortOrder}, ${d.icon ?? null}, ${d.isActive ?? true}) RETURNING *`;
    return c.json(rows[0], 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.patch("/api/facilities/:id", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const body = await c.req.json();
    const parsed = facilityUpdateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data;

    const sets: string[] = [];
    const vals: unknown[] = [];
    if (d.name !== undefined) { vals.push(d.name); sets.push(`name = $${vals.length}`); }
    if (d.category !== undefined) { vals.push(d.category); sets.push(`category = $${vals.length}`); }
    if (d.sortOrder !== undefined) { vals.push(d.sortOrder); sets.push(`sort_order = $${vals.length}`); }
    if ((d as { icon?: string | null }).icon !== undefined) { vals.push((d as { icon?: string | null }).icon); sets.push(`icon = $${vals.length}`); }
    if (d.isActive !== undefined) { vals.push(d.isActive); sets.push(`is_active = $${vals.length}`); }

    if (sets.length === 0) {
      const rows = await sql`SELECT * FROM facilities WHERE id = ${id}`;
      return c.json(rows[0]);
    }

    sets.push(`updated_at = now()`);
    vals.push(id);
    const rows = await sql.query(
      `UPDATE facilities SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    if (!rows[0]) return c.json({ error: "Fasilitas tidak ditemukan" }, 404);
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.delete("/api/facilities/:id", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    await sql`DELETE FROM facilities WHERE id = ${id}`;
    return c.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

// ─── Settings ────────────────────────────────────────────────────

app.get("/api/settings", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM settings WHERE id = 1`;
    return c.json(rows[0] ?? null);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.put("/api/settings", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const d = parsed.data as Record<string, unknown>;
    const user = c.get("user") as AuthUser;

    const sets: string[] = [];
    const vals: unknown[] = [];
    const add = (col: string, key: string) => {
      if (d[key] !== undefined) { vals.push(d[key]); sets.push(`${col} = $${vals.length}`); }
    };
    add("landing_wa_number", "landingWaNumber");
    add("landing_wa_label", "landingWaLabel");
    add("buper_name", "buperName");
    add("letter_body", "letterBody");
    add("sign_ketua", "signKetua");
    add("sign_sekretaris", "signSekretaris");
    add("sign_kades", "signKades");
    add("sign_dirbumdes", "signDirBumdes");
    if (sets.length === 0) {
      const rows = await sql`SELECT * FROM settings WHERE id=1`;
      return c.json(rows[0]);
    }
    sets.push(`updated_by = $${vals.length + 1}`); vals.push(user.id);
    sets.push(`updated_at = now()`);
    const rows = await sql.query(`UPDATE settings SET ${sets.join(", ")} WHERE id=1 RETURNING *`, vals);
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/letter-recipients", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT * FROM letter_recipients ORDER BY sort_order`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/letter-recipients", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json() as { name?: string; is_default?: boolean; sort_order?: number };
    if (!body.name || body.name.trim().length < 2) return c.json({ error: "Nama minimal 2 karakter" }, 400);
    const rows = await sql`INSERT INTO letter_recipients (name, is_default, sort_order) VALUES (${body.name.trim()}, ${body.is_default ?? true}, ${body.sort_order ?? 99}) RETURNING *`;
    return c.json(rows[0], 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.patch("/api/letter-recipients/:id", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const body = await c.req.json() as { name?: string; is_default?: boolean; sort_order?: number };
    const sets: string[] = []; const vals: unknown[] = [];
    if (body.name !== undefined) { vals.push(body.name.trim()); sets.push(`name = $${vals.length}`); }
    if (body.is_default !== undefined) { vals.push(body.is_default); sets.push(`is_default = $${vals.length}`); }
    if (body.sort_order !== undefined) { vals.push(body.sort_order); sets.push(`sort_order = $${vals.length}`); }
    if (sets.length === 0) return c.json({ error: "Tidak ada perubahan" }, 400);
    const rows = await sql.query(`UPDATE letter_recipients SET ${sets.join(", ")} WHERE id = $${vals.length + 1} RETURNING *`, [...vals, id]);
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.delete("/api/letter-recipients/:id", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    await sql`DELETE FROM letter_recipients WHERE id = ${id}`;
    return c.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/letter/next-number", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`UPDATE settings SET letter_seq = letter_seq + 1 WHERE id=1 RETURNING letter_seq`;
    const seq = (rows[0] as { letter_seq: number }).letter_seq;
    const now = new Date();
    const roman = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][now.getMonth()]!;
    const numStr = String(seq).padStart(3, "0");
    const nomor = `${numStr}/BPLB/${roman}/${now.getFullYear()}`;
    return c.json({ seq, nomor });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/letter/next-number-preview", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT letter_seq FROM settings WHERE id=1`;
    const seq = ((rows[0] as { letter_seq: number } | undefined)?.letter_seq ?? 12) + 1;
    const now = new Date();
    const roman = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][now.getMonth()]!;
    const numStr = String(seq).padStart(3, "0");
    const nomor = `${numStr}/BPLB/${roman}/${now.getFullYear()}`;
    return c.json({ seq, nomor });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/arsip", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const invoices = await sql`SELECT id, invoice_number as nomor, 'invoice' as tipe, invoice_generated_at as tanggal, school_name as perihal, invoice_generated_by as created_by, participant_count as item_count FROM bookings WHERE invoice_number IS NOT NULL ORDER BY invoice_generated_at DESC`;
    const surats = await sql`SELECT id, nomor, 'surat_pemberitahuan' as tipe, tanggal_surat as tanggal, kepada as perihal, created_by, item_count FROM letter_archives ORDER BY seq DESC`;
    const combined = [...invoices.map((r: Record<string, unknown>) => ({ ...r, tipe: "invoice" })), ...surats.map((r: Record<string, unknown>) => ({ ...r, tipe: "surat_pemberitahuan" }))].sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(b.tanggal as string).getTime() - new Date(a.tanggal as string).getTime());
    return c.json(combined);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.delete("/api/arsip/:id", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const tipe = c.req.query("tipe");
    if (tipe === "invoice") {
      const latest = await sql`SELECT id FROM bookings WHERE invoice_number IS NOT NULL ORDER BY invoice_generated_at DESC LIMIT 1`;
      if (!latest[0] || (latest[0] as { id: string }).id !== id) {
        return c.json({ error: "Hanya arsip terbaru yang boleh dihapus. Hapus berurutan dari yang terbaru." }, 400);
      }
      await sql`UPDATE bookings SET invoice_number = NULL, invoice_generated_at = NULL, invoice_generated_by = NULL WHERE id = ${id}`;
      return c.json({ ok: true, message: "Invoice dibatalkan, nomor dapat dipergunakan kembali" });
    } else if (tipe === "surat_pemberitahuan") {
      const row = await sql`SELECT seq FROM letter_archives WHERE id = ${id}`;
      if (!row[0]) return c.json({ error: "Arsip surat tidak ditemukan" }, 404);
      const maxSeq = await sql`SELECT MAX(seq)::int as mx FROM letter_archives`;
      const mx = (maxSeq[0] as { mx: number | null }).mx;
      if ((row[0] as { seq: number }).seq !== mx) {
        return c.json({ error: "Hanya surat terbaru yang boleh dihapus. Hapus berurutan dari yang terbaru." }, 400);
      }
      await sql`DELETE FROM letter_archives WHERE id = ${id}`;
      await sql`UPDATE settings SET letter_seq = letter_seq - 1 WHERE id = 1`;
      return c.json({ ok: true, message: "Surat dihapus, nomor dapat dipergunakan kembali" });
    } else {
      return c.json({ error: "Tipe harus invoice atau surat_pemberitahuan" }, 400);
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.post("/api/letter/archive", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const body = await c.req.json() as { nomor?: string; seq?: number; kepada?: string; item_count?: number; tanggal_surat?: string };
    if (!body.nomor || !body.seq) return c.json({ error: "nomor dan seq wajib" }, 400);
    const user = c.get("user") as { id: string };
    const rows = await sql`INSERT INTO letter_archives (nomor, seq, kepada, item_count, tanggal_surat, created_by) VALUES (${body.nomor}, ${body.seq}, ${body.kepada ?? ""}, ${body.item_count ?? 0}, ${body.tanggal_surat ?? new Date().toISOString().slice(0,10)}, ${user.id}) RETURNING *`;
    return c.json(rows[0], 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/letter-archives/:id", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const rows = await sql`SELECT * FROM letter_archives WHERE id = ${id}`;
    if (!rows[0]) return c.json({ error: "Not found" }, 404);
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/bookings/:id", requireAuth, async (c) => {
  try {
    const sql = getSql();
    const id = c.req.param("id");
    const rows = await sql`SELECT * FROM bookings WHERE id = ${id}`;
    if (!rows[0]) return c.json({ error: "Booking not found" }, 404);
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/public/gallery", async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT slot_number, caption, year, image_base64 FROM gallery_slots WHERE image_base64 IS NOT NULL ORDER BY slot_number`;
    return c.json(rows.map((r: Record<string, unknown>) => ({ slot_number: r.slot_number, caption: r.caption, year: r.year, image_url: r.image_base64 })));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.get("/api/gallery", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const rows = await sql`SELECT slot_number, caption, year, image_base64, updated_at FROM gallery_slots ORDER BY slot_number`;
    return c.json(rows);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

app.put("/api/gallery/:slot", requireAuth, requireSuper, async (c) => {
  try {
    const sql = getSql();
    const slotNum = Number(c.req.param("slot"));
    if (!Number.isInteger(slotNum) || slotNum < 1 || slotNum > 8) {
      return c.json({ error: "Slot harus 1-8" }, 400);
    }
    const body = await c.req.json() as { caption?: string; year?: string; image_base64?: string | null; clear?: boolean };
    if (body.clear) {
      const rows = await sql`UPDATE gallery_slots SET image_base64 = NULL, caption = '', year = '', updated_at = now() WHERE slot_number = ${slotNum} RETURNING *`;
      return c.json(rows[0]);
    }
    const caption = (body.caption ?? "").slice(0, 100);
    const year = body.year ? String(body.year).slice(0, 10) : null;
    const img = body.image_base64 ?? null;
    if (img !== null) {
      if (!img.startsWith("data:image/")) {
        return c.json({ error: "image_base64 harus format data:image/..." }, 400);
      }
      const b64len = img.length - (img.indexOf(",") + 1);
      const approxBytes = Math.floor(b64len * 0.75);
      if (approxBytes > 400 * 1024) {
        return c.json({ error: `Ukuran gambar ${Math.round(approxBytes / 1024)}KB melebihi limit 400KB setelah compress` }, 400);
      }
    }
    const rows = await sql`UPDATE gallery_slots SET caption = ${caption}, year = ${year}, image_base64 = ${img}, updated_at = now() WHERE slot_number = ${slotNum} RETURNING slot_number, caption, year, image_base64, updated_at`;
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

const handler = (request: Request) => app.fetch(request);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
