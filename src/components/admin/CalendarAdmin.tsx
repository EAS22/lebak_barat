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

  const getBookingsForDay = useCallback(
    (date: Date): BookingRecord[] => {
      return bookings.filter((b) => {
        const start = new Date(b.start_date + "T00:00:00");
        const end = new Date(b.end_date + "T00:00:00");
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
            const dayBookings = getBookingsForDay(day);
            const hasBooking = dayBookings.length > 0;
            const first = dayBookings[0];
            const isCancelled = first?.status === "cancelled";
            const isConfirmed = first?.status === "confirmed";
            const isToday = isSameDay(day, today);
            const isSelected = selected === format(day, "yyyy-MM-dd");

            return (
              <div
                key={day.toISOString()}
                onClick={() => hasBooking && first && onSelectBooking?.(first)}
                className={`
                  relative h-10 flex items-center justify-center text-sm rounded-md
                  ${hasBooking && isConfirmed ? "bg-emerald-500 text-white font-medium cursor-pointer group" : ""}
                  ${hasBooking && isCancelled ? "bg-slate-300 text-slate-600 line-through cursor-pointer group" : ""}
                  ${!hasBooking ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50" : ""}
                  ${isToday && !hasBooking ? "ring-2 ring-emerald-500 ring-offset-1" : ""}
                  ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                `}
              >
                {day.getDate()}
                {hasBooking && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {first!.school_name} ({first!.participant_count} org)
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          Confirmed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-300" />
          Cancelled
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white border border-gray-300" />
          Kosong
        </div>
      </div>
    </div>
  );
}
