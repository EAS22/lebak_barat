import { useState, useEffect, useRef, useCallback } from "react";
import { Images, Upload, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface GallerySlot {
  slot_number: number;
  caption: string;
  year: string | null;
  image_base64: string | null;
  updated_at: string | null;
}

type CropState = {
  imgSrc: string;
  naturalW: number;
  naturalH: number;
  x: number;
  y: number;
  scale: number;
  slot: number;
  caption: string;
  year: string;
};

function parseImageFile(file: File): Promise<{ src: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ src, w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cropPrecise(
  imgSrc: string,
  crop: { x: number; y: number; scale: number; naturalW: number; naturalH: number },
  containerSize: number,
  outputSize: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { x, y, scale, naturalW, naturalH } = crop;
      const displayW = naturalW * scale;
      const displayH = naturalH * scale;
      const sx = (0 - x) / scale;
      const sy = (0 - y) / scale;
      const sW = containerSize / scale;
      const sH = containerSize / scale;

      const clampedSx = Math.max(0, Math.min(naturalW, sx));
      const clampedSy = Math.max(0, Math.min(naturalH, sy));
      const clampedSW = Math.max(1, Math.min(naturalW - clampedSx, sW));
      const clampedSH = Math.max(1, Math.min(naturalH - clampedSy, sH));

      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFF8E1";
      ctx.fillRect(0, 0, outputSize, outputSize);

      const destX = ((clampedSx - sx) / sW) * outputSize;
      const destY = ((clampedSy - sy) / sH) * outputSize;
      const destW = (clampedSW / sW) * outputSize;
      const destH = (clampedSH / sH) * outputSize;

      ctx.drawImage(img, clampedSx, clampedSy, clampedSW, clampedSH, destX, destY, destW, destH);

      void displayW;
      void displayH;

      let q = 0.72;
      let dataUrl = canvas.toDataURL("image/webp", q);
      if (dataUrl.length > 380_000) {
        dataUrl = canvas.toDataURL("image/webp", 0.55);
      }
      if (dataUrl.length > 380_000) {
        const small = document.createElement("canvas");
        small.width = 700;
        small.height = 700;
        const sCtx = small.getContext("2d")!;
        sCtx.drawImage(canvas, 0, 0, 700, 700);
        dataUrl = small.toDataURL("image/webp", 0.55);
        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = outputSize;
        finalCanvas.height = outputSize;
        const fCtx = finalCanvas.getContext("2d")!;
        fCtx.drawImage(small, 0, 0, outputSize, outputSize);
        dataUrl = finalCanvas.toDataURL("image/webp", 0.55);
      }
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = imgSrc;
  });
}

