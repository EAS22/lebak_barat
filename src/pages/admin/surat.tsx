import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { FileText, Eye, Download, Plus, Trash2, Search, CalendarDays, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { getBookings, getEvents, type BookingRecord, type EventRecord, getSettings, getLetterRecipients, previewLetterNumber, nextLetterNumber } from "@/lib/adminApi";
import { generateSuratPdf, type SuratItem, type PageSize } from "@/lib/suratPdf";

type SelectRow = {
  id: string;
  kind: "booking" | "event";
  institution: string;
  eventName: string;
  start_date: string;
  end_date: string;
  participant_count: number;
};

export default function SuratPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, SelectRow>>({});
  const [nomor, setNomor] = useState("");
  const [tglSurat, setTglSurat] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [pageSize, setPageSize] = useState<PageSize>("f4");
  const [perihal, setPerihal] = useState("Pemberitahuan Kegiatan Perkemahan");
  const [lampiran, setLampiran] = useState("1 (Satu) Berkas");
  const [kepadaDefault, setKepadaDefault] = useState<{ id: string; name: string; checked: boolean }[]>([]);
  const [kepadaTambahan, setKepadaTambahan] = useState<string[]>([""]);
  const [redaksi, setRedaksi] = useState("");
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [signData, setSignData] = useState<{ ketua: string; sekretaris: string; kades: string; dirbumdes: string }>({ ketua: "", sekretaris: "", kades: "", dirbumdes: "" });

  useEffect(() => {
    (async () => {
      try {
        const [s, recs, prev] = await Promise.all([getSettings() as never, getLetterRecipients(), previewLetterNumber()]);
        const ss = s as { letter_body?: string; sign_ketua?: string; sign_sekretaris?: string; sign_kades?: string; sign_dirbumdes?: string };
        setRedaksi(ss.letter_body || "");
        setSignData({ ketua: ss.sign_ketua || "", sekretaris: ss.sign_sekretaris || "", kades: ss.sign_kades || "", dirbumdes: ss.sign_dirbumdes || "" });
        setKepadaDefault(recs.map((r) => ({ id: r.id, name: r.name, checked: r.is_default })));
        setNomor((prev as { nomor: string }).nomor);
        setSettingsLoaded(true);
      } catch {}
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, eRes] = await Promise.all([getBookings({ limit: 200 }), getEvents({ limit: 200 })]);
      setBookings(bRes.data);
      setEvents(eRes.data);
    } catch { toast.error("Gagal memuat data"); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allRows: SelectRow[] = [
    ...bookings.map((b) => ({ id: b.id, kind: "booking" as const, institution: b.school_name, eventName: b.keterangan || b.status, start_date: b.start_date, end_date: b.end_date, participant_count: b.participant_count })),
    ...events.map((e) => ({ id: e.id, kind: "event" as const, institution: e.institution, eventName: e.event_name, start_date: e.start_date, end_date: e.end_date, participant_count: e.participant_count })),
  ];

  const filtered = allRows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.institution.toLowerCase().includes(q) || r.eventName.toLowerCase().includes(q);
  });

  function toggleRow(row: SelectRow) {
    setSelected((prev) => {
      const n = { ...prev };
      if (n[row.id]) delete n[row.id];
      else n[row.id] = row;
      return n;
    });
  }

  function toggleAll() {
    if (Object.keys(selected).length === filtered.length && filtered.length > 0) {
      setSelected({});
    } else {
      const m: Record<string, SelectRow> = {};
      for (const r of filtered) m[r.id] = r;
      setSelected(m);
    }
  }

  async function handlePreview() {
    const items: SuratItem[] = Object.values(selected)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .map((r, idx) => ({
        no: idx + 1,
        institution: r.institution,
        eventName: r.eventName,
        startDate: r.start_date,
        endDate: r.end_date,
        participantCount: r.participant_count,
      }));
    if (items.length === 0) { toast.error("Pilih minimal 1 jadwal untuk lampiran"); return; }
    if (!nomor.trim()) { toast.error("Nomor surat wajib diisi"); return; }

    const kepadaList = [
      ...kepadaDefault.filter((k) => k.checked).map((k) => k.name),
      ...kepadaTambahan.map((s) => s.trim()).filter(Boolean),
    ];
    if (kepadaList.length === 0) { toast.error("Isi minimal 1 penerima Kepada Yth."); return; }

    setGenerating(true);
    try {
      const { blobUrl } = await generateSuratPdf({
        nomor: nomor.trim(),
        lampiran,
        perihal,
        kepada: kepadaList,
        redaksiBody: redaksi,
        tanggalSurat: tglSurat,
        pageSize,
        items,
        signKetua: signData.ketua,
        signSekretaris: signData.sekretaris,
        signKades: signData.kades,
        signDirBumdes: signData.dirbumdes,
        headerBase64: null,
        footerBase64: null,
      });
      setPreviewUri(blobUrl);
      toast.success("Preview siap — cek di bawah, jika pas klik Download PDF");
    } catch (e: unknown) {
      console.error("preview err", e);
      toast.error(e instanceof Error ? e.message : "Gagal generate preview");
    } finally { setGenerating(false); }
  }

  async function handleDownload() {
    if (!previewUri) { toast.error("Preview dulu sebelum download"); return; }
    try {
      const res = await nextLetterNumber();
      setNomor(res.nomor);
      const kepadaList = [
        ...kepadaDefault.filter((k) => k.checked).map((k) => k.name),
        ...kepadaTambahan.map((s) => s.trim()).filter(Boolean),
      ];
      const items: SuratItem[] = Object.values(selected)
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .map((r, idx) => ({
          no: idx + 1,
          institution: r.institution,
          eventName: r.eventName,
          startDate: r.start_date,
          endDate: r.end_date,
          participantCount: r.participant_count,
        }));
      await fetch("/api/letter/archive", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomor: res.nomor,
          seq: res.seq,
          kepada: kepadaList.join(", "),
          item_count: items.length,
          tanggal_surat: tglSurat,
          lampiran,
          perihal,
          items_json: JSON.stringify(items),
        }),
      });
      const { doc } = await generateSuratPdf({
        nomor: res.nomor,
        lampiran,
        perihal,
        kepada: kepadaList,
        redaksiBody: redaksi,
        tanggalSurat: tglSurat,
        pageSize,
        items,
        signKetua: signData.ketua,
        signSekretaris: signData.sekretaris,
        signKades: signData.kades,
        signDirBumdes: signData.dirbumdes,
        headerBase64: null,
        footerBase64: null,
      });
      const safeNomor = res.nomor.replace(/\//g, "-");
      doc.save(`Surat-Pemberitahuan-${safeNomor}.pdf`);
      toast.success(`Surat ${res.nomor} diarsipkan & diunduh — nomor auto naik`);
      setPreviewUri(null);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Gagal download"); }
  }

  void settingsLoaded;
  void format;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Generate Surat Pemberitahuan</h2>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">2 lembar · {pageSize.toUpperCase()} default</span>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Header Surat</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Nomor (auto)</Label><Input value={nomor} onChange={(e) => setNomor(e.target.value)} placeholder="012/BPLB/VIII/2026" /></div>
          <div className="space-y-1.5"><Label>Tanggal Surat</Label><Input type="date" value={tglSurat} onChange={(e) => setTglSurat(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Lampiran</Label><Input value={lampiran} onChange={(e) => setLampiran(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Perihal</Label><Input value={perihal} onChange={(e) => setPerihal(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Ukuran Kertas</Label>
            <select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSize)} className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm">
              <option value="f4">Folio F4 (210×330 mm) — Default</option>
              <option value="a4">A4 (210×297 mm)</option>
            </select>
          </div>
          <div className="space-y-1.5"><Label>Redaksi Body (editable per surat)</Label><Textarea value={redaksi} onChange={(e) => setRedaksi(e.target.value)} rows={6} className="text-sm" /></div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="flex flex-col">
          <CardHeader><CardTitle className="text-base">Kepada Yth. — Urutan dapat diatur</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500">Centang yang dikirim. Gunakan ↑↓ untuk ubah urutan. Tambahan di bawah.</p>
            <div className="space-y-2">
              {kepadaDefault.map((k, idx) => (
                <div key={k.id} className="flex items-center gap-1 p-2 rounded-lg border bg-slate-50/60">
                  <input type="checkbox" checked={k.checked} onChange={(e) => setKepadaDefault((prev) => prev.map((x) => x.id === k.id ? { ...x, checked: e.target.checked } : x))} className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-sm truncate">{idx + 1}. {k.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" disabled={idx === 0} onClick={() => setKepadaDefault((prev) => { const a = [...prev]; const tmp = a[idx]!; a[idx] = a[idx - 1]!; a[idx - 1] = tmp!; return a; })}><ChevronUp size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" disabled={idx === kepadaDefault.length - 1} onClick={() => setKepadaDefault((prev) => { const a = [...prev]; const tmp = a[idx]!; a[idx] = a[idx + 1]!; a[idx + 1] = tmp!; return a; })}><ChevronDown size={14} /></Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Tambah Penerima Lain (opsional — berurutan setelah default)</Label>
              {kepadaTambahan.map((val, idx) => (
                <div key={idx} className="flex gap-1 items-center">
                  <GripVertical size={14} className="text-slate-300 shrink-0" />
                  <span className="text-xs w-4 shrink-0">{kepadaDefault.filter((k) => k.checked).length + idx + 1}.</span>
                  <Input value={val} onChange={(e) => setKepadaTambahan((prev) => prev.map((v, i) => i === idx ? e.target.value : v))} placeholder={`Penerima ${kepadaDefault.filter((k) => k.checked).length + idx + 1} (contoh: Kepala Sekolah ...)`} className="h-8 text-sm" />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={idx === 0} onClick={() => setKepadaTambahan((prev) => { const a = [...prev]; const t = a[idx]!; a[idx] = a[idx - 1]!; a[idx - 1] = t!; return a; })}><ChevronUp size={12} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={idx === kepadaTambahan.length - 1} onClick={() => setKepadaTambahan((prev) => { const a = [...prev]; const t = a[idx]!; a[idx] = a[idx + 1]!; a[idx + 1] = t!; return a; })}><ChevronDown size={12} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-red-500" onClick={() => setKepadaTambahan((prev) => prev.filter((_, i) => i !== idx))}><Trash2 size={14} /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setKepadaTambahan((prev) => [...prev, ""])}><Plus size={14} className="mr-1" />Tambah Penerima</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><CalendarDays size={16} />Pilih Jadwal untuk Lampiran <span className="text-xs font-normal text-slate-500">{Object.keys(selected).length} terpilih</span></CardTitle>
            <Button variant="outline" size="sm" onClick={toggleAll}>{Object.keys(selected).length === filtered.length && filtered.length > 0 ? "Batal Pilih Semua" : "Pilih Semua"}</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari sekolah / institusi..." className="pl-9 h-8" />
            </div>
            {loading ? <p className="text-sm text-slate-500">Memuat...</p> : (
              <div className="max-h-[380px] overflow-y-auto border rounded-xl divide-y">
                {filtered.length === 0 && <p className="p-4 text-sm text-slate-400 text-center">Tidak ada data</p>}
                {filtered.map((row) => (
                  <label key={row.id} className={`flex items-start gap-2 p-2 cursor-pointer hover:bg-slate-50 ${selected[row.id] ? "bg-emerald-50" : ""}`}>
                    <input type="checkbox" checked={!!selected[row.id]} onChange={() => toggleRow(row)} className="mt-1 h-4 w-4 shrink-0" />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 mt-0.5 ${row.kind === "event" ? "bg-blue-900 text-white" : "bg-emerald-100 text-emerald-700"}`}>{row.kind === "event" ? "Event" : "Booking"}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold truncate">{row.institution}</span>
                      <span className="block text-xs text-slate-500 truncate">{row.eventName} · {row.participant_count} peserta</span>
                      <span className="block text-xs text-slate-400">{format(new Date(row.start_date.slice(0, 10) + "T00:00:00"), "d MMM yyyy", { locale: localeId })} — {format(new Date(row.end_date.slice(0, 10) + "T00:00:00"), "d MMM yyyy", { locale: localeId })}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={handlePreview} disabled={generating} className="bg-emerald-600 hover:bg-emerald-700"><Eye size={16} className="mr-1" />{generating ? "Memproses..." : "Preview Surat (2 lembar)"}</Button>
        {previewUri && <Button onClick={handleDownload} variant="outline" className="border-emerald-600 text-emerald-700"><Download size={16} className="mr-1" />Download PDF</Button>}
      </div>

      {previewUri && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewUri(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <h3 className="font-bold text-sm">Preview Surat — 2 Lembar ({pageSize.toUpperCase()})</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700"><Download size={14} className="mr-1" />Download PDF</Button>
                <Button variant="ghost" size="icon" onClick={() => setPreviewUri(null)}><X size={18} /></Button>
              </div>
            </div>
            <iframe src={previewUri} className="flex-1 w-full border-0" title="Preview Surat Pemberitahuan" />
            <p className="px-4 py-2 text-xs text-slate-500 border-t shrink-0">Jika sudah pas, klik Download PDF. Nomor akan auto increment setelah download.</p>
          </div>
        </div>
      )}
    </div>
  );
}
