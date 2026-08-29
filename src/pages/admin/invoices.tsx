import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  getBookings,
  generateInvoice,
  type BookingRecord,
} from "@/lib/adminApi";
import { useAuth } from "@/lib/authContext";
import { formatIDR, parseDateOnly } from "@/lib/utils";
import { generateInvoicePdf, type InvoiceBookingData } from "@/lib/invoicePdf";
import { FileText, Search, QrCode, AlertTriangle, Pencil, Download, X } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import BookingForm from "@/components/admin/BookingForm";
import { updateBooking } from "@/lib/adminApi";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [missingOpen, setMissingOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [pendingBooking, setPendingBooking] = useState<BookingRecord | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<{ uri: string; nomor: string; save: () => void } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings({ limit: 100, status: "final" });
      let data = res.data;
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (b) =>
            b.school_name.toLowerCase().includes(q) ||
            (b.invoice_number && b.invoice_number.toLowerCase().includes(q))
        );
      }
      // with invoice first, then without
      data.sort((a, b) => {
        if (a.invoice_number && !b.invoice_number) return -1;
        if (!a.invoice_number && b.invoice_number) return 1;
        return parseDateOnly(b.start_date).getTime() - parseDateOnly(a.start_date).getTime();
      });
      setBookings(data);
    } catch {
      toast.error("Gagal memuat invoices");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  function checkCompleteness(b: BookingRecord): string[] {
    const miss: string[] = [];
    if (!b.participant_count || b.participant_count <= 0) miss.push("Jumlah siswa");
    if (!b.pic_name || b.pic_name.trim().length < 2) miss.push("Nama PIC");
    if (!b.pic_wa || b.pic_wa.trim().length < 8) miss.push("Kontak PIC");
    if (b.price == null) miss.push("Harga sewa");
    return miss;
  }

  async function handleGenerate(b: BookingRecord) {
    const miss = checkCompleteness(b);
    if (miss.length > 0) {
      setMissingFields(miss);
      setPendingBooking(b);
      setMissingOpen(true);
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
      const generatedByName = (user as { displayName?: string })?.displayName || user?.username;
      const result = await generateInvoicePdf(pdfData, { generatedByName, previewOnly: true } as never) as unknown as { blobUrl?: string; doc?: { save: (n: string) => void } };
      if (result.blobUrl) {
        setInvoicePreview({ uri: result.blobUrl, nomor: pdfData.invoice_number, save: () => result.doc!.save(`Invoice-${pdfData.invoice_number}.pdf`) });
        toast.success(`Preview invoice ${pdfData.invoice_number} siap`);
      } else {
        await generateInvoicePdf(pdfData, { generatedByName } as never);
        toast.success(`Invoice ${pdfData.invoice_number} berhasil diunduh`);
      }
      await load();
    } catch (err: unknown) {
      const e = err as { missing?: string[]; message?: string; status?: number };
      if (e.status === 422 && e.missing?.length) {
        setMissingFields(e.missing);
        setPendingBooking(b);
        setMissingOpen(true);
      } else {
        toast.error(e.message || "Gagal cetak invoice");
      }
    } finally {
      setInvoiceId(null);
      setInvoiceLoading(false);
    }
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
    if (!editingBooking) return;
    setFormLoading(true);
    try {
      await updateBooking(editingBooking.id, form as Parameters<typeof updateBooking>[1]);
      toast.success("Booking diperbarui — silakan cetak invoice lagi");
      setFormOpen(false);
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  }

  const withoutInvoice = bookings.filter((b) => !b.invoice_number).length;
  const withInvoice = bookings.filter((b) => !!b.invoice_number).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="h-6 w-6 text-emerald-600" />
            Invoices & QR Verifikasi
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Cetak PDF invoice dengan QR Code untuk verifikasi keaslian di landing page.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {withInvoice} sudah ada invoice, {withoutInvoice} belum
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari sekolah / nomor invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada booking final. Invoice hanya untuk status Final.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sekolah</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        <div>{b.school_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {b.participant_count} siswa • {b.pic_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(parseDateOnly(b.start_date), "d MMM yyyy", { locale: localeId })} →{" "}
                        {format(parseDateOnly(b.end_date), "d MMM yyyy", { locale: localeId })}
                      </TableCell>
                      <TableCell className="text-sm">{formatIDR(b.price)}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {b.invoice_number ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {b.invoice_number}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-8"
                          variant={b.invoice_number ? "outline" : "default"}
                          disabled={invoiceLoading && invoiceId === b.id}
                          onClick={() => handleGenerate(b)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {b.invoice_number ? "Cetak Lagi" : "Cetak Invoice"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BookingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingBooking}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      <Dialog open={missingOpen} onOpenChange={setMissingOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Data Belum Lengkap
            </DialogTitle>
            <DialogDescription>
              Lengkapi data berikut sebelum cetak invoice:
              <ul className="mt-2 list-disc list-inside text-sm font-medium text-gray-700">
                {missingFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMissingOpen(false)}>
              Tutup
            </Button>
            <Button
              onClick={() => {
                if (pendingBooking) {
                  setEditingBooking(pendingBooking);
                  setMissingOpen(false);
                  setFormOpen(true);
                }
              }}
            >
              <Pencil className="h-4 w-4 mr-1" /> Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {invoicePreview && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInvoicePreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <h3 className="font-bold text-sm">Preview Invoice — {invoicePreview.nomor}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => { invoicePreview.save(); toast.success("Invoice diunduh"); }} className="bg-emerald-600 hover:bg-emerald-700"><Download size={14} className="mr-1" />Download</Button>
                <Button variant="ghost" size="icon" onClick={() => setInvoicePreview(null)}><X size={18} /></Button>
              </div>
            </div>
            <iframe src={invoicePreview.uri} className="flex-1 w-full border-0" title="Preview Invoice" />
          </div>
        </div>
      )}
    </div>
  );
}


