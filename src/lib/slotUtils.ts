export interface SlotDef {
  index: number;
  startDay: number;
  endDay: number;
  startDate: Date;
  endDate: Date;
}

export interface SlotSummary {
  total: number;
  available: number;
  negosiasi: number;
  final: number;
  event: number;
}

export function generateSlots(year: number, month: number): SlotDef[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const slots: SlotDef[] = [];
  let idx = 0;
  let day = 1;
  while (day + 2 <= daysInMonth) {
    slots.push({
      index: idx,
      startDay: day,
      endDay: day + 2,
      startDate: new Date(year, month, day),
      endDate: new Date(year, month, day + 2),
    });
    idx++;
    day += 3;
  }
  return slots;
}

function parseDate(s: string): Date {
  return new Date(s.slice(0, 10) + "T00:00:00");
}

function slotsOverlap(
  slotStart: Date,
  slotEnd: Date,
  itemStart: Date,
  itemEnd: Date
): boolean {
  return slotStart <= itemEnd && slotEnd >= itemStart;
}

export function countSlotStatuses(
  slots: SlotDef[],
  bookings: { start_date: string; end_date: string; status: string }[],
  events: { start_date: string; end_date: string }[],
  today: Date
): SlotSummary {
  let available = 0;
  let negosiasi = 0;
  let final_ = 0;
  let event_ = 0;

  for (const slot of slots) {
    let slotStatus: "available" | "negosiasi" | "final" | "event" = "available";

    for (const ev of events) {
      const evStart = parseDate(ev.start_date);
      const evEnd = parseDate(ev.end_date);
      if (slotsOverlap(slot.startDate, slot.endDate, evStart, evEnd)) {
        slotStatus = "event";
        break;
      }
    }

    if (slotStatus === "available") {
      for (const b of bookings) {
        if (b.status !== "final" && b.status !== "negosiasi") continue;
        const bStart = parseDate(b.start_date);
        const bEnd = parseDate(b.end_date);
        if (slotsOverlap(slot.startDate, slot.endDate, bStart, bEnd)) {
          if (b.status === "final") {
            slotStatus = "final";
            break;
          }
          if (b.status === "negosiasi") {
            slotStatus = "negosiasi";
          }
        }
      }
    }

    if (slotStatus === "available" && slot.endDate < today) {
      // past slot - don't count as available
    } else if (slotStatus === "available") {
      available++;
    } else if (slotStatus === "final") {
      final_++;
    } else if (slotStatus === "negosiasi") {
      negosiasi++;
    } else if (slotStatus === "event") {
      event_++;
    }
  }

  return {
    total: slots.length,
    available,
    negosiasi,
    final: final_,
    event: event_,
  };
}
