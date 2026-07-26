import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import BookingForm from "@/components/admin/BookingForm";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  exportBookings,
  type BookingRecord,
} from "@/lib/adminApi";
import { formatIDR, parseDateOnly, cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_BADGE_CLASS } from "@/lib/bookingStatus";
import { Plus, Download, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (search) params.search = search;
      if (monthFilter) params.month = monthFilter;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;

      const res = await getBookings(params as Parameters<typeof getBookings>[0]);
      setBookings(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Gagal memuat data booking");
    } finally {
      setLoading(false);
    }
  }, [page, search, monthFilter, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    setPage(1);
  }, [search, monthFilter, statusFilter]);

  function openCreate() {
    setEditingBooking(undefined);
    setOverlapError(null);
    setFormOpen(true);
  }

  function openEdit(b: BookingRecord) {
    setEditingBooking(b);
    setOverlapError(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(form: {
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
      if (editingBooking) {
        await updateBooking(editingBooking.id, form as Parameters<typeof updateBooking>[1]);
        toast.success("Booking berhasil diperbarui");
      } else {
        await createBooking(form as Parameters<typeof createBooking>[0]);
        toast.success("Booking berhasil dibuat");
      }
      setFormOpen(false);
      await loadBookings();
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

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteBooking(deleteId);
      toast.success("Booking berhasil dihapus");
      setDeleteId(null);
      await loadBookings();
    } catch {
      toast.error("Gagal menghapus booking");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleExport() {
    try {
      const params: Record<string, string> = {};
      if (monthFilter) {
        const [y, m] = monthFilter.split("-").map(Number);
        params.from = `${monthFilter}-01`;
        const lastDay = new Date(y!, m!, 0).getDate();
        params.to = `${monthFilter}-${String(lastDay).padStart(2, "0")}`;
      }
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      await exportBookings(params as Parameters<typeof exportBookings>[0]);
      toast.success("Export CSV berhasil diunduh");
    } catch {
      toast.error("Gagal export CSV");
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Booking</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Booking Baru
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Cari</Label>
              <Input
                placeholder="Nama sekolah / PIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bulan</Label>
              <Input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="negosiasi">Negosiasi</SelectItem>
                  <SelectItem value="batal">Batal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada booking ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sekolah</TableHead>
                    <TableHead>Peserta</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>WA</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.school_name}</TableCell>
                      <TableCell>{b.participant_count}</TableCell>
                      <TableCell>{b.pic_name}</TableCell>
                      <TableCell className="text-xs">{b.pic_wa || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {format(parseDateOnly(b.start_date), "d MMM yyyy", { locale: localeId })}
                        {" — "}
                        {format(parseDateOnly(b.end_date), "d MMM yyyy", { locale: localeId })}
                      </TableCell>
                      <TableCell>{b.price != null ? formatIDR(b.price) : "—"}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
                            STATUS_BADGE_CLASS[b.status]
                          )}
                        >
                          {STATUS_LABEL[b.status]}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-xs text-gray-500">
                        {b.keterangan || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Halaman {page} dari {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <BookingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingBooking}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        overlapError={overlapError}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Booking?</DialogTitle>
            <DialogDescription>
              Booking ini akan dihapus permanen. Tindakan tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" disabled={deleteLoading} onClick={handleDelete}>
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