function CropModal({
  state,
  onClose,
  onSave,
}: {
  state: CropState;
  onClose: () => void;
  onSave: (base64: string) => void;
}) {
  const containerSize = 360;
  const outputSize = 800;
  const [crop, setCrop] = useState({ x: state.x, y: state.y, scale: state.scale });
  const [dragging, setDragging] = useState(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    lastRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !lastRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    setCrop((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
    lastRef.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerUp() {
    setDragging(false);
    lastRef.current = null;
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setCrop((c) => ({
      ...c,
      scale: Math.min(4, Math.max(0.08, c.scale + delta)),
    }));
  }

  const displayW = state.naturalW * crop.scale;
  const displayH = state.naturalH * crop.scale;

  const handleSave = async () => {
    setSaving(true);
    try {
      const compressed = await cropPrecise(state.imgSrc, { ...crop, naturalW: state.naturalW, naturalH: state.naturalH }, containerSize, outputSize);
      onSave(compressed);
    } catch {
      toast.error("Gagal compress gambar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <h3 className="font-bold text-sm">Atur Crop — Slot {state.slot} (1:1)</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div
            className="relative mx-auto overflow-hidden rounded-xl bg-[#FFF8E1] border-2 border-amber-300"
            style={{ width: containerSize, height: containerSize, maxWidth: "100%" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            <img
              src={state.imgSrc}
              alt="crop preview"
              draggable={false}
              className="absolute select-none pointer-events-none"
              style={{
                left: crop.x,
                top: crop.y,
                width: displayW,
                height: displayH,
                maxWidth: "none",
                cursor: dragging ? "grabbing" : "grab",
              }}
            />
            <div className="absolute inset-0 border-[36px] border-black/40 pointer-events-none" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/25" />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/60 bg-black/30 px-2 py-0.5 rounded-full">
                Drag untuk geser · Scroll untuk zoom
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium shrink-0">Zoom</label>
            <input
              type="range"
              min={0.08}
              max={4}
              step={0.02}
              value={crop.scale}
              onChange={(e) => setCrop((c) => ({ ...c, scale: Number(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-xs w-12 text-right font-mono">{crop.scale.toFixed(2)}x</span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const cover = Math.max(containerSize / state.naturalW, containerSize / state.naturalH);
                setCrop({ x: (containerSize - state.naturalW * cover) / 2, y: (containerSize - state.naturalH * cover) / 2, scale: cover });
              }}
            >
              Cover
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const contain = Math.min(containerSize / state.naturalW, containerSize / state.naturalH);
                setCrop({ x: (containerSize - state.naturalW * contain) / 2, y: (containerSize - state.naturalH * contain) / 2, scale: contain });
              }}
            >
              Contain
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCrop({ x: (containerSize - displayW) / 2, y: (containerSize - displayH) / 2, scale: crop.scale })}
            >
              Center
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Area yang terlihat di dalam kotak = hasil akhir di landing. Akan di-export 800×800 WebP 0.72 (~150-250KB). Drag untuk menggeser foto, scroll wheel atau slider untuk zoom.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-slate-50 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Memproses..." : "Simpan Crop"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryAdminPage() {
  const [slots, setSlots] = useState<GallerySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMap, setEditMap] = useState<Record<number, { caption: string; year: string }>>({});
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [pendingBase64Map, setPendingBase64Map] = useState<Record<number, string>>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as GallerySlot[];
      setSlots(data);
      const map: Record<number, { caption: string; year: string }> = {};
      for (const s of data) {
        map[s.slot_number] = { caption: s.caption ?? "", year: s.year ?? "" };
      }
      setEditMap(map);
    } catch {
      toast.error("Gagal memuat gallery slots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  async function handleFilePick(slotNum: number, file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File terlalu besar (max 15MB sebelum compress)");
      return;
    }
    try {
      const { src, w, h } = await parseImageFile(file);
      const containerSize = 360;
      const cover = Math.max(containerSize / w, containerSize / h);
      const ed = editMap[slotNum] ?? { caption: "", year: "" };
      setCropState({
        imgSrc: src,
        naturalW: w,
        naturalH: h,
        x: (containerSize - w * cover) / 2,
        y: (containerSize - h * cover) / 2,
        scale: cover,
        slot: slotNum,
        caption: ed.caption,
        year: ed.year,
      });
    } catch {
      toast.error("Gagal membaca file gambar");
    }
  }

  async function handleCropSave(base64: string) {
    if (!cropState) return;
    setPendingBase64Map((m) => ({ ...m, [cropState.slot]: base64 }));
    const slotNum = cropState.slot;
    setCropState(null);
    toast.success(`Foto slot ${slotNum} siap — preview persis sama dengan landing. Klik Simpan Slot`);
  }

  async function handleSave(slotNum: number) {
    const edits = editMap[slotNum];
    if (!edits) return;
    const base64 = pendingBase64Map[slotNum] ?? null;
    const existing = slots.find((s) => s.slot_number === slotNum);
    if (!base64 && !existing?.image_base64) {
      toast.error("Pilih foto terlebih dahulu");
      return;
    }
    setSavingSlot(slotNum);
    try {
      const payload: Record<string, unknown> = {
        caption: edits.caption,
        year: edits.year || null,
      };
      if (base64) payload.image_base64 = base64;
      else payload.image_base64 = existing?.image_base64 ?? null;

      const res = await fetch(`/api/gallery/${slotNum}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `${res.status}`);
      }
      toast.success(`Slot ${slotNum} tersimpan`);
      setPendingBase64Map((m) => {
        const n = { ...m };
        delete n[slotNum];
        return n;
      });
      await fetchSlots();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan slot");
    } finally {
      setSavingSlot(null);
    }
  }

  async function handleClear(slotNum: number) {
    if (!confirm(`Kosongkan foto slot ${slotNum}?`)) return;
    setSavingSlot(slotNum);
    try {
      const res = await fetch(`/api/gallery/${slotNum}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear: true }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setPendingBase64Map((m) => {
        const n = { ...m };
        delete n[slotNum];
        return n;
      });
      toast.success(`Slot ${slotNum} dikosongkan`);
      await fetchSlots();
    } catch {
      toast.error("Gagal mengosongkan slot");
    } finally {
      setSavingSlot(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalFilled = slots.filter((s) => s.image_base64).length;
  const estSizeKB = Math.round(
    slots.reduce((acc, s) => {
      if (!s.image_base64) return acc;
      const b64 = s.image_base64.split(",")[1] ?? "";
      return acc + (b64.length * 0.75) / 1024;
    }, 0)
  );
  const hasPending = Object.keys(pendingBase64Map).length > 0;
  const hasEdits = slots.some((s) => {
    const ed = editMap[s.slot_number];
    if (!ed) return false;
    return ed.caption !== (s.caption ?? "") || ed.year !== (s.year ?? "");
  }) || hasPending;

  async function handleSaveAll() {
    if (!hasEdits && !hasPending) {
      toast.info("Tidak ada perubahan untuk disimpan");
      return;
    }
    setBulkSaving(true);
    let ok = 0;
    let fail = 0;
    for (const slot of slots) {
      const num = slot.slot_number;
      const edits = editMap[num];
      if (!edits) continue;
      const pendingB64 = pendingBase64Map[num] ?? null;
      const captionChanged = edits.caption !== (slot.caption ?? "");
      const yearChanged = edits.year !== (slot.year ?? "");
      const hasB64Change = pendingB64 !== null;
      if (!captionChanged && !yearChanged && !hasB64Change) continue;

      try {
        const payload: Record<string, unknown> = {
          caption: edits.caption,
          year: edits.year || null,
        };
        if (pendingB64) payload.image_base64 = pendingB64;
        else if (!captionChanged && !yearChanged) continue;
        else payload.image_base64 = slot.image_base64;

        const res = await fetch(`/api/gallery/${num}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        ok++;
      } catch {
        fail++;
      }
    }
    setBulkSaving(false);
    if (fail > 0) toast.error(`${ok} slot tersimpan, ${fail} gagal`);
    else toast.success(`${ok} slot berhasil disimpan`);
    setPendingBase64Map({});
    await fetchSlots();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Images className="h-5 w-5 text-emerald-600" />
            Galeri — 8 Slot Polaroid
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload akan di-crop 1:1 presisi — preview crop = hasil landing. Replace slot menimpa foto lama — DB stabil.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Terisi {totalFilled}/8 · Estimasi DB {estSizeKB}KB · WebP 800×800
            {hasPending ? ` · ${Object.keys(pendingBase64Map).length} belum disimpan` : ""}
          </p>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={bulkSaving || (!hasEdits && !hasPending)}
          className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
        >
          <Save size={16} className="mr-1.5" />
          {bulkSaving ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slot) => {
          const edit = editMap[slot.slot_number] ?? { caption: "", year: "" };
          const pendingB64 = pendingBase64Map[slot.slot_number];
          const previewSrc = pendingB64 ?? slot.image_base64;
          const isSaving = savingSlot === slot.slot_number;

          return (
            <Card key={slot.slot_number} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Slot {slot.slot_number}</span>
                  {slot.image_base64 || pendingB64 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Terisi</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Kosong</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div className="relative aspect-square rounded-xl bg-[#FFF8E1] border-2 border-dashed border-amber-200 overflow-hidden flex items-center justify-center">
                  {previewSrc ? (
                    <img src={previewSrc} alt={`Slot ${slot.slot_number}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
                      <Images size={32} />
                      <span className="text-xs">Belum ada foto</span>
                    </div>
                  )}
                  {pendingB64 && (
                    <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-brown font-bold">
                      Belum disimpan
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Caption</Label>
                    <Input
                      value={edit.caption}
                      onChange={(e) =>
                        setEditMap((m) => ({
                          ...m,
                          [slot.slot_number]: { ...edit, caption: e.target.value.slice(0, 100) },
                        }))
                      }
                      placeholder="Contoh: Jambore Ranting"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tahun (opsional)</Label>
                    <Input
                      value={edit.year}
                      onChange={(e) =>
                        setEditMap((m) => ({
                          ...m,
                          [slot.slot_number]: { ...edit, year: e.target.value.slice(0, 10) },
                        }))
                      }
                      placeholder="'23"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <input
                  ref={(el) => {
                    fileInputRefs.current[slot.slot_number] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFilePick(slot.slot_number, f);
                    e.target.value = "";
                  }}
                />

                <div className="mt-auto flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRefs.current[slot.slot_number]?.click()}
                  >
                    <Upload size={14} className="mr-1" />
                    {slot.image_base64 || pendingB64 ? "Ganti Foto" : "Upload Foto"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSaving}
                      onClick={() => handleSave(slot.slot_number)}
                    >
                      <Save size={14} className="mr-1" />
                      {isSaving ? "..." : "Simpan"}
                    </Button>
                    {(slot.image_base64 || pendingB64) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                        onClick={() => handleClear(slot.slot_number)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cropState && <CropModal state={cropState} onClose={() => setCropState(null)} onSave={handleCropSave} />}
    </div>
  );
}
