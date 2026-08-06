import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  QrCode,
  Camera,
  BadgeCheck,
  MapPin,
  Users,
  CalendarDays,
  UserRound,
  RotateCcw,
  ImagePlus,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useReveal } from "@/hooks/useReveal";
import PineDivider from "@/components/landing/ornaments/PineDivider";
import CloudsSun from "@/components/landing/ornaments/CloudsSun";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import type { PublicSettings } from "@/lib/api";

interface VerifyResult {
  verified: boolean;
  invoice_number?: string;
  school_name?: string;
  participant_count?: number;
  pic_name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  invoice_generated_at?: string;
  generated_by_name?: string;
  message?: string;
}

const DEFAULT_SETTINGS: PublicSettings = {
  landing_wa_number: "6280000000000",
  landing_wa_label: "Admin Booking",
  buper_name: "Bumi Perkemahan Lebak Barat",
};

export default function VerificationPage({
  sharedSettings,
}: {
  sharedSettings?: PublicSettings;
}) {
  const settings = sharedSettings ?? DEFAULT_SETTINGS;
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get("invoice") || "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const heroReveal = useReveal<HTMLDivElement>();
  const pendingQrRef = useRef<string | null>(null);
  const handledScanRef = useRef(false);

  function safeDateFormat(dateStr?: string, fmt = "d MMM yyyy"): string {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr.slice(0, 10) + "T00:00:00");
      if (isNaN(d.getTime())) return "-";
      return format(d, fmt, { locale: localeId });
    } catch {
      return "-";
    }
  }

  const doVerify = useCallback(
    async (rawNumber: string) => {
      let number = rawNumber.trim();
      try {
        if (number.startsWith("http")) {
          const url = new URL(number);
          const inv = url.searchParams.get("invoice");
          if (inv) number = inv;
          else {
            const parts = number.split("/").filter(Boolean);
            const last = parts[parts.length - 1];
            if (last && last.toUpperCase().startsWith("INV-")) number = last;
          }
        }
      } catch {
        // ignore
      }
      number = number.trim().toUpperCase();
      if (!number) {
        setError("Masukkan nomor invoice");
        return;
      }
      setError(null);
      setLoading(true);
      setResult(null);
      try {
        const res = await fetch(
          `/api/public/verify-invoice?number=${encodeURIComponent(number)}`
        );
        const data = (await res.json()) as VerifyResult & { error?: string };
        if (!res.ok) {
          if (res.status === 404) {
            setResult({
              verified: false,
              message:
                data.message ||
                "Invoice tidak ditemukan. Pastikan nomor benar atau invoice palsu.",
            });
            setSearchParams({}, { replace: true });
            return;
          }
          throw new Error(data.error || `Gagal verifikasi: ${res.status}`);
        }
        setInput(number);
        setResult(data);
        setSearchParams({ invoice: number }, { replace: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal memverifikasi";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [setSearchParams]
  );

  useEffect(() => {
    const initial = searchParams.get("invoice");
    if (initial) {
      doVerify(initial);
    }
    const handler = (e: PromiseRejectionEvent) => {
      const msg = (e.reason as Error)?.message || String(e.reason || "");
      if (msg.includes("not running") || msg.includes("paused") || msg.includes("Html5Qrcode")) {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pendingQrRef.current && !scannerOpen) {
      const val = pendingQrRef.current;
      pendingQrRef.current = null;
      if (val) doVerify(val);
    }
  }, [scannerOpen, doVerify]);

  // QR Scanner - isolated, never crashes on stop
  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;
    let qrObj: InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null = null;

    const safeStop = async () => {
      if (!qrObj) return;
      try {
        // html5-qrcode getState(): 0=NOT_STARTED, 1=SCANNING, 2=PAUSED
        const state = (qrObj as unknown as { getState?: () => number }).getState?.();
        if (state !== undefined && state !== 1) return;
      } catch {}
      try {
        await qrObj.stop();
      } catch (e: unknown) {
        const msg = (e as Error)?.message || String(e);
        if (!msg.includes("not running") && !msg.includes("paused")) {
          // only log truly unexpected errors
          console.warn("[QR] stop error (ignored):", msg);
        }
      }
      try {
        qrObj.clear();
      } catch {}
    };

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const el = document.getElementById("qr-reader");
        if (!el) return;

        handledScanRef.current = false;
        const qr = new Html5Qrcode("qr-reader");
        qrObj = qr as unknown as typeof qrObj;

        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            if (cancelled || handledScanRef.current) return;
            handledScanRef.current = true;
            let candidate = decodedText.trim();
            try {
              if (candidate.startsWith("http")) {
                const url = new URL(candidate);
                const inv = url.searchParams.get("invoice");
                if (inv) candidate = inv;
                else {
                  const parts = candidate.split("/").filter(Boolean);
                  const last = parts[parts.length - 1];
                  if (last && last.toUpperCase().startsWith("INV-")) candidate = last;
                }
              }
            } catch {
              // ignore
            }
            pendingQrRef.current = candidate;
            safeStop().finally(() => {
              if (!cancelled) setScannerOpen(false);
            });
          },
          () => {}
        );
        if (cancelled) {
          await safeStop();
          return;
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.includes("NotFoundError") && !msg.toLowerCase().includes("not found")) {
          setError(`Kamera tidak tersedia: ${msg}`);
          setScannerOpen(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      safeStop();
    };
  }, [scannerOpen]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImageUploading(true);
    setError(null);
    try {
      const { Html5Qrcode: QR } = await import("html5-qrcode");
      // html5-qrcode v2.3.8 scanFile adalah instance method, bukan static
      const tempDivId = "__qr-file-temp";
      let tempDiv = document.getElementById(tempDivId);
      if (!tempDiv) {
        tempDiv = document.createElement("div");
        tempDiv.id = tempDivId;
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);
      }
      const qrTemp = new QR(tempDivId);
      const result = await qrTemp.scanFile(file, true);
      try {
        qrTemp.clear();
      } catch {}
      let candidate = result.trim();
      try {
        if (candidate.startsWith("http")) {
          const url = new URL(candidate);
          const inv = url.searchParams.get("invoice");
          if (inv) candidate = inv;
          else {
            const parts = candidate.split("/").filter(Boolean);
            const last = parts[parts.length - 1];
            if (last && last.toUpperCase().startsWith("INV-")) candidate = last;
          }
        }
      } catch {}
      if (candidate) {
        doVerify(candidate);
      } else {
        setError("QR code tidak terdeteksi di gambar tersebut");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("no qr code") ||
        msg.toLowerCase().includes("no multi")
      ) {
        setError("QR code tidak ditemukan pada gambar. Pastikan gambar jelas dan berisi QR code invoice.");
      } else {
        setError(`Gagal membaca gambar: ${msg}`);
      }
    } finally {
      setImageUploading(false);
    }
  }

  function handleScanAgain() {
    setResult(null);
    setError(null);
    setInput("");
    setSearchParams({}, { replace: true });
    setLoading(false);
    pendingQrRef.current = null;
    handledScanRef.current = false;
    setScannerOpen(false);
    setTimeout(() => setScannerOpen(true), 200);
  }

  function handleCloseScanner() {
    handledScanRef.current = false;
    pendingQrRef.current = null;
    setScannerOpen(false);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar buperName={settings.buper_name} />

      {/* Hero compact */}
      <section className="relative overflow-hidden pt-20 pb-6 md:pt-24 md:pb-8 bg-gradient-to-b from-sky-100 to-amber-50">
        <CloudsSun />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div
            ref={heroReveal.ref}
            className={`reveal ${heroReveal.visible ? "is-visible" : ""}`}
          >
            <div className="mx-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <BadgeCheck size={13} />
              Keaslian Dokumen
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-brown leading-snug">
              Verifikasi <span className="text-emerald-600">Invoice</span>
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 max-w-lg mx-auto">
              Scan QR Code atau masukkan nomor invoice untuk memastikan keaslian booking.
            </p>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="relative py-6 md:py-10 bg-white">
        <TopoPattern />
        <div className="relative z-10 max-w-2xl w-full mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-amber-300 p-6 space-y-5">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-brown">Nomor Invoice</label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doVerify(input);
                    }}
                    placeholder="Contoh: INV-LB-202607-AB12CD"
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm font-mono tracking-wide focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={imageUploading}
                  onClick={() => {
                    if (result) {
                      handleScanAgain();
                    } else {
                      setScannerOpen((s) => !s);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-100 hover:border-emerald-300 transition-all disabled:opacity-50"
                >
                  {result ? (
                    <>
                      <RotateCcw size={18} />
                      Scan Baru
                    </>
                  ) : scannerOpen ? (
                    <>Tutup</>
                  ) : (
                    <>
                      <QrCode size={18} />
                      Scan Kamera
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={imageUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                  title="Upload gambar QR dari galeri"
                >
                  {imageUploading ? (
                    <>Memuat...</>
                  ) : (
                    <>
                      <ImagePlus size={18} />
                      Pilih Gambar
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => doVerify(input)}
              className="w-full h-11 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
            >
              {loading ? "Memverifikasi..." : "Verifikasi Invoice"}
            </button>

            {scannerOpen && (
              <div className="rounded-xl overflow-hidden border-2 border-dashed border-emerald-300 bg-slate-50">
                <div id="qr-reader" className="w-full" />
                <div className="flex items-center justify-between px-3 py-2.5">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Camera size={14} />
                    Arahkan kamera ke QR code
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseScanner}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-white"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {result && result.verified && (
              <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <BadgeCheck size={20} />
                  </span>
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Invoice Terverifikasi — Asli</p>
                    <p className="text-xs text-emerald-700/70">Dokumen resmi dari Buper Lebak Barat</p>
                  </div>
                  <span className="ml-auto inline-flex px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase">
                    {result.status}
                  </span>
                </div>
                <div className="h-px bg-emerald-200" />
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-28 text-xs text-slate-500 shrink-0">No Invoice</span>
                    <span className="font-mono font-bold text-brown text-sm">{result.invoice_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-28 text-xs text-slate-500 shrink-0 flex items-center gap-1">
                      <MapPin size={12} />
                      Sekolah
                    </span>
                    <span className="font-semibold text-brown">{result.school_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-28 text-xs text-slate-500 shrink-0 flex items-center gap-1">
                      <Users size={12} />
                      Peserta
                    </span>
                    <span>{result.participant_count} siswa</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-28 text-xs text-slate-500 shrink-0 flex items-center gap-1">
                      <UserRound size={12} />
                      PIC
                    </span>
                    <span>{result.pic_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-28 text-xs text-slate-500 shrink-0 flex items-center gap-1">
                      <CalendarDays size={12} />
                      Tanggal
                    </span>
                    <span>
                      {safeDateFormat(result.start_date)} → {safeDateFormat(result.end_date)}
                    </span>
                  </div>
                  {result.invoice_generated_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-28 text-xs text-slate-500 shrink-0">Diterbitkan</span>
                      <span className="text-xs">
                        {safeDateFormat(result.invoice_generated_at, "d MMMM yyyy HH:mm 'WIB'")}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="w-full mt-2 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 inline-flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} />
                  Scan Invoice Lain
                </button>
              </div>
            )}

            {result && !result.verified && (
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-5 flex items-start gap-3">
                <XCircleIcon size={28} className="text-red-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-red-700 text-sm">Invoice Tidak Ditemukan</p>
                  <p className="mt-1 text-xs text-red-600">{result.message}</p>
                  <button
                    type="button"
                    onClick={handleScanAgain}
                    className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100"
                  >
                    <RotateCcw size={14} />
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="bg-white">
        <PineDivider color="#14301c" />
      </div>
      <Footer buperName={settings.buper_name} />
    </div>
  );
}

function XCircleIcon(props: { size: number; className?: string }) {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}


