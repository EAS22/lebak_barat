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
  x: number;
  y: number;
  scale: number;
  slot: number;
  caption: string;
  year: string;
};

function parseImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function cropAndCompress(
  imgSrc: string,
  crop: { x: number; y: number; scale: number },
  containerSize: number,
  outputSize: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d")!;
      const displayW = img.width * crop.scale;
      const displayH = img.height * crop.scale;
      const offsetX = crop.x + (containerSize - displayW) / 2;
      const offsetY = crop.y + (containerSize - displayH) / 2;
      const scaleFactor = outputSize / containerSize;
      ctx.drawImage(
        img,
        offsetX * scaleFactor,
        offsetY * scaleFactor,
        displayW * scaleFactor,
        displayH * scaleFactor
      );
      let q = 0.65;
      let dataUrl = canvas.toDataURL("image/webp", q);
      if (dataUrl.length > 350_000) {
        dataUrl = canvas.toDataURL("image/webp", 0.5);
      }
      if (dataUrl.length > 350_000) {
        const small = document.createElement("canvas");
        small.width = 600;
        small.height = 600;
        const sCtx = small.getContext("2d")!;
        sCtx.drawImage(canvas, 0, 0, 600, 600);
        dataUrl = small.toDataURL("image/webp", 0.5);
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
  const [crop, setCrop] = useState({ x: state.x, y: state.y, scale: state.scale });
  const [dragging, setDragging] = useState(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const containerSize = 360;
  const outputSize = 800;
  const [saving, setSaving] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    lastRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !lastRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    setCrop((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
    lastRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setDragging(false);
    lastRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setCrop((c) => ({ ...c, scale: Math.min(3, Math.max(0.2, c.scale + delta)) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const compressed = await cropAndCompress(state.imgSrc, crop, containerSize, outputSize);
      onSave(compressed);
    } catch {
      toast.error("Gagal compress gambar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold text-sm">Atur Crop — Slot {state.slot}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div
            className="relative mx-auto overflow-hidden rounded-xl bg-slate-100 border-2 border-dashed border-amber-300"
            style={{ width: containerSize, height: containerSize, maxWidth: "100%" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* crop image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.imgSrc}
              alt="crop"
              draggable={false}
              className="absolute select-none"
              style={{
                left: crop.x,
                top: crop.y,
                width: 320 * crop.scale,
                height: "auto",
                maxWidth: "none",
                cursor: dragging ? "grabbing" : "grab",
              }}
            />
            <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none rounded-xl" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium">Zoom</label>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.05}
              value={crop.scale}
              onChange={(e) => setCrop((c) => ({ ...c, scale: Number(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-xs w-8">{crop.scale.toFixed(2)}x</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Drag untuk geser, scroll atau slider untuk zoom. Hasil crop 1:1 akan di-compress WebP ~150-200KB.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? "Menyimpan..." : "Simpan Crop"}
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
    const src = await parseImageFile(file);
    const ed = editMap[slotNum] ?? { caption: "", year: "" };
    setCropState({
      imgSrc: src,
      x: 0,
      y: 0,
      scale: 1,
      slot: slotNum,
      caption: ed.caption,
      year: ed.year,
    });
  }

  async function handleCropSave(base64: string) {
    if (!cropState) return;
    setPendingBase64Map((m) => ({ ...m, [cropState.slot]: base64 }));
    setCropState(null);
    toast.success(`Foto slot ${cropState.slot} siap disimpan — klik Simpan Slot`);
  }

  async function handleSave(slotNum: number) {
    const edits = editMap[slotNum];
    if (!edits) return;
    const base64 = pendingBase64Map[slotNum] ?? null;
    if (!base64 && !slots.find((s) => s.slot_number === slotNum)?.image_base64) {
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
      else {
        const existing = slots.find((s) => s.slot_number === slotNum);
        payload.image_base64 = existing?.image_base64 ?? null;
      }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Images className="h-5 w-5 text-emerald-600" />
            Galeri — 8 Slot Polaroid
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload foto akan di-compress WebP 800x800 ~150-200KB. Slot yang di-upload ulang akan menimpa foto lama — DB size stabil.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Terisi {totalFilled}/8 · Estimasi DB {estSizeKB}KB · 1 foto bisa di-crop 1:1 sebelum simpan.
          </p>
        </div>
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
                <div className="relative aspect-square rounded-xl bg-cream border-2 border-dashed border-amber-200 overflow-hidden flex items-center justify-center">
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

      {cropState && (
        <CropModal
          state={cropState}
          onClose={() => setCropState(null)}
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}
