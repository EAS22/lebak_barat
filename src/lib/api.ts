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

export interface PublicYearBooking {
  id: string;
  school_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export async function fetchPublicYearBookings(
  year: number
): Promise<PublicYearBooking[]> {
  try {
    const res = await fetch(`/api/public/bookings/year?year=${year}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as PublicYearBooking[];
    return [];
  } catch {
    return [];
  }
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

export interface PublicFacility {
  id: string;
  name: string;
  category: "utama" | "opsional";
  sort_order: number;
  icon: string | null;
}

export async function fetchPublicFacilities(): Promise<PublicFacility[]> {
  try {
    const res = await fetch("/api/public/facilities");
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as PublicFacility[];
    return [];
  } catch {
    return [];
  }
}

export interface PublicEvent {
  id: string;
  institution: string;
  event_name: string;
  start_date: string;
  end_date: string;
}

export async function fetchPublicEvents(month?: string): Promise<PublicEvent[]> {
  try {
    const url = month ? `/api/public/events?month=${month}` : "/api/public/events";
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as PublicEvent[];
    return [];
  } catch {
    return [];
  }
}

export async function fetchPublicEventsByYear(year: number): Promise<PublicEvent[]> {
  try {
    const res = await fetch(`/api/public/events/year?year=${year}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as PublicEvent[];
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

export interface PublicGalleryItem {
  slot_number: number;
  caption: string;
  year: string | null;
  image_url: string;
}

export async function fetchPublicGallery(): Promise<PublicGalleryItem[]> {
  try {
    const res = await fetch("/api/public/gallery");
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as PublicGalleryItem[];
    return [];
  } catch {
    return [];
  }
}
