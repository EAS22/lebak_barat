import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Tent,
  PartyPopper,
  CalendarCheck,
  School,
} from "lucide-react";
import {
  fetchPublicBookings,
  fetchPublicYearBookings,
  type PublicBooking,
  type PublicYearBooking,
} from "@/lib/api";
import { useReveal } from "@/hooks/useReveal";
import { useWaBooking } from "@/components/landing/WaBookingModal";
import ScoutBadge from "@/components/landing/ornaments/ScoutBadge";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isWithinInterval,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
  getYear,
} from "date-fns";
import { id } from "date-fns/locale";

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const MONTH_COLORS: Record<number, string> = {
  0: "bg-sky-100 text-sky-700 border-sky-200",
  1: "bg-rose-100 text-rose-700 border-rose-200",
  2: "bg-emerald-100 text-emerald-700 border-emerald-200",
  3: "bg-amber-100 text-amber-700 border-amber-200",
  4: "bg-violet-100 text-violet-700 border-violet-200",
  5: "bg-teal-100 text-teal-700 border-teal-200",
  6: "bg-orange-100 text-orange-700 border-orange-200",
  7: "bg-lime-100 text-lime-700 border-lime-200",
  8: "bg-cyan-100 text-cyan-700 border-cyan-200",
  9: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  10: "bg-indigo-100 text-indigo-700 border-indigo-200",
  11: "bg-red-100 text-red-700 border-red-200",
};

function mondayIndex(d: Date): number {
  const day = getDay(d);
  return day === 0 ? 6 : day - 1;
}

