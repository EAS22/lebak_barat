export interface PublicBooking {
  start_date: string;
  end_date: string;
  status: string;
  id?: string;
}

export interface PublicSettings {
  landing_wa_number: string;
  landing_wa_label: string;
  buper_name: string;
}

const DEFAULT_SETTINGS: PublicSettings = {
  landing_wa_number: "6280000000000",
  landing_wa_label: "Admin Booking",
  buper_name: "Bumi Perkemahan Lebak Barat",
};

export async function fetchPublicBookings(
  month: string
): Promise<PublicBooking[]> {
  try {
    const res = await fetch(`/api/public/bookings?month=${month}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as PublicBooking[];
    return [];
  } catch {
    return [];
  }
}

export interface PublicContact {
  display_name: string;
  wa_number: string;
}

export async function fetchPublicContacts(): Promise<PublicContact[]> {
  try {
    const res = await fetch("/api/public/contacts");
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as PublicContact[];
    return [];
  } catch {
    return [];
  }
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch("/api/public/settings");
    if (!res.ok) return DEFAULT_SETTINGS;
    const data = await res.json();
    if (data && typeof data === "object" && "landing_wa_number" in data) {
      return data as PublicSettings;
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
