import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import EventForm from "@/components/admin/EventForm";
import { getEvents, createEvent, updateEvent, deleteEvent, type EventRecord } from "@/lib/adminApi";
import { parseDateOnly } from "@/lib/utils";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (search) params.search = search;
      if (monthFilter) params.month = monthFilter;
      const res = await getEvents(params as Parameters<typeof getEvents>[0]);
      setEvents(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Gagal memuat data event");
    } finally {
      setLoading(false);
    }
  }, [page, search, monthFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    setPage(1);
  }, [search, monthFilter]);

  function openCreate() {
    setEditingEvent(undefined);
    setOverlapError(null);
    setFormOpen(true);
  }

  function openEdit(e: EventRecord) {
    setEditingEvent(e);
    setOverlapError(null);
    setFormOpen(true);
  }

  async function handleFormSubmit(form: {
    institution: string;
    eventName: string;
    participantCount: number;
    startDate: string;
    endDate?: string;
    keterangan: string;
  }) {
    setFormLoading(true);
    setOverlapError(null);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, form as Parameters<typeof updateEvent>[1]);
        toast.success("Event berhasil diperbarui");
      } else {
        await createEvent(form as Parameters<typeof createEvent>[0]);
        toast.success("Event berhasil dibuat");
      }
      setFormOpen(false);
      await loadEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      if ((err as Error & { status?: number }).status === 409) {
        setOverlapError(msg);
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
      await deleteEvent(deleteId);
      toast.success("Event berhasil dihapus");
      setDeleteId(null);
      await loadEvents();
    } catch {
      toast.error("Gagal menghapus event");
    } finally {
      setDeleteLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-blue-900" />
            Event Internal
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Event internal berwarna biru tua di kalender. Tanggal yang di-set tidak bisa dibooking.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-900 hover:bg-blue-800">
          <Plus className="h-4 w-4 mr-1" />
          Event Baru
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cari</Label>
              <Input
                placeholder="Lembaga / Nama event..."
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada event ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lembaga</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Peserta</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-medium">{ev.institution}</TableCell>
                      <TableCell>{ev.event_name}</TableCell>
                      <TableCell>{ev.participant_count}</TableCell>
                      <TableCell className="text-sm">
                        {format(parseDateOnly(ev.start_date), "d MMM yyyy", { locale: localeId })}
                        {" — "}
                        {format(parseDateOnly(ev.end_date), "d MMM yyyy", { locale: localeId })}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs text-gray-500">
                        {ev.keterangan || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(ev)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(ev.id)}>
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

      <EventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingEvent}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        overlapError={overlapError}
      />

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Event?</DialogTitle>
            <DialogDescription>
              Event ini akan dihapus permanen. Tindakan tidak bisa dibatalkan.
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
