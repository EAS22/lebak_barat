import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CalendarAdmin from "@/components/admin/CalendarAdmin";
import BookingForm from "@/components/admin/BookingForm";
import { getBookings, createBooking, type BookingRecord } from "@/lib/adminApi";
import { parseDateOnly } from "@/lib/utils";
import { CalendarCheck, School, Tent, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { format, startOfMonth, getYear } from "date-fns";
import { id as localeId } from "date-fns/locale";

const MONTH_COLOR_MAP: Record<number, string> = {
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

function fmtRange(startStr: string, endStr: string): string {
  const start = parseDateOnly(startStr);
  const end = parseDateOnly(endStr);
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, "d")}–${format(end, "d MMMM", { locale: localeId })}`;
  }
  return `${format(start, "d MMM", { locale: localeId })} – ${format(end, "d MMM", { locale: localeId })}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [yearBookings, setYearBookings] = useState<BookingRecord[]>([]);
  const [_loading, setLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  const monthStr = format(currentMonth, "yyyy-MM");
  const currentYear = getYear(currentMonth);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings({ month: monthStr, limit: 200 });
      setBookings(res.data);
    } catch {
      toast.error("Gagal memuat data booking");
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  const loadYearBookings = useCallback(async () => {
    setYearLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("from", `${currentYear}-01-01`);
      qs.set("to", `${currentYear}-12-31`);
      qs.set("limit", "200");
      const params: Record<string, unknown> = {
        from: `${currentYear}-01-01`,
        to: `${currentYear}-12-31`,
        limit: 200,
      };
      const res = await getBookings(params as Parameters<typeof getBookings>[0]);
      const filtered = (res.data as BookingRecord[]).filter(
        (b) => b.status === "final" || b.status === "negosiasi"
      );
      filtered.sort(
        (a, b) => parseDateOnly(a.start_date).getTime() - parseDateOnly(b.start_date).getTime()
      );
      setYearBookings(filtered);
    } catch {
      // silent
    } finally {
      setYearLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    loadYearBookings();
  }, [loadYearBookings]);

  const finalThisMonth = bookings.filter((b) => b.status === "final").length;
  const negosiasiCount = bookings.filter((b) => b.status === "negosiasi").length;
  const batalCount = bookings.filter((b) => b.status === "batal").length;

  function focusToDate(date: Date) {
    setCurrentMonth(startOfMonth(date));
    requestAnimationFrame(() => {
      calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleCreate(form: {
    schoolName: string;
    participantCount: number;
    picName: string;
    picWa: string | null;
    startDate: string;
    price: number | null;
    status: string;
    keterangan: string;
  }) {
    setFormLoading(true);
    setOverlapError(null);
    try {
      await createBooking(form as Parameters<typeof createBooking>[0]);
      toast.success("Booking berhasil dibuat");
      setFormOpen(false);
      await Promise.all([loadBookings(), loadYearBookings()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      if ((err as Error & { status?: number }).status === 409) {
        setOverlapError("Tanggal bentrok dengan booking lain");
      } else {
        setOverlapError(msg);
      }
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Button
          onClick={() => {
            setOverlapError(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Booking Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Final Bulan Ini</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{finalThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Negosiasi</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{negosiasiCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Batal</CardTitle>
            <XCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-500">{batalCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div ref={calendarRef} className="flex flex-col">
          <CalendarAdmin
            month={monthStr}
            onMonthChange={(m) => setCurrentMonth(startOfMonth(new Date(m + "-01")))}
            onSelectBooking={(b) => navigate(`/admin/bookings?edit=${b.id}`)}
          />
        </div>

        <Card className="flex flex-col min-h-[520px]">
          <CardHeader className="shrink-0 flex flex-row items-center gap-2.5 pb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck size={18} />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">Booking {currentYear}</CardTitle>
              <p className="text-xs text-muted-foreground">Klik untuk lihat di kalender</p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-0">
            {yearLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : yearBookings.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
                <Tent size={36} className="text-emerald-300" />
                <p className="mt-3 text-sm font-semibold text-gray-700">
                  Belum ada booking final/negosiasi tahun {currentYear}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tambahkan booking baru atau ubah filter tahun di kalender.
                </p>
              </div>
            ) : (
              <ol className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5 custom-scrollbar">
                {yearBookings.map((b) => {
                  const start = parseDateOnly(b.start_date);
                  const m = start.getMonth();
                  const color = MONTH_COLOR_MAP[m] ?? MONTH_COLOR_MAP[0]!;
                  return (
                    <li
                      key={b.id}
                      onClick={() => focusToDate(start)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm hover:border-emerald-200 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <span
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border font-bold ${color}`}
                      >
                        <span className="text-base leading-none">{format(start, "d")}</span>
                        <span className="text-[9px] uppercase leading-none mt-0.5">
                          {format(start, "MMM", { locale: localeId })}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-semibold text-sm text-gray-900 truncate">
                          <School size={13} className="flex-shrink-0 text-emerald-600" />
                          <span className="truncate">{b.school_name}</span>
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {fmtRange(b.start_date, b.end_date)}
                        </span>
                      </span>
                      <span
                        className={`flex-shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          b.status === "final"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {b.status === "final" ? "Final" : "Negosiasi"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <BookingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        loading={formLoading}
        overlapError={overlapError}
      />
    </div>
  );
}
