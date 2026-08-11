import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  type FacilityRecord,
} from "@/lib/adminApi";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ICON_OPTIONS, ICON_MAP } from "@/components/landing/Facilities";

interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface Props {
  currentUser: AuthUser | null;
}

interface FacilityForm {
  name: string;
  category: "utama" | "opsional";
  sortOrder: string;
  icon: string;
}

function emptyForm(): FacilityForm {
  return { name: "", category: "utama", sortOrder: "", icon: "" };
}

export default function FacilitiesPage({ currentUser }: Props) {
  const [facilities, setFacilities] = useState<FacilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FacilityRecord | null>(null);
  const [form, setForm] = useState<FacilityForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadFacilities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch {
      toast.error("Gagal memuat data fasilitas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(f: FacilityRecord) {
    setEditing(f);
    setForm({
      name: f.name,
      category: f.category,
      sortOrder: String(f.sort_order),
      icon: f.icon ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setFormLoading(true);
    try {
      const sortOrder = form.sortOrder.trim() === "" ? undefined : parseInt(form.sortOrder, 10);
      const iconVal = form.icon.trim() === "" ? null : form.icon.trim();
      if (editing) {
        await updateFacility(editing.id, {
          name: form.name,
          category: form.category,
          ...(sortOrder !== undefined ? { sortOrder } : {}),
          icon: iconVal,
        });
        toast.success("Fasilitas berhasil diperbarui");
      } else {
        await createFacility({
          name: form.name,
          category: form.category,
          ...(sortOrder !== undefined ? { sortOrder } : {}),
          icon: form.icon.trim() || undefined,
        });
        toast.success("Fasilitas berhasil ditambahkan");
      }
      setDialogOpen(false);
      await loadFacilities();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive(f: FacilityRecord, isActive: boolean) {
    try {
      await updateFacility(f.id, { isActive });
      setFacilities((list) =>
        list.map((x) => (x.id === f.id ? { ...x, is_active: isActive } : x))
      );
      toast.success(isActive ? "Fasilitas diaktifkan" : "Fasilitas dinonaktifkan");
    } catch {
      toast.error("Gagal mengubah status fasilitas");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteFacility(deleteId);
      toast.success("Fasilitas berhasil dihapus");
      setDeleteId(null);
      await loadFacilities();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (currentUser?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">403 — Akses Ditolak</h2>
          <p className="text-gray-500">Halaman ini hanya untuk super_admin.</p>
        </div>
      </div>
    );
  }

  const utama = facilities
    .filter((f) => f.category === "utama")
    .sort((a, b) => a.sort_order - b.sort_order);
  const opsional = facilities
    .filter((f) => f.category === "opsional")
    .sort((a, b) => a.sort_order - b.sort_order);

  function renderList(items: FacilityRecord[]) {
    if (loading) {
      return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }
    if (items.length === 0) {
      return <div className="p-8 text-center text-gray-500">Belum ada fasilitas</div>;
    }
    return (
      <ul className="divide-y">
        {items.map((f) => (
          <li key={f.id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-8 text-center text-xs font-mono text-gray-400 shrink-0">
              {f.sort_order}
            </span>
            <span className="shrink-0">
              {(() => {
                const Icon = f.icon && ICON_MAP[f.icon] ? ICON_MAP[f.icon] : null;
                return Icon ? <Icon size={16} className="text-emerald-600" /> : <span className="text-xs text-slate-400">—</span>;
              })()}
            </span>
            <span className="flex-1 font-medium text-sm text-gray-900 truncate">
              {f.name}
            </span>
            {!f.is_active && (
              <Badge variant="secondary" className="shrink-0">
                Nonaktif
              </Badge>
            )}
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={f.is_active}
                onChange={(e) => handleToggleActive(f, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Aktif
            </label>
            <Button variant="ghost" size="icon" onClick={() => openEdit(f)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(f.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Fasilitas</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Fasilitas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fasilitas Utama &amp; Area</CardTitle>
        </CardHeader>
        <CardContent className="p-0">{renderList(utama)}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layanan &amp; Fasilitas Opsional</CardTitle>
        </CardHeader>
        <CardContent className="p-0">{renderList(opsional)}</CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Fasilitas" : "Tambah Fasilitas"}</DialogTitle>
            <DialogDescription>
              {editing ? "Ubah data fasilitas di bawah ini." : "Isi data untuk fasilitas baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nama Fasilitas</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Area Camping"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as "utama" | "opsional" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utama">Fasilitas Utama &amp; Area</SelectItem>
                  <SelectItem value="opsional">Layanan &amp; Fasilitas Opsional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select
                value={form.icon || "__auto__"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, icon: v === "__auto__" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih icon (auto dari nama jika kosong)">
                    {form.icon
                      ? (() => {
                          const opt = ICON_OPTIONS.find((o) => o.key === form.icon);
                          const Icon = form.icon ? ICON_MAP[form.icon] : null;
                          return opt ? (
                            <span className="flex items-center gap-2">
                              {Icon && <Icon size={16} />}
                              {opt.label}
                            </span>
                          ) : (
                            form.icon
                          );
                        })()
                      : "Auto (dari nama)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="__auto__">Auto (dari nama)</SelectItem>
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = ICON_MAP[opt.key];
                    return (
                      <SelectItem key={opt.key} value={opt.key}>
                        <span className="flex items-center gap-2">
                          {Icon && <Icon size={16} />}
                          {opt.label} ({opt.key})
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500">Icon tampil di card landing. Kosongkan untuk auto detect dari nama fasilitas.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Urutan (opsional)</Label>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading || !form.name.trim()}>
              {formLoading ? "Menyimpan..." : editing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Fasilitas?</DialogTitle>
            <DialogDescription>
              Fasilitas akan dihapus permanen. Tindakan tidak bisa dibatalkan.
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
