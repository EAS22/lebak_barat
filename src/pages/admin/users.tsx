import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserRecord,
} from "@/lib/adminApi";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface Props {
  currentUser: AuthUser | null;
}

export default function UsersPage({ currentUser }: Props) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
    waNumber: "",
    role: "booking_admin" as "super_admin" | "booking_admin",
    isActive: true,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function openCreate() {
    setEditingUser(null);
    setForm({
      username: "",
      password: "",
      displayName: "",
      waNumber: "",
      role: "booking_admin",
      isActive: true,
    });
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(u: UserRecord) {
    setEditingUser(u);
    setForm({
      username: u.username,
      password: "",
      displayName: u.display_name,
      waNumber: u.wa_number || "",
      role: u.role,
      isActive: u.is_active,
    });
    setError(null);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setFormLoading(true);
    setError(null);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          username: form.username,
          displayName: form.displayName,
          waNumber: form.waNumber || null,
          role: form.role,
          isActive: form.isActive,
        };
        if (form.password) payload.password = form.password;
        await updateUser(editingUser.id, payload as Parameters<typeof updateUser>[1]);
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          displayName: form.displayName,
          waNumber: form.waNumber || null,
          role: form.role,
          isActive: form.isActive,
        });
      }
      setDialogOpen(false);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan";
      if ((err as Error & { status?: number }).status === 409) {
        setError("Username sudah digunakan");
      } else {
        setError(msg);
      }
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteId);
      setDeleteId(null);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus";
      setError(msg);
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function isSelf(userId: string) {
    return currentUser?.id === userId;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Users</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah User
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Tutup</button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada user</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>WA</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.display_name}</TableCell>
                      <TableCell className="text-xs">{u.wa_number || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            u.role === "super_admin"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }
                        >
                          {u.role === "super_admin" ? "Super Admin" : "Booking Admin"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? "default" : "secondary"}>
                          {u.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {u.created_at
                          ? format(new Date(u.created_at), "d MMM yyyy HH:mm", { locale: localeId }) + " WIB"
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isSelf(u.id)}
                            title={isSelf(u.id) ? "Tidak bisa hapus akun sendiri" : "Hapus"}
                            onClick={() => setDeleteId(u.id)}
                          >
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Tambah User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Ubah data user di bawah ini." : "Isi data untuk user baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="username"
                disabled={!!editingUser}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{editingUser ? "Password (opsional)" : "Password"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editingUser ? "Kosongkan jika tidak ganti" : "Min. 6 karakter"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Nama tampilan"
              />
            </div>
            <div className="space-y-1.5">
              <Label>No. WhatsApp</Label>
              <Input
                value={form.waNumber}
                onChange={(e) => setForm((f) => ({ ...f, waNumber: e.target.value }))}
                placeholder="628xxxxxxxxxx"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, role: v as "super_admin" | "booking_admin" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="booking_admin">Booking Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Aktif
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                formLoading ||
                !form.username ||
                (!editingUser && !form.password) ||
                !form.displayName
              }
            >
              {formLoading ? "Menyimpan..." : editingUser ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus User?</DialogTitle>
            <DialogDescription>
              User akan dihapus permanen. Tindakan tidak bisa dibatalkan.
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
