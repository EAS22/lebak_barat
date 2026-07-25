import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { handle } from "hono/vercel";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
} from "../src/lib/auth";
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  bookingSchema,
  bookingUpdateSchema,
  settingsSchema,
} from "../src/lib/validation";

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

    const rows = await sql`SELECT id, start_date, end_date FROM bookings WHERE status = 'confirmed' AND NOT (end_date < ${monthStart} OR start_date > ${monthEnd}) ORDER BY start_date`;
    return c.json(rows);
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
      vals.push(monthStart, monthEnd);
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
    const status = d.status ?? "confirmed";

    if (status === "confirmed") {
      const overlap = await sql`SELECT id FROM bookings WHERE status = 'confirmed' AND NOT (end_date < ${d.startDate} OR start_date > ${endDate}) LIMIT 1`;
      if (overlap.length > 0) {
        return c.json({ error: "Tanggal bentrok dengan booking confirmed lain" }, 409);
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

    if (
      newStatus === "confirmed" &&
      (d.status === "confirmed" || d.startDate)
    ) {
      const overlap = await sql`SELECT id FROM bookings WHERE id != ${id} AND status = 'confirmed' AND NOT (end_date < ${newStart} OR start_date > ${newEnd}) LIMIT 1`;
      if (overlap.length > 0) {
        return c.json({ error: "Tanggal bentrok dengan booking confirmed lain" }, 409);
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
    const d = parsed.data;
    const user = c.get("user") as AuthUser;

    const rows = await sql`UPDATE settings SET landing_wa_number = ${d.landingWaNumber}, landing_wa_label = ${d.landingWaLabel ?? "Admin Booking"}, buper_name = ${d.buperName ?? "Bumi Perkemahan Lebak Barat"}, updated_by = ${user.id}, updated_at = now() WHERE id = 1 RETURNING *`;
    return c.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

export default handle(app);
