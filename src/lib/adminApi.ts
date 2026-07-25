import type { BookingInput, BookingUpdateInput } from "./validation";

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
    return { data: json as BookingRecord[], page: 1, limit: json.length, total: json.length };
  }
  return json as BookingsResponse;
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
