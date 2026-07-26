import type { BookingInput, BookingUpdateInput, CreateUserInput, UpdateUserInput, SettingsInput } from "./validation";

export interface BookingRecord {
  id: string;
  school_name: string;
  participant_count: number;
  pic_name: string;
  pic_wa: string;
  start_date: string;
  end_date: string;
  price: number | null;
  status: "confirmed" | "cancelled";
  keterangan: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingsResponse {
  data: BookingRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface BookingParams {
  month?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export async function adminFetch(path: string, opts?: RequestInit) {
  return fetch(path, {
    credentials: "include",
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
  });
}

function normalizeBooking(raw: Record<string, unknown>): BookingRecord {
  const r = raw as unknown as BookingRecord;
  return {
    ...r,
    start_date: String(r.start_date).slice(0, 10),
    end_date: String(r.end_date).slice(0, 10),
    price: r.price != null ? Number(r.price) : null,
  };
}

export async function getBookings(params: BookingParams = {}): Promise<BookingsResponse> {
  const qs = new URLSearchParams();
  if (params.month) qs.set("month", params.month);
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  const res = await adminFetch(`/api/bookings?${qs.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.status}`);
  const json = await res.json();

  if (Array.isArray(json)) {
    const data = (json as Record<string, unknown>[]).map(normalizeBooking);
    return { data, page: 1, limit: data.length, total: data.length };
  }
  const resp = json as BookingsResponse;
  return {
    ...resp,
    data: (resp.data as unknown as Record<string, unknown>[]).map(normalizeBooking),
  };
}

export async function createBooking(data: BookingInput): Promise<BookingRecord> {
  const res = await adminFetch("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Create failed: ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

export async function updateBooking(id: string, data: BookingUpdateInput): Promise<BookingRecord> {
  const res = await adminFetch(`/api/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Update failed: ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await adminFetch(`/api/bookings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function exportBookings(params: { from?: string; to?: string; status?: string } = {}): Promise<void> {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.status) qs.set("status", params.status);

  const res = await fetch(`/api/bookings/export?${qs.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bookings.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Users ──────────────────────────────────────────────────────

export interface UserRecord {
  id: string;
  username: string;
  role: "super_admin" | "booking_admin";
  display_name: string;
  wa_number: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getUsers(): Promise<UserRecord[]> {
  const res = await adminFetch("/api/users");
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  return res.json();
}

export async function createUser(data: CreateUserInput): Promise<UserRecord> {
  const res = await adminFetch("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Create failed: ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<UserRecord> {
  const res = await adminFetch(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Update failed: ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await adminFetch(`/api/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Delete failed: ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
}

// ─── Settings ───────────────────────────────────────────────────

export interface SettingsRecord {
  id: number;
  landing_wa_number: string;
  landing_wa_label: string;
  buper_name: string;
  updated_by: string | null;
  updated_at: string;
}

export async function getSettings(): Promise<SettingsRecord> {
  const res = await adminFetch("/api/settings");
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);
  return res.json();
}

export async function updateSettings(data: SettingsInput): Promise<SettingsRecord> {
  const res = await adminFetch("/api/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Update failed: ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}
