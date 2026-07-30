import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBookings, type BookingRecord } from "@/lib/adminApi";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isWithinInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { id } from "date-fns/locale";

interface CalendarAdminProps {
  month?: string;
  selected?: string;
  onSelectBooking?: (booking: BookingRecord) => void;
  onMonthChange?: (month: string) => void;
}

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function mondayIndex(d: Date): number {
  const day = getDay(d);
  return day === 0 ? 6 : day - 1;
}

export default function CalendarAdmin({
  month,
  selected,
  onSelectBooking,
  onMonthChange,
}: CalendarAdminProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (month) {
      const [y, m] = month.split("-").map(Number);
      return startOfMonth(new Date(y!, (m ?? 1) - 1));
    }
    return startOfMonth(new Date());
  });
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const monthStr = format(currentMonth, "yyyy-MM");

  useEffect(() => {
    if (month) {
      const [y, m] = month.split("-").map(Number);
      setCurrentMonth(startOfMonth(new Date(y!, (m ?? 1) - 1)));
    }
  }, [month]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBookings({ month: monthStr, limit: 200 })
      .then((res) => {
        if (!cancelled) {
          setBookings(res.data);
          setLoading(false);
        }
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
    (date: Date): { status: "final" | "negosiasi" | "batal" | null; bookings: BookingRecord[] } => {
      const found = bookings.filter((b) => {
        const start = new Date(b.start_date.slice(0, 10) + "T00:00:00");
        const end = new Date(b.end_date.slice(0, 10) + "T00:00:00");
        return isWithinInterval(date, { start, end });
      });
      if (found.length === 0) return { status: null, bookings: [] };
      const hasFinal = found.some((b) => b.status === "final");
      if (hasFinal) return { status: "final", bookings: found };
      const hasNego = found.some((b) => b.status === "negosiasi");
      if (hasNego) return { status: "negosiasi", bookings: found };
      // batal => treat as available, but return for tooltip
      return { status: "batal", bookings: found };
    },
    [bookings]
  );

  const getBookingsForDay = useCallback(
    (date: Date): BookingRecord[] => {
      return bookings.filter((b) => {
        const start = new Date(b.start_date.slice(0, 10) + "T00:00:00");
        const end = new Date(b.end_date.slice(0, 10) + "T00:00:00");
        return isWithinInterval(date, { start, end });
      });
    },
    [bookings]
  );

  function navigateMonth(delta: number) {
    setCurrentMonth((m) => {
      const next = delta > 0 ? addMonths(m, 1) : subMonths(m, 1);
      onMonthChange?.(format(next, "yyyy-MM"));
      return next;
    });
  }

  const today = new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-gray-900 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: id })}
        </h3>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const { status, bookings: dayBookings } = dayStatus(day);
            const hasBooking = status === "final" || status === "negosiasi";
            const first = dayBookings.find((b) => b.status === status) ?? dayBookings[0];
            const isToday = isSameDay(day, today);
            const isSelected = selected === format(day, "yyyy-MM-dd");
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={day.toISOString()}
                onClick={() => hasBooking && first && onSelectBooking?.(first)}
                className={`
                  relative h-11 flex flex-col items-center justify-center text-sm rounded-xl cursor-default transition-transform
                  ${status === "final" ? "bg-red-500 text-white font-bold group shadow-sm hover:scale-105" : ""}
                  ${status === "negosiasi" ? "bg-amber-400 text-brown font-bold group shadow-sm hover:scale-105" : ""}
                  ${status === null && !isPast ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-100" : ""}
                  ${status === null && isPast ? "bg-slate-50 text-slate-300" : ""}
                  ${status === "batal" ? "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-100" : ""}
                  ${isToday ? "ring-2 ring-amber-400 ring-offset-1" : ""}
                  ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                  ${hasBooking ? "cursor-pointer" : ""}
                `}
              >
                <span className="text-sm leading-none">{day.getDate()}</span>
                {status === "final" && (
                  <span className="text-[9px] leading-none mt-0.5 font-semibold uppercase">Penuh</span>
                )}
                {status === "negosiasi" && (
                  <span className="text-[9px] leading-none mt-0.5 font-semibold uppercase">Nego</span>
                )}
                {hasBooking && first && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10">
                    <div className="bg-brown text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                      {first.school_name} — {status === "final" ? "Final" : "Negosiasi"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-2">
          Belum ada booking di bulan ini
        </p>
      )}

      <div className="flex items-center justify-center flex-wrap gap-3.5 mt-5 text-xs font-medium text-gray-600">
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
          <span className="w-4 h-4 rounded-md border-2 border-amber-400" />
          Hari Ini
        </div>
      </div>
    </div>
  );
}
