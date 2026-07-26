import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { addDays, toISODate, formatIDR } from "@/lib/utils";
import type { BookingRecord } from "@/lib/adminApi";

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BookingRecord;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  overlapError?: string | null;
}

interface FormData {
  schoolName: string;
  participantCount: number;
  picName: string;
  picWa: string | null;
  startDate: string;
  price: number | null;
  status: "final" | "negosiasi" | "batal";
  keterangan: string;
}

function emptyForm(): FormData {
  return {
    schoolName: "",
    participantCount: 50,
    picName: "",
    picWa: "",
    startDate: toISODate(new Date()),
    price: null,
    status: "negosiasi",
    keterangan: "",
  };
}

function fromRecord(r: BookingRecord): FormData {
  return {
    schoolName: r.school_name,
    participantCount: r.participant_count,
    picName: r.pic_name,
    picWa: r.pic_wa ?? "",
    startDate: r.start_date.slice(0, 10),
    price: r.price != null ? Number(r.price) : null,
    status: r.status,
    keterangan: r.keterangan ?? "",
  };
}

export default function BookingForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  loading,
  overlapError,
}: BookingFormProps) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(initialData ? fromRecord(initialData) : emptyForm());
      setErrors({});
    }
  }, [open, initialData]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.schoolName.trim().length < 2) e.schoolName = "Wajib diisi (min 2)";
    if (form.participantCount < 1) e.participantCount = "Minimal 1";
    if (form.picName.trim().length < 2) e.picName = "Wajib diisi";
    const wa = (form.picWa ?? "").trim();
    if (form.status === "final" && wa.length < 8) {
      e.picWa = "No. WhatsApp PIC wajib diisi untuk status Final";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) e.startDate = "Format YYYY-MM-DD";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const wa = (form.picWa ?? "").trim();
    await onSubmit({ ...form, picWa: wa === "" ? null : wa });
  }

  const endDate = form.startDate ? toISODate(addDays(new Date(form.startDate + "T00:00:00"), 2)) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Booking" : "Booking Baru"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Ubah data booking" : "Tambah booking baru untuk bumi perkemahan"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {overlapError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{overlapError}</div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="schoolName">Nama Sekolah</Label>
            <Input
              id="schoolName"
              value={form.schoolName}
              onChange={(e) => set("schoolName", e.target.value)}
              placeholder="SMPN 1 Lebak"
            />
            {errors.schoolName && <p className="text-xs text-red-600">{errors.schoolName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="participantCount">Jumlah Peserta</Label>
              <Input
                id="participantCount"
                type="number"
                min={1}
                value={form.participantCount}
                onChange={(e) => set("participantCount", parseInt(e.target.value) || 0)}
              />
              {errors.participantCount && <p className="text-xs text-red-600">{errors.participantCount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Harga (IDR)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={form.price ?? ""}
                onChange={(e) => set("price", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="picName">Nama PIC</Label>
            <Input
              id="picName"
              value={form.picName}
              onChange={(e) => set("picName", e.target.value)}
              placeholder="Budi"
            />
            {errors.picName && <p className="text-xs text-red-600">{errors.picName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="picWa">No. WhatsApp PIC</Label>
            <Input
              id="picWa"
              value={form.picWa ?? ""}
              onChange={(e) => set("picWa", e.target.value)}
              placeholder="6281234567890"
            />
            <p className="text-xs text-gray-500">Wajib diisi jika status Final</p>
            {errors.picWa && <p className="text-xs text-red-600">{errors.picWa}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
              {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Selesai</Label>
              <div className="h-9 flex items-center text-sm text-gray-600 bg-gray-50 rounded-md px-3 border">
                {endDate || "—"}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as "final" | "negosiasi" | "batal")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="negosiasi">Negosiasi</SelectItem>
                <SelectItem value="batal">Batal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              value={form.keterangan}
              onChange={(e) => set("keterangan", e.target.value)}
              placeholder="Catatan tambahan..."
              rows={3}
            />
          </div>

          {form.price != null && form.price > 0 && (
            <p className="text-xs text-gray-500">Harga: {formatIDR(form.price)}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : initialData ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
