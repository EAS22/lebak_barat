import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Tent, PartyPopper } from "lucide-react";
import { fetchPublicBookings, type PublicBooking } from "@/lib/api";
import { waLink } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import RopeBorder from "@/components/landing/ornaments/RopeBorder";
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

export default function CalendarStatus({ waNumber }: CalendarStatusProps) {
  const wrap = useReveal<HTMLDivElement>();
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
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
        const start = new Date(b.start_date.slice(0, 10) + "T00:00:00");
        const end = new Date(b.end_date.slice(0, 10) + "T00:00:00");
        return isWithinInterval(date, { start, end });
      });
    },
    [bookings]
  );

  const today = startOfDay(new Date());

  const bookedCount = useMemo(
    () => daysInMonth.filter((d) => isBooked(d)).length,
    [daysInMonth, isBooked]
  );
  const availableCount = useMemo(
    () =>
      daysInMonth.filter((d) => !isBooked(d) && !isBefore(d, today)).length,
    [daysInMonth, isBooked, today]
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
            sudah terisi, tanggal{" "}
            <span className="font-semibold text-emerald-600">hijau</span> masih
            tersedia. Amankan tanggalmu sebelum keduluan sekolah lain!
          </p>
        </div>

        <div
          ref={wrap.ref}
          className={`max-w-lg mx-auto reveal ${wrap.visible ? "is-visible" : ""}`}
        >
          <RopeBorder className="mb-4" />
          <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-amber-300 p-6">
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
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-center">
                <div className="text-lg font-bold text-emerald-700">
                  {loading ? "..." : availableCount}
                </div>
                <div className="text-xs font-medium text-emerald-700">
                  Hari Tersedia
                </div>
              </div>
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-center">
                <div className="text-lg font-bold text-red-600">
                  {loading ? "..." : bookedCount}
                </div>
                <div className="text-xs font-medium text-red-600">
                  Hari Terisi
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
              <div key={monthStr} className="grid grid-cols-7 gap-1.5 anim-fade-slide">
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {daysInMonth.map((day) => {
                  const booked = isBooked(day);
                  const past = isBefore(day, today) && !isSameDay(day, today);
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        relative h-11 flex flex-col items-center justify-center rounded-xl cursor-default transition-transform hover:scale-105
                        ${
                          booked
                            ? "bg-red-500 text-white font-bold group shadow-sm"
                            : past
                              ? "bg-slate-50 text-slate-300"
                              : "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-100"
                        }
                        ${isToday ? "ring-2 ring-amber-400 ring-offset-1" : ""}
                      `}
                    >
                      <span className="text-sm leading-none">{day.getDate()}</span>
                      {booked && (
                        <span className="text-[9px] leading-none mt-0.5 font-semibold uppercase">
                          Penuh
                        </span>
                      )}
                      {booked && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10">
                          <div className="bg-brown text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg">
                            Sudah Terbooking
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center flex-wrap gap-4 mt-5 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-emerald-50 border border-emerald-300" />
                Tersedia
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-md bg-red-500" />
                Terisi
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

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href={waLink(waNumber, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-brown bg-tent rounded-xl hover:bg-amber-400 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <PartyPopper size={20} />
            Amankan Tanggalmu Sekarang!
          </a>
          <p className="mt-3 text-sm text-slate-500">
            Klik untuk chat admin dan tanyakan tanggal yang kamu mau.
          </p>
        </div>
      </div>
    </section>
  );
}
