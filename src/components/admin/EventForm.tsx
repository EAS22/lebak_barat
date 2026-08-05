import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toISODate, addDays } from "@/lib/utils";
import type { EventRecord } from "@/lib/adminApi";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EventRecord;
  onSubmit: (data: FormDataType) => Promise<void>;
  loading?: boolean;
  overlapError?: string | null;
}

interface FormDataType {
  institution: string;
  eventName: string;
  participantCount: number;
  startDate: string;
  endDate?: string;
  keterangan: string;
}

function emptyForm(): FormDataType {
  return {
    institution: "",
    eventName: "",
    participantCount: 50,
    startDate: toISODate(new Date()),
    endDate: "",
    keterangan: "",
  };
}

function fromRecord(r: EventRecord): FormDataType {
  return {
    institution: r.institution,
    eventName: r.event_name,
    participantCount: r.participant_count,
    startDate: r.start_date.slice(0, 10),
    endDate: r.end_date.slice(0, 10) !== r.start_date.slice(0, 10) ? r.end_date.slice(0, 10) : "",
    keterangan: r.keterangan ?? "",
  };
}

export default function EventForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  loading,
  overlapError,
}: EventFormProps) {
  const [form, setForm] = useState<FormDataType>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(initialData ? fromRecord(initialData) : emptyForm());
      setErrors({});
    }
  }, [open, initialData]);

  function setField<K extends keyof FormDataType>(key: K, value: FormDataType[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.institution.trim().length < 2) e.institution = "Wajib diisi min 2";
    if (form.eventName.trim().length < 2) e.eventName = "Wajib diisi min 2";
    if (form.participantCount < 1) e.participantCount = "Minimal 1";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) e.startDate = "Format YYYY-MM-DD";
    if (form.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(form.endDate)) e.endDate = "Format YYYY-MM-DD";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const payload: FormDataType & { endDate?: string } = { ...form };
    if (!payload.endDate) {
      payload.endDate = toISODate(addDays(new Date(form.startDate + "T00:00:00"), 2));
    }
    await onSubmit(payload);
  }

  const endPreview = form.startDate
    ? form.endDate || toISODate(addDays(new Date(form.startDate + "T00:00:00"), 2))
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Event Internal" : "Event Internal Baru"}</DialogTitle>
          <DialogDescription>
            Event internal akan memblokir tanggal di kalender. Tidak bisa dibooking client jika bentrok. Warna biru tua di kalender.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {overlapError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{overlapError}</div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="institution">Lembaga Penyelenggara</Label>
            <Input
              id="institution"
              value={form.institution}
              onChange={(e) => setField("institution", e.target.value)}
              placeholder="Contoh: Kwarran Banjaran"
            />
            {errors.institution && <p className="text-xs text-red-600">{errors.institution}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eventName">Nama Event / Kegiatan</Label>
            <Input
              id="eventName"
              value={form.eventName}
              onChange={(e) => setField("eventName", e.target.value)}
              placeholder="Contoh: Jambore Ranting 2025"
            />
            {errors.eventName && <p className="text-xs text-red-600">{errors.eventName}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="participantCount">Jumlah Peserta</Label>
            <Input
              id="participantCount"
              type="number"
              min={1}
              value={form.participantCount}
              onChange={(e) => setField("participantCount", parseInt(e.target.value) || 0)}
            />
            {errors.participantCount && <p className="text-xs text-red-600">{errors.participantCount}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
              {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">Tanggal Selesai (opsional, default +2 hari)</Label>
              <Input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
              <p className="text-[11px] text-gray-400">Preview selesai: {endPreview || "—"}</p>
              {errors.endDate && <p className="text-xs text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              value={form.keterangan}
              onChange={(e) => setField("keterangan", e.target.value)}
              placeholder="Catatan tambahan..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-900 hover:bg-blue-800">
              {loading ? "Menyimpan..." : initialData ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
