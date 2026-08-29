import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Archive, FileText, Mail, Download, Eye, X } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useAuth } from "@/lib/authContext";
import { getSettings } from "@/lib/adminApi";
import { generateSuratPdf } from "@/lib/suratPdf";
import { generateInvoicePdf } from "@/lib/invoicePdf";

interface ArsipRow {
  id: string;
  nomor: string;
  tipe: "invoice" | "surat_pemberitahuan";
  tanggal: string;
  perihal: string;
  created_by: string | null;
  item_count?: number;
}

export default function ArsipPage() {
  const { user } = useAuth();
  const isSuper = user?.role === "super_admin";
  const [rows, setRows] = useState<ArsipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "invoice" | "surat_pemberitahuan">("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchArsip() {
    setLoading(true);
    try {
      const res = await fetch("/api/arsip", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as ArsipRow[];
      setRows(data);
    } catch { toast.error("Gagal memuat arsip"); } finally { setLoading(false); }
  }

  useEffect(() => { fetchArsip(); }, []);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.tipe !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.nomor.toLowerCase().includes(q) || (r.perihal ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  function isLatest(id: string, tipe: string): boolean {
    const ofType = rows.filter((r) => r.tipe === tipe).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    return ofType[0]?.id === id;
  }

  async function handleDelete(row: ArsipRow) {
    if (!isSuper) { toast.error("Hanya superadmin yang bisa hapus"); return; }
    if (!isLatest(row.id, row.tipe)) {
      toast.error("Hanya arsip terbaru yang boleh dihapus. Hapus berurutan dari yang terbaru.");
      return;
    }
    if (!confirm(`Hapus arsip ${row.nomor} (${row.tipe})? Nomor akan dapat dipakai kembali.`)) return;
    setDeleting(row.id);
    try {
      const res = await fetch(`/api/arsip/${row.id}?tipe=${row.tipe}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `${res.status}`);
      }
      toast.success(`${row.nomor} dihapus — nomor dapat dipakai kembali`);
      await fetchArsip();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal hapus"); } finally { setDeleting(null); }
  }

  const [preview, setPreview] = useState<{ uri: string; nomor: string; save: () => void } | null>(null);

  async function handlePreviewDownload(row: ArsipRow) {
    try {
      if (row.tipe === "invoice") {
        const res = await fetch(`/api/bookings/${row.id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Gagal ambil data invoice");
        const b = await res.json() as Record<string, unknown>;
        const sRes = await getSettings();
        const s = sRes as unknown as Record<string, unknown>;
        await generateInvoicePdf({
          invoice_number: String(b.invoice_number || row.nomor),
          school_name: String(b.school_name || ""),
          participant_count: Number(b.participant_count || 0),
          pic_name: String(b.pic_name || ""),
          pic_wa: String(b.pic_wa || ""),
          start_date: String(b.start_date || ""),
          end_date: String(b.end_date || ""),
          price: Number(b.price || 0),
          status: String(b.status || "final"),
          created_at: String(b.created_at || ""),
          buperName: String(s.buper_name || "Bumi Perkemahan Lebak Barat"),
        } as never);
        toast.success("Invoice diunduh");
        return;
      } else {
        const res = await fetch(`/api/letter-archives/${row.id}`, { credentials: "include" });
        let letterBody = "";
        let signKetua = "", signSek = "", signKades = "", signDir = "";
        try {
          const sRes = await getSettings();
          const s = sRes as unknown as Record<string, unknown>;
          letterBody = String(s.letter_body || "");
          signKetua = String(s.sign_ketua || "");
          signSek = String(s.sign_sekretaris || "");
          signKades = String(s.sign_kades || "");
          signDir = String(s.sign_dirbumdes || "");
        } catch {}
        let items: never[] = [];
        let tanggal = row.tanggal.slice(0, 10);
        let kepada: string[] = [];
        let lampiran = "1 (Satu) Berkas";
        let perihal = "Pemberitahuan Kegiatan Perkemahan";
        if (res.ok) {
          const d = await res.json() as Record<string, unknown>;
          if (d.kepada) kepada = String(d.kepada).split(",").map((s) => s.trim()).filter(Boolean);
          if (d.tanggal_surat) tanggal = String(d.tanggal_surat).slice(0, 10);
          if (d.lampiran) lampiran = String(d.lampiran);
          if (d.perihal) perihal = String(d.perihal);
          if (d.items_json) { try { items = JSON.parse(String(d.items_json)) as never[]; } catch {} }
        }
        if (kepada.length === 0) kepada = [row.perihal || "Penerima"];
        const { blobUrl, doc } = await generateSuratPdf({
          nomor: row.nomor,
          lampiran,
          perihal,
          kepada,
          redaksiBody: letterBody || "Sehubungan dengan akan dilaksanakannya kegiatan perkemahan...",
          tanggalSurat: tanggal,
          pageSize: "f4",
          items: items as never,
          signKetua, signSekretaris: signSek, signKades, signDirBumdes: signDir,
          headerBase64: null, footerBase64: null,
        });
        setPreview({ uri: blobUrl, nomor: row.nomor, save: () => doc.save(`Surat-${row.nomor.replace(/\//g, "-")}.pdf`) });
      }
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal preview"); }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat arsip...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Archive className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Arsip Dokumen</h2>
        <span className="ml-auto text-xs text-slate-500">{rows.length} dokumen</span>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 flex-wrap">
          <CardTitle className="text-sm">Filter</CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>Semua</Button>
            <Button size="sm" variant={filter === "invoice" ? "default" : "outline"} onClick={() => setFilter("invoice")} className={filter === "invoice" ? "bg-emerald-600" : ""}>Invoice</Button>
            <Button size="sm" variant={filter === "surat_pemberitahuan" ? "default" : "outline"} onClick={() => setFilter("surat_pemberitahuan")} className={filter === "surat_pemberitahuan" ? "bg-amber-600" : ""}>Surat Pemberitahuan</Button>
          </div>
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nomor / perihal..." className="pl-8 h-8 w-56" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs text-slate-500">
                  <th className="text-left px-3 py-2">No</th>
                  <th className="text-left px-3 py-2">Nomor Surat</th>
                  <th className="text-left px-3 py-2">Tipe</th>
                  <th className="text-left px-3 py-2">Tanggal</th>
                  <th className="text-left px-3 py-2">Perihal / Sekolah</th>
                  <th className="text-center px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">Belum ada arsip</td></tr>}
                {sorted.map((row, idx) => {
                  const canDelete = isSuper && isLatest(row.id, row.tipe);
                  return (
                    <tr key={row.id} className="border-b hover:bg-slate-50/60">
                      <td className="px-3 py-2 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs font-semibold">{row.nomor}</td>
                      <td className="px-3 py-2">
                        <Badge className={row.tipe === "invoice" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}>
                          {row.tipe === "invoice" ? <><FileText size={10} className="mr-1" />Invoice</> : <><Mail size={10} className="mr-1" />Surat</>}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs">{row.tanggal ? format(new Date(row.tanggal.slice(0, 10) + "T00:00:00"), "d MMM yyyy", { locale: localeId }) : "-"}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[220px]">{row.perihal || "-"}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => handlePreviewDownload(row)} title="Preview & Download">
                            <Eye size={14} />
                          </Button>
                          {canDelete ? (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" disabled={deleting === row.id} onClick={() => handleDelete(row)}>
                              <Trash2 size={14} />
                            </Button>
                          ) : isSuper ? (
                            <span className="text-[10px] text-slate-400">Bukan terbaru</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Hanya lihat</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!isSuper && <p className="px-3 py-2 text-xs text-slate-400 border-t">Admin hanya bisa melihat. Hapus hanya superadmin untuk nomor terbaru.</p>}
          {isSuper && <p className="px-3 py-2 text-xs text-amber-600 border-t">Hanya nomor terbaru per tipe yang bisa dihapus (berurutan). Nomor terhapus dapat dipergunakan kembali.</p>}
        </CardContent>
      </Card>

      {preview && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <h3 className="font-bold text-sm">Preview — {preview.nomor}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => { preview.save(); toast.success("Diunduh"); }} className="bg-emerald-600 hover:bg-emerald-700"><Download size={14} className="mr-1" />Download</Button>
                <Button variant="ghost" size="icon" onClick={() => setPreview(null)}><X size={18} /></Button>
              </div>
            </div>
            <iframe src={preview.uri} className="flex-1 w-full border-0" title="Preview Arsip" />
          </div>
        </div>
      )}
    </div>
  );
}
