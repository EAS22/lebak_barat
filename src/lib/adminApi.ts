import type {
  BookingInput,
  BookingUpdateInput,
  CreateUserInput,
  UpdateUserInput,
  SettingsInput,
  EventInput,
  EventUpdateInput,
} from "./validation";

export interface BookingRecord {
  id: string;
  school_name: string;
  participant_count: number;
  pic_name: string;
  pic_wa: string | null;
  start_date: string;
  end_date: string;
  price: number | null;
  status: "final" | "negosiasi" | "batal";
  keterangan: string | null;
  invoice_number?: string | null;
  invoice_generated_at?: string | null;
  invoice_generated_by?: string | null;
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

export async function generateInvoice(id: string): Promise<BookingRecord & { invoice_number: string }> {
  const res = await adminFetch(`/api/bookings/${id}/invoice`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Generate invoice failed: ${res.status}`) as Error & {
      status?: number;
      missing?: string[];
      details?: unknown;
    };
    err.status = res.status;
    err.missing = body.missing;
    err.details = body;
    throw err;
  }
  return res.json();
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await adminFetch(`/api/bookings/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export interface EventRecord {
  id: string;
  institution: string;
  event_name: string;
  participant_count: number;
  start_date: string;
  end_date: string;
  keterangan: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventsResponse {
  data: EventRecord[];
  page: number;
  limit: number;
  total: number;
}

export interface EventParams {
  month?: string;
  search?: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export async function getEvents(params: EventParams = {}): Promise<EventsResponse> {
  const qs = new URLSearchParams();
  if (params.month) qs.set("month", params.month);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const res = await adminFetch(`/api/events?${qs.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}

export async function createEvent(data: EventInput): Promise<EventRecord> {
  const res = await adminFetch("/api/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Create failed: ${res.status}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function updateEvent(id: string, data: EventUpdateInput): Promise<EventRecord> {
  const res = await adminFetch(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Update failed: ${res.status}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await adminFetch(`/api/events/${id}`, { method: "DELETE" });
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

// ─── Facilities ─────────────────────────────────────────────────

export interface FacilityRecord {
  id: string;
  name: string;
  category: "utama" | "opsional";
  sort_order: number;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getFacilities(): Promise<FacilityRecord[]> {
  const res = await adminFetch("/api/facilities");
  if (!res.ok) throw new Error(`Failed to fetch facilities: ${res.status}`);
  return res.json();
}

export async function createFacility(data: {
  name: string;
  category: "utama" | "opsional";
  sortOrder?: number;
  icon?: string;
  isActive?: boolean;
}): Promise<FacilityRecord> {
  const res = await adminFetch("/api/facilities", {
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

export async function updateFacility(
  id: string,
  data: Partial<{
    name: string;
    category: "utama" | "opsional";
    sortOrder: number;
    icon: string | null;
    isActive: boolean;
  }>
): Promise<FacilityRecord> {
  const res = await adminFetch(`/api/facilities/${id}`, {
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

export async function deleteFacility(id: string): Promise<void> {
  const res = await adminFetch(`/api/facilities/${id}`, { method: "DELETE" });
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
  letter_body?: string | null;
  letter_seq?: number | null;
  sign_ketua?: string | null;
  sign_sekretaris?: string | null;
  sign_kades?: string | null;
  sign_dirbumdes?: string | null;
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

// ─── Letter Recipients ──────────────────────────────────────────

export interface LetterRecipient {
  id: string;
  name: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export async function getLetterRecipients(): Promise<LetterRecipient[]> {
  const res = await adminFetch("/api/letter-recipients");
  if (!res.ok) throw new Error(`Failed to fetch recipients: ${res.status}`);
  return res.json();
}

export async function createLetterRecipient(data: { name: string; is_default?: boolean; sort_order?: number }): Promise<LetterRecipient> {
  const res = await adminFetch("/api/letter-recipients", { method: "POST", body: JSON.stringify(data) });
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Create failed: ${res.status}`); }
  return res.json();
}

export async function updateLetterRecipient(id: string, data: Partial<{ name: string; is_default: boolean; sort_order: number }>): Promise<LetterRecipient> {
  const res = await adminFetch(`/api/letter-recipients/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `Update failed: ${res.status}`); }
  return res.json();
}

export async function deleteLetterRecipient(id: string): Promise<void> {
  const res = await adminFetch(`/api/letter-recipients/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function previewLetterNumber(): Promise<{ seq: number; nomor: string }> {
  const res = await adminFetch("/api/letter/next-number-preview");
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

export async function nextLetterNumber(): Promise<{ seq: number; nomor: string }> {
  const res = await adminFetch("/api/letter/next-number", { method: "POST" });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}
