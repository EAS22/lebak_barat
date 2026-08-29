import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSettings, updateSettings, type SettingsRecord, getLetterRecipients, createLetterRecipient, updateLetterRecipient, deleteLetterRecipient, type LetterRecipient } from "@/lib/adminApi";
import { Save, Plus, Trash2, Check, ChevronUp, ChevronDown } from "lucide-react";
import { formatDateTimeWIB } from "@/lib/utils";

interface AuthUser { id: string; username: string; role: string; }
interface Props { currentUser: AuthUser | null; }

export default function SettingsPage({ currentUser }: Props) {
  const [settings, setSettings] = useState<SettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    buperName: "",
    letterBody: "",
    signKetua: "",
    signSekretaris: "",
    signKades: "",
    signDirBumdes: "",
  });
  const [recipients, setRecipients] = useState<LetterRecipient[]>([]);
  const [newRecName, setNewRecName] = useState("");
  const [seqInfo, setSeqInfo] = useState<{ seq: number; nomor: string } | null>(null);
  const [seqInput, setSeqInput] = useState("");
  const [seqLoading, setSeqLoading] = useState(false);

  async function loadSeq() {
    try {
      const res = await fetch("/api/letter/next-number-preview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { seq: number; nomor: string };
        setSeqInfo(data);
        setSeqInput(String(data.seq));
      }
    } catch {}
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [data, recs] = await Promise.all([getSettings(), getLetterRecipients()]);
        setSettings(data);
        setRecipients(recs);
        setForm({
          buperName: data.buper_name || "",
          letterBody: (data.letter_body as string) || "",
          signKetua: (data.sign_ketua as string) || "",
          signSekretaris: (data.sign_sekretaris as string) || "",
          signKades: (data.sign_kades as string) || "",
          signDirBumdes: (data.sign_dirbumdes as string) || "",
        });
        await loadSeq();
      } catch { toast.error("Gagal memuat pengaturan"); } finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true); setError(null); setSuccess(false);
    try {
      const data = await updateSettings({
        buperName: form.buperName || undefined,
        letterBody: form.letterBody || undefined,
        signKetua: form.signKetua || undefined,
        signSekretaris: form.signSekretaris || undefined,
        signKades: form.signKades || undefined,
        signDirBumdes: form.signDirBumdes || undefined,
      } as never);
      setSettings(data as never); setSuccess(true); toast.success("Pengaturan berhasil disimpan");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) { const msg = err instanceof Error ? err.message : "Gagal menyimpan"; setError(msg); toast.error(msg); } finally { setSaving(false); }
  }

  async function handleAddRecipient() {
    if (newRecName.trim().length < 2) { toast.error("Nama minimal 2 karakter"); return; }
    try {
      const rec = await createLetterRecipient({ name: newRecName.trim() });
      setRecipients((r) => [...r, rec].sort((a, b) => a.sort_order - b.sort_order));
      setNewRecName(""); toast.success("Penerima ditambahkan");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal"); }
  }

  async function toggleDefault(rec: LetterRecipient) {
    try {
      const upd = await updateLetterRecipient(rec.id, { is_default: !rec.is_default });
      setRecipients((r) => r.map((x) => x.id === rec.id ? upd : x));
    } catch { toast.error("Gagal update"); }
  }

  async function handleDeleteRec(id: string) {
    if (!confirm("Hapus penerima ini?")) return;
    try {
      await deleteLetterRecipient(id);
      setRecipients((r) => r.filter((x) => x.id !== id));
      toast.success("Dihapus");
    } catch { toast.error("Gagal hapus"); }
  }

  async function moveRecipient(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= recipients.length) return;
    const a = [...recipients];
    const tmp = a[idx]!;
    a[idx] = a[newIdx]!;
    a[newIdx] = tmp!;
    setRecipients(a);
    try {
      await Promise.all(a.map((r, i) => updateLetterRecipient(r.id, { sort_order: i + 1 })));
      toast.success("Urutan disimpan");
    } catch { toast.error("Gagal simpan urutan"); }
  }

  async function handleResetSeq() {
    const val = parseInt(seqInput, 10);
    if (Number.isNaN(val) || val < 0) { toast.error("Nomor harus angka >= 0"); return; }
    if (!confirm(`Reset nomor surat ke ${val}? Nomor selanjutnya akan jadi ${String(val + 1).padStart(3, "0")}/BPLB/...`)) return;
    setSeqLoading(true);
    try {
      const res = await fetch("/api/letter/reset-seq", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seq: val }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error((err as { error?: string }).error || "Gagal reset"); }
      const data = await res.json() as { seq: number; nomor: string };
      setSeqInfo(data);
      setSeqInput(String(data.seq));
      toast.success(`Nomor di-reset: selanjutnya ${data.nomor}`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal reset"); } finally { setSeqLoading(false); }
  }

  if (currentUser?.role !== "super_admin") {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-center"><h2 className="text-2xl font-bold text-red-600 mb-2">403 — Akses Ditolak</h2><p className="text-gray-500">Halaman ini hanya untuk super_admin.</p></div></div>;
  }
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error} <button className="ml-2 underline" onClick={() => setError(null)}>Tutup</button></div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md text-sm">Pengaturan berhasil disimpan.</div>}

      <Card>
        <CardHeader><CardTitle>Informasi Buper</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Nama Buper</Label><Input value={form.buperName} onChange={(e) => setForm((f) => ({ ...f, buperName: e.target.value }))} placeholder="Bumi Perkemahan Lebak Barat" /></div>
          <p className="text-xs text-gray-500">Kontak WhatsApp landing page diambil dari daftar <span className="font-semibold">Users → Admin Booking</span> yang aktif dan punya nomor WA.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Redaksi Surat Pemberitahuan</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Label>Isi Redaksi (editable, default dari pemberitahuan.md)</Label>
          <Textarea value={form.letterBody} onChange={(e) => setForm((f) => ({ ...f, letterBody: e.target.value }))} rows={12} placeholder="Ketuk untuk edit redaksi surat..." className="font-mono text-sm leading-relaxed" />
          <p className="text-xs text-gray-500">Disimpan di DB settings. Saat generate surat, akan pre-filled dan bisa diedit per surat tanpa ubah default.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Penandatangan Surat (4 orang)</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Ketua Pengelola Buper Lebak Barat</Label><Input value={form.signKetua} onChange={(e) => setForm((f) => ({ ...f, signKetua: e.target.value }))} placeholder="Nama lengkap Ketua" /></div>
          <div className="space-y-1.5"><Label>Sekretaris</Label><Input value={form.signSekretaris} onChange={(e) => setForm((f) => ({ ...f, signSekretaris: e.target.value }))} placeholder="Nama Sekretaris" /></div>
          <div className="space-y-1.5"><Label>Mengetahui — Kepala Desa Girimulya</Label><Input value={form.signKades} onChange={(e) => setForm((f) => ({ ...f, signKades: e.target.value }))} placeholder="Nama Kades" /></div>
          <div className="space-y-1.5"><Label>Direktur BUMDes Gunung Sembung</Label><Input value={form.signDirBumdes} onChange={(e) => setForm((f) => ({ ...f, signDirBumdes: e.target.value }))} placeholder="Nama Direktur BUMDes" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Penerima Default — Kepada Yth.</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-gray-500">Centang yang default otomatis terpilih saat generate surat. Bisa tambah pihak lain per surat nanti.</p>
          <div className="space-y-2">
            {recipients.map((rec, idx) => (
              <div key={rec.id} className="flex items-center gap-1 p-2 rounded-lg border bg-slate-50/60">
                <button
                  type="button"
                  onClick={() => toggleDefault(rec)}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${rec.is_default ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-300"}`}
                >
                  {rec.is_default && <Check size={12} />}
                </button>
                <span className="flex-1 text-sm">{idx + 1}. {rec.name}</span>
                <span className="text-xs text-slate-400 hidden sm:inline">{rec.is_default ? "Default" : ""}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" disabled={idx === 0} onClick={() => moveRecipient(idx, -1)}><ChevronUp size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" disabled={idx === recipients.length - 1} onClick={() => moveRecipient(idx, 1)}><ChevronDown size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 shrink-0" onClick={() => handleDeleteRec(rec.id)}><Trash2 size={14} /></Button>
              </div>
            ))}
            {recipients.length === 0 && <p className="text-sm text-slate-400">Belum ada penerima default</p>}
          </div>
          <div className="flex gap-2">
            <Input value={newRecName} onChange={(e) => setNewRecName(e.target.value)} placeholder="Tambah penerima (contoh: Kapolres Majalengka)" onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()} />
            <Button onClick={handleAddRecipient}><Plus size={16} className="mr-1" />Tambah</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nomor Surat — Auto Increment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-700">Nomor selanjutnya (preview):</p>
            <p className="text-lg font-mono font-bold">{seqInfo?.nomor ?? "Memuat..."}</p>
            <p className="text-xs text-slate-500">Seq saat ini: {seqInfo ? seqInfo.seq - 1 : "—"} → selanjutnya {seqInfo?.seq ?? "—"}</p>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Reset / Set Nomor (seq)</Label>
              <Input type="number" min={0} value={seqInput} onChange={(e) => setSeqInput(e.target.value)} placeholder="12" />
            </div>
            <Button onClick={handleResetSeq} disabled={seqLoading} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">{seqLoading ? "Memproses..." : "Reset Nomor"}</Button>
          </div>
          <p className="text-xs text-slate-500">Reset akan set `letter_seq` ke angka input. Nomor selanjutnya = input + 1 (misal set 12 → selanjutnya 013). Hapus arsip terbaru juga auto decrement. Gunakan hati-hati.</p>
        </CardContent>
      </Card>

      {settings && <p className="text-xs text-gray-400">Terakhir diperbarui: {settings.updated_at ? formatDateTimeWIB(settings.updated_at) : "—"}</p>}
      <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? "Menyimpan..." : "Simpan Pengaturan"}</Button>
    </div>
  );
}