function fmtRange(startStr: string, endStr: string): string {
  const start = new Date(startStr.slice(0, 10) + "T00:00:00");
  const end = new Date(endStr.slice(0, 10) + "T00:00:00");
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "d")}–${format(end, "d MMMM", { locale: id })}`;
  }
  return `${format(start, "d MMM", { locale: id })} – ${format(end, "d MMM", { locale: id })}`;
}

type UnifiedYearItem =
  | (PublicYearBooking & { _kind: "booking" })
  | (import("@/lib/api").PublicEvent & { _kind: "event" });

function YearBookingList({ year, onSelectDate }: { year: number; onSelectDate?: (date: Date) => void }) {
  const [items, setItems] = useState<UnifiedYearItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchPublicYearBookings(year),
      import("@/lib/api").then((m) => m.fetchPublicEventsByYear(year)),
    ])
      .then(([bookings, events]) => {
        if (cancelled) return;
        const merged: UnifiedYearItem[] = [
          ...bookings.map((b) => ({ ...b, _kind: "booking" as const })),
          ...events.map((e) => ({ ...e, _kind: "event" as const })),
        ].sort(
          (a, b) =>
            new Date(a.start_date.slice(0, 10) + "T00:00:00").getTime() -
            new Date(b.start_date.slice(0, 10) + "T00:00:00").getTime()
        );
        setItems(merged);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-emerald-300 p-6 flex flex-col h-full min-h-[560px] lg:min-h-0">
      <div className="flex items-center gap-3 mb-1 shrink-0">
        <ScoutBadge
          icon={<CalendarCheck size={18} />}
          size={44}
          colorClass="text-emerald-600"
        />
        <div>
          <h3 className="text-lg font-bold text-brown leading-tight">
            Sudah Booking {year}
          </h3>
          <p className="text-xs text-slate-500">
            Klik untuk lihat di kalender
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 flex-1 flex flex-col items-center justify-center text-center py-8">
          <Tent size={40} className="mx-auto text-emerald-300" />
          <p className="mt-3 text-sm font-semibold text-brown">
            Belum ada yang booking tahun {year}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Jadilah yang pertama mengamankan tanggal!
          </p>
        </div>
      ) : (
        <ol className="mt-4 space-y-2.5 flex-1 overflow-y-auto pr-1 min-h-0 custom-scrollbar">
          {items.map((b) => {
            const start = new Date(b.start_date.slice(0, 10) + "T00:00:00");
            const monthIdx = start.getMonth();
            const colorCls = MONTH_COLORS[monthIdx] ?? MONTH_COLORS[0];
            const isEvent = (b as UnifiedYearItem)._kind === "event";
            const ev = b as import("@/lib/api").PublicEvent & { _kind: "event" };
            const bk = b as PublicYearBooking & { _kind: "booking" };
            return (
              <li
                key={b.id}
                onClick={() => {
                  if (onSelectDate) {
                    onSelectDate(startOfMonth(start));
                    const target = document.getElementById("kalender-grid");
                    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm hover:border-emerald-300 cursor-pointer transition-all active:scale-[0.98]"
              >
                <span
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border font-bold ${isEvent ? "bg-blue-900 text-white border-blue-800" : colorCls}`}
                >
                  <span className="text-base leading-none">
                    {format(start, "d")}
                  </span>
                  <span className="text-[9px] uppercase leading-none mt-0.5">
                    {format(start, "MMM", { locale: id })}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-semibold text-sm text-brown truncate">
                    <School size={13} className={`flex-shrink-0 ${isEvent ? "text-blue-900" : "text-emerald-600"}`} />
                    <span className="truncate">{isEvent ? ev.institution : bk.school_name}</span>
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    {isEvent ? ev.event_name : fmtRange(bk.start_date, bk.end_date)}
                  </span>
                </span>
                <span
                  className={`flex-shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    isEvent
                      ? "bg-blue-900 text-white"
                      : bk.status === "final"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isEvent ? "Event" : bk.status === "final" ? "Final" : "Negosiasi"}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default function CalendarStatus() {
  const wrap = useReveal<HTMLDivElement>();
  const listReveal = useReveal<HTMLDivElement>();
  const { openWaModal } = useWaBooking();
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const rightCardRef = useRef<HTMLDivElement | null>(null);
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const monthStr = format(currentMonth, "yyyy-MM");
  const currentYear = getYear(currentMonth);

  // Sync right card height to left card on desktop
  useEffect(() => {
    const left = document.getElementById("kalender-card");
    const right = rightCardRef.current;
    if (!left || !right || window.innerWidth < 1024) return;

    const sync = () => {
      const h = left.getBoundingClientRect().height;
      if (h > 0) {
        right.style.height = `${h}px`;
      }
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(left);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [bookings, loading]);

  const [events, setEvents] = useState<import("@/lib/api").PublicEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchPublicBookings(monthStr),
      import("@/lib/api").then((m) => m.fetchPublicEvents(monthStr)),
    ])
      .then(([b, e]) => {
        if (cancelled) return;
        setBookings(b);
        setEvents(e as import("@/lib/api").PublicEvent[]);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [monthStr]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = mondayIndex(daysInMonth[0]!);

  const dayStatus = useCallback(
    (date: Date): "event" | "final" | "negosiasi" | null => {
      for (const ev of events) {
        const s = new Date(ev.start_date.slice(0, 10) + "T00:00:00");
        const en = new Date(ev.end_date.slice(0, 10) + "T00:00:00");
        if (isWithinInterval(date, { start: s, end: en })) return "event";
      }
      let found: "final" | "negosiasi" | null = null;
      for (const b of bookings) {
        const start = new Date(b.start_date.slice(0, 10) + "T00:00:00");
        const end = new Date(b.end_date.slice(0, 10) + "T00:00:00");
        if (isWithinInterval(date, { start, end })) {
          if (b.status === "final") return "final";
          if (b.status === "negosiasi") found = "negosiasi";
        }
      }
      return found;
    },
    [bookings, events]
  );

  const today = startOfDay(new Date());

  const finalCount = useMemo(
    () => daysInMonth.filter((d) => dayStatus(d) === "final").length,
    [daysInMonth, dayStatus]
  );
  const negoCount = useMemo(
    () => daysInMonth.filter((d) => dayStatus(d) === "negosiasi").length,
    [daysInMonth, dayStatus]
  );
  const availableCount = useMemo(
    () =>
      daysInMonth.filter(
        (d) => dayStatus(d) !== "final" && !isBefore(d, today)
      ).length,
    [daysInMonth, dayStatus, today]
  );

  const waMessage = `Halo Admin Bumi Perkemahan Lebak Barat, saya ingin cek ketersediaan tanggal di bulan ${format(
    currentMonth,
    "MMMM yyyy",
    { locale: id }
  )}.`;

  return (
    <section id="kalender" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-4">
            <Tent size={16} />
            Jadwal Kemah
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brown">
            Cek Tanggal Favoritmu!
          </h2>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto">
            Tanggal <span className="font-semibold text-red-600">merah</span>{" "}
            sudah terisi (final), tanggal{" "}
            <span className="font-semibold text-amber-500">kuning</span> masih
            dalam negosiasi, dan tanggal{" "}
            <span className="font-semibold text-emerald-600">hijau</span> masih
            tersedia. Amankan tanggalmu sebelum keduluan sekolah lain!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto lg:items-stretch items-start">
          {/* Kalender - patokan tinggi */}
          <div
            ref={wrap.ref}
            id="kalender-grid"
            className={`reveal lg:flex lg:flex-col lg:h-full ${wrap.visible ? "is-visible" : ""}`}
          >
            <div
              id="kalender-card"
              className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-amber-300 p-6 lg:flex lg:flex-col lg:h-full lg:min-h-[560px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                  className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all hover:scale-110"
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-brown capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: id })}
                </h3>
                <button
                  type="button"
                  onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                  className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all hover:scale-110"
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Ringkasan bulan */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-2 py-2 text-center">
                  <div className="text-lg font-bold text-emerald-700">
                    {loading ? "..." : availableCount}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-700">
                    Tersedia
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-2 py-2 text-center">
                  <div className="text-lg font-bold text-amber-600">
                    {loading ? "..." : negoCount}
                  </div>
                  <div className="text-[11px] font-medium text-amber-600">
                    Negosiasi
                  </div>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-200 px-2 py-2 text-center">
                  <div className="text-lg font-bold text-red-600">
                    {loading ? "..." : finalCount}
                  </div>
                  <div className="text-[11px] font-medium text-red-600">
                    Terisi Final
                  </div>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {DAY_LABELS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-bold text-brown/70 py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              {loading ? (
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-11 rounded-xl bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div
                  key={monthStr}
                  className="grid grid-cols-7 gap-1.5 anim-fade-slide"
                >
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {daysInMonth.map((day) => {
                    const status = dayStatus(day);
                    const past =
                      isBefore(day, today) && !isSameDay(day, today);
                    const isToday = isSameDay(day, today);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`
                          relative h-11 flex flex-col items-center justify-center rounded-xl cursor-default transition-transform hover:scale-105
                          ${
                            status === "event"
                              ? "bg-blue-900 text-white font-bold group shadow-sm"
                              : status === "final"
                                ? "bg-red-500 text-white font-bold group shadow-sm"
                                : status === "negosiasi"
                                  ? "bg-amber-400 text-brown font-bold group shadow-sm"
                                  : past
                                    ? "bg-slate-50 text-slate-300"
                                    : "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-100"
                          }
                          ${isToday ? "ring-2 ring-amber-400 ring-offset-1" : ""}
                        `}
                      >
                        <span className="text-sm leading-none">
                          {day.getDate()}
                        </span>
                        {status === "final" && (
                          <span className="text-[9px] leading-none mt-0.5 font-semibold uppercase">
                            Penuh
                          </span>
                        )}
                        {status === "negosiasi" && (
                          <span className="text-[9px] leading-none mt-0.5 font-semibold uppercase">
                            Nego
                          </span>
                        )}
                        {status === "event" && (
                          <span className="text-[9px] leading-none mt-0.5 font-semibold uppercase">
                            Event
                          </span>
                        )}
                        {status && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10">
                            <div className="bg-brown text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                              {status === "event"
                                ? "Event Internal"
                                : status === "final"
                                  ? "Sudah Terbooking (Final)"
                                  : "Dalam Negosiasi"}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center justify-center flex-wrap gap-3 mt-5 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-300" />
                  Tersedia
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-amber-400" />
                  Negosiasi
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-red-500" />
                  Final
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-blue-900" />
                  Event
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md border-2 border-amber-400" />
                  Hari Ini
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-slate-100" />
                  Lewat
                </div>
              </div>
            </div>
          </div>

          {/* Daftar booking tahun berjalan - tinggi ikut kalender */}
          <div
            ref={(node) => {
              if (node) {
                (listReveal.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                rightCardRef.current = node;
              }
            }}
            className={`reveal reveal-right lg:flex lg:flex-col lg:h-full ${listReveal.visible ? "is-visible" : ""}`}
          >
            <YearBookingList year={currentYear} onSelectDate={(d) => setCurrentMonth(d)} />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => openWaModal(waMessage)}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-brown bg-tent rounded-xl hover:bg-amber-400 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <PartyPopper size={20} />
            Amankan Tanggalmu Sekarang!
          </button>
          <p className="mt-3 text-sm text-slate-500">
            Klik untuk chat admin dan tanyakan tanggal yang kamu mau.
          </p>
        </div>
      </div>
    </section>
  );
}
