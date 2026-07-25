import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CalendarAdmin from "@/components/admin/CalendarAdmin";
import BookingForm from "@/components/admin/BookingForm";
import { getBookings, createBooking, type BookingRecord } from "@/lib/adminApi";
import { toISODate, addDays } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  const monthStr = format(new Date(), "yyyy-MM");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings({ month: monthStr, limit: 100 });
      setBookings(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const now = new Date();
  const todayStr = toISODate(now);
  const weekLater = toISODate(addDays(now, 7));

  const confirmedThisMonth = bookings.filter((b) => b.status === "confirmed").length;
  const upcomingWeek = bookings.filter(
    (b) => b.status === "confirmed" && b.start_date >= todayStr && b.start_date <= weekLater
  ).length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  const recentBookings = bookings.slice(0, 5);

  async function handleCreate(form: { schoolName: string; participantCount: number; picName: string; picWa: string; startDate: string; price: number | null; status: string; keterangan: string }) {
    setFormLoading(true);
    setOverlapError(null);
    try {
      await createBooking(form as Parameters<typeof createBooking>[0]);
      setFormOpen(false);
      await loadBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      if ((err as Error & { status?: number }).status === 409) {
        setOverlapError("Tanggal bentrok dengan booking lain");
      } else {
        setOverlapError(msg);
      }
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Button onClick={() => { setOverlapError(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          Booking Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmed Bulan Ini</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{confirmedThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming 7 Hari</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{upcomingWeek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-500">{cancelledCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarAdmin
          onSelectBooking={(b) => navigate(`/admin/bookings?edit=${b.id}`)}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : recentBookings.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada booking bulan ini</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sekolah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.school_name}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(b.start_date + "T00:00:00"), "d MMM", { locale: localeId })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
