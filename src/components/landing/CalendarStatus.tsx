import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchPublicBookings, type PublicBooking } from "@/lib/api";
import { waLink } from "@/lib/utils";
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

interface CalendarStatusProps {
  waNumber: string;
}

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function mondayIndex(d: Date): number {
  const day = getDay(d);
  return day === 0 ? 6 : day - 1;
}

export default function CalendarStatus({
  waNumber,
}: CalendarStatusProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [bookings, setBookings] = useState<PublicBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const monthStr = format(currentMonth, "yyyy-MM");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicBookings(monthStr).then((data) => {
      if (!cancelled) {
        setBookings(data);
        setLoading(false);
      }
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

  const isBooked = useCallback(
    (date: Date): boolean => {
      return bookings.some((b) => {
        const start = new Date(b.start_date + "T00:00:00");
        const end = new Date(b.end_date + "T00:00:00");
        return isWithinInterval(date, { start, end });
      });
    },
    [bookings]
  );

  const today = new Date();

  const waMessage = `Halo Admin Bumi Perkemahan Lebak Barat, saya ingin cek ketersediaan tanggal ...`;

  return (
    <section id="kalender" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Kalender Ketersediaan
          </h2>
          <p className="mt-3 text-slate-600">
            Cek tanggal yang sudah dibooking dan hubungi admin untuk reservasi.
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: id })}
            </h3>
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-slate-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Belum ada booking di bulan ini
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map((day) => {
                const booked = isBooked(day);
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      relative h-10 flex items-center justify-center text-sm rounded-lg cursor-default
                      ${
                        booked
                          ? "bg-red-500 text-white font-medium group"
                          : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                      }
                      ${isToday && !booked ? "ring-2 ring-emerald-500 ring-offset-1" : ""}
                      ${isToday && booked ? "ring-2 ring-red-300 ring-offset-1" : ""}
                    `}
                  >
                    {day.getDate()}
                    {booked && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                        <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          Terbooking
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Terbooking
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
              Tersedia
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-emerald-500" />
              Hari ini
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href={waLink(waNumber, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Booking via WhatsApp
          </a>
          <p className="mt-3 text-xs text-slate-500">
            Klik tombol di atas untuk menghubungi admin dan menanyakan
            ketersediaan tanggal.
          </p>
        </div>
      </div>
    </section>
  );
}
