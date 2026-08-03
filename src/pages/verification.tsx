import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useReveal } from "@/hooks/useReveal";
import PineDivider from "@/components/landing/ornaments/PineDivider";
import MountainDivider from "@/components/landing/ornaments/MountainDivider";
import CloudsSun from "@/components/landing/ornaments/CloudsSun";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import { fetchPublicSettings, type PublicSettings } from "@/lib/api";

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

export default function VerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get("invoice") || "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null);
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);
  const heroReveal = useReveal<HTMLDivElement>();

  useEffect(() => {
    fetchPublicSettings().then(setSettings);
  }, []);

  async function doVerify(rawNumber: string) {
    const number = rawNumber.trim().toUpperCase();
    if (!number) {
      setError("Masukkan nomor invoice");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setScannerOpen(false);
    try {
      html5QrCodeRef.current?.stop().catch(() => {});
    } catch {}
    try {
      const res = await fetch(`/api/public/verify-invoice?number=${encodeURIComponent(number)}`);
      const data = (await res.json()) as VerifyResult & { error?: string };
      if (!res.ok) {
        if (res.status === 404) {
          setResult({
            verified: false,
            message: data.message || "Invoice tidak ditemukan. Pastikan nomor benar atau invoice palsu.",
          });
          return;
        }
        throw new Error(data.error || `Gagal verifikasi: ${res.status}`);
      }
      setResult(data);
      setSearchParams({ invoice: number }, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memverifikasi";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = searchParams.get("invoice");
    if (initial) {
      doVerify(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // QR Scanner
  useEffect(() => {
    if (!scannerOpen) return;
    let cancelled = false;

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const targetId = "qr-reader";

      const qr = new Html5Qrcode(targetId);
      html5QrCodeRef.current = qr;

      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            let candidate = decodedText.trim();
            try {
              if (candidate.startsWith("http")) {
                const url = new URL(candidate);
                const inv = url.searchParams.get("invoice");
                if (inv) candidate = inv;
                else {
                  const parts = candidate.split("/").filter(Boolean);
                  const last = parts[parts.length - 1];
                  if (last && last.startsWith("INV-")) candidate = last;
                }
              }
            } catch {
              // not a url
            }
            setInput(candidate);
            doVerify(candidate);
          },
          () => {}
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(`Kamera tidak tersedia: ${msg}`);
        setScannerOpen(false);
      }
    })();

    return () => {
      cancelled = true;
      html5QrCodeRef.current?.stop().catch(() => {});
      html5QrCodeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerOpen]);

  function handleScanAgain() {
    setResult(null);
    setError(null);
    setInput("");
    setSearchParams({}, { replace: true });
    setScannerOpen(true);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar buperName={settings.buper_name} />

      {/* Hero - same as landing */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20 bg-gradient-to-b from-sky-100 to-amber-50">
        <CloudsSun />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={heroReveal.ref}
            className={`text-center reveal ${heroReveal.visible ? "is-visible" : ""}`}
          >
            <div className="mx-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-4">
              <BadgeCheck size={16} />
              Keaslian Dokumen
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-brown leading-tight">
              Verifikasi <span className="text-emerald-600">Invoice</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Scan QR Code pada invoice atau masukkan nomor invoice untuk
              memastikan keaslian booking di{" "}
              <span className="font-semibold text-brown">Bumi Perkemahan Lebak Barat</span>.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 -left-4 w-[calc(100%+32px)]">
          <MountainDivider colors={["#A5D6A7", "#66BB6A", "#FFF8E1"]} />
        </div>
      </section>

      <div className="bg-cream">
        <PineDivider color="#ffffff" />
      </div>

      {/* Main Content */}
      <section className="relative py-12 md:py-16 bg-white">
        <TopoPattern />
        <div className="relative z-10 max-w-2xl w-full mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-amber-300 p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-brown">
                Nomor Invoice
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
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
                <button
                  type="button"
                  onClick={() => {
                    if (result) {
                      handleScanAgain();
                    } else {
                      setScannerOpen((s) => !s);
                      if (result) {
                        setResult(null);
                      }
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-100 hover:border-emerald-300 transition-all shrink-0"
                >
                  {result ? (
                    <>
                      <RotateCcw size={18} />
                      Scan Baru
                    </>
                  ) : (
                    <>
                      <QrCode size={18} />
                      Scan QR
                    </>
                  )}
                </button>
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
              <div className="rounded-xl overflow-hidden border-2 border-dashed border-emerald-300 bg-slate-50 animate-[fadeSlide_0.3s_ease]">
                <div id="qr-reader" ref={scannerRef} className="w-full" />
                <p className="text-center text-xs text-slate-500 py-2.5 flex items-center justify-center gap-1.5">
                  <Camera size={14} />
                  Arahkan kamera ke QR code pada invoice
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-[fadeSlide_0.3s_ease]">
                {error}
              </div>
            )}

            {result && result.verified && (
              <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 space-y-4 animate-[fadeSlide_0.35s_ease]">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <BadgeCheck size={20} />
                  </span>
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Invoice Terverifikasi — Asli</p>
                    <p className="text-xs text-emerald-700/70">Dokumen resmi dari Buper Lebak Barat</p>
                  </div>
                  <span className="ml-auto inline-flex px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide">
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
                      {result.start_date
                        ? format(new Date(result.start_date.slice(0, 10)), "d MMM yyyy", {
                            locale: localeId,
                          })
                        : "-"}{" "}
                      →{" "}
                      {result.end_date
                        ? format(new Date(result.end_date.slice(0, 10)), "d MMM yyyy", {
                            locale: localeId,
                          })
                        : "-"}
                    </span>
                  </div>
                  {result.invoice_generated_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-28 text-xs text-slate-500 shrink-0">Diterbitkan</span>
                      <span className="text-xs">
                        {format(new Date(result.invoice_generated_at), "d MMMM yyyy HH:mm 'WIB'", {
                          locale: localeId,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleScanAgain}
                  className="w-full mt-2 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={16} />
                  Scan Invoice Lain
                </button>
              </div>
            )}

            {result && !result.verified && (
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-5 flex items-start gap-3 animate-[fadeSlide_0.35s_ease]">
                <XCircleIcon size={28} className="text-red-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-red-700 text-sm">Invoice Tidak Ditemukan</p>
                  <p className="mt-1 text-xs text-red-600">{result.message}</p>
                  <button
                    type="button"
                    onClick={handleScanAgain}
                    className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    <RotateCcw size={14} />
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Tips: Buka kamera HP, scan QR code di invoice cetak. Sistem akan membuka halaman verifikasi
            otomatis.
          </p>
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
