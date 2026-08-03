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
  generateInvoice,
  type BookingRecord,
} from "@/lib/adminApi";
import { formatIDR, parseDateOnly, cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_BADGE_CLASS } from "@/lib/bookingStatus";
import { generateInvoicePdf, type InvoiceBookingData } from "@/lib/invoicePdf";
import { Plus, Download, Pencil, Trash2, ChevronLeft, ChevronRight, FileText, AlertTriangle } from "lucide-react";
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

  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [missingFieldsOpen, setMissingFieldsOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [pendingInvoiceBooking, setPendingInvoiceBooking] = useState<BookingRecord | null>(null);

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

  function checkInvoiceCompleteness(b: BookingRecord): string[] {
    const miss: string[] = [];
    if (!b.participant_count || b.participant_count <= 0) miss.push("Jumlah siswa");
    if (!b.pic_name || b.pic_name.trim().length < 2) miss.push("Nama PIC");
    if (!b.pic_wa || b.pic_wa.trim().length < 8) miss.push("Kontak PIC");
    if (b.price == null) miss.push("Harga sewa");
    return miss;
  }

  async function handleGenerateInvoice(b: BookingRecord) {
    const missing = checkInvoiceCompleteness(b);
    if (missing.length > 0) {
      setMissingFields(missing);
      setPendingInvoiceBooking(b);
      setMissingFieldsOpen(true);
      return;
    }
    setInvoiceId(b.id);
    setInvoiceLoading(true);
    try {
      const invoiceData = await generateInvoice(b.id);
      const raw = invoiceData as unknown as Record<string, unknown>;
      const pdfData: InvoiceBookingData = {
        invoice_number: (invoiceData.invoice_number || raw["invoice_number"] || "") as string,
        school_name: (raw["school_name"] ?? b.school_name) as string,
        participant_count: (raw["participant_count"] ?? b.participant_count) as number,
        pic_name: (raw["pic_name"] ?? b.pic_name) as string,
        pic_wa: (raw["pic_wa"] ?? b.pic_wa) as string,
        start_date: (raw["start_date"] ?? b.start_date) as string,
        end_date: (raw["end_date"] ?? b.end_date) as string,
        status: (raw["status"] ?? b.status) as string,
        price: (raw["price"] ?? b.price) as number,
        invoice_generated_at: (raw["invoice_generated_at"] ?? new Date().toISOString()) as string,
      };
      await generateInvoicePdf(pdfData);
      toast.success(`Invoice ${pdfData.invoice_number} berhasil diunduh`);
      await loadBookings();
    } catch (err: unknown) {
      const e = err as { missing?: string[]; message?: string; status?: number };
      if (e.status === 422 && e.missing && e.missing.length > 0) {
        setMissingFields(e.missing);
        setPendingInvoiceBooking(b);
        setMissingFieldsOpen(true);
      } else {
        toast.error(e.message || "Gagal cetak invoice");
      }
    } finally {
      setInvoiceId(null);
      setInvoiceLoading(false);
    }
  }

  function handleOpenEditFromMissing() {
    if (!pendingInvoiceBooking) return;
    setMissingFieldsOpen(false);
    openEdit(pendingInvoiceBooking);
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

  const bookingsWithoutInvoice = bookings.filter((b) => !b.invoice_number && b.status === "final").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Booking</h2>
          {bookingsWithoutInvoice > 0 && (
            <p className="mt-1 text-sm text-amber-600">
              {bookingsWithoutInvoice} booking final belum dicetak invoice
            </p>
          )}
        </div>
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

      {/* Invoice quick-help */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-800">Cetak Invoice PDF dengan QR Code</p>
          <p className="mt-0.5 text-xs text-emerald-700/80">
            Pastikan Jumlah siswa, Nama PIC, Kontak PIC, dan Harga sewa sudah diisi. Klik ikon{" "}
            <FileText className="h-3.5 w-3.5 inline text-emerald-600" /> hijau di kolom Aksi untuk
            generate invoice. Jika data belum lengkap, modal edit akan terbuka otomatis.
            QR di invoice mengarah ke halaman verifikasi publik.
          </p>
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
                      <TableHead className="w-[160px]">Invoice</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right w-[180px]">Aksi</TableHead>
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
                      <TableCell className="text-xs">
                        {b.invoice_number ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {b.invoice_number}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={invoiceLoading && invoiceId === b.id}
                              onClick={() => handleGenerateInvoice(b)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" /> Cetak Lagi
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                            disabled={invoiceLoading && invoiceId === b.id}
                            onClick={() => handleGenerateInvoice(b)}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            {invoiceLoading && invoiceId === b.id ? "Membuat..." : "Cetak Invoice"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-xs text-gray-500">
                        {b.keterangan || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(b)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Hapus" onClick={() => setDeleteId(b.id)}>
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

      <Dialog open={missingFieldsOpen} onOpenChange={setMissingFieldsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Data Belum Lengkap
            </DialogTitle>
            <DialogDescription>
              Data berikut wajib diisi untuk menerbitkan invoice:
              <ul className="mt-2 list-disc list-inside text-sm font-medium text-gray-700">
                {missingFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMissingFieldsOpen(false)}>
              Tutup
            </Button>
            <Button onClick={handleOpenEditFromMissing}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
