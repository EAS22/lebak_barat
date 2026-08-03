import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, XCircle, QrCode, Camera, ArrowLeft, BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface VerifyResult {
  verified: boolean;
  invoice_number?: string;
  school_name?: string;
  participant_count?: number;
  pic_name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  price?: number | string | null;
  invoice_generated_at?: string;
  generated_by_name?: string;
  message?: string;
}



export default function VerificationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get("invoice") || "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null);

  async function doVerify(rawNumber: string) {
    const number = rawNumber.trim().toUpperCase();
    if (!number) {
      setError("Masukkan nomor invoice");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
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
              }
            } catch {
              // not a url
            }
            setInput(candidate);
            doVerify(candidate);
            setScannerOpen(false);
            qr.stop().catch(() => {});
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-brown">
            <img src="/images/logo.png" alt="Logo Buper" className="h-9 w-auto" />
            <span className="hidden sm:inline">Buper Lebak Barat</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft size={16} />
            Beranda
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <BadgeCheck size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brown">
            Verifikasi Invoice
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Scan QR Code pada invoice atau masukkan nomor invoice untuk memastikan
            keaslian booking di Bumi Perkemahan Lebak Barat.
          </p>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Nomor Invoice
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doVerify(input);
                  }}
                  placeholder="Contoh: INV-LB-202607-AB12CD"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen((s) => !s)}
                className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-100"
              >
                <QrCode size={18} />
                Scan
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={() => doVerify(input)}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Memverifikasi..." : "Verifikasi Invoice"}
          </button>

          {scannerOpen && (
            <div className="rounded-xl overflow-hidden border-2 border-dashed border-emerald-300 bg-slate-50">
              <div id="qr-reader" ref={scannerRef} className="w-full" />
              <p className="text-center text-xs text-slate-500 py-2 flex items-center justify-center gap-1.5">
                <Camera size={14} />
                Arahkan kamera ke QR code pada invoice
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && result.verified && (
            <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 space-y-3 animate-[fadeSlide_0.35s_ease]">
              <div className="flex items-center gap-3 text-emerald-700">
                <CheckCircle size={32} />
                <div>
                  <p className="font-bold text-base">Invoice Terverifikasi</p>
                  <p className="text-xs text-emerald-700/80">Dokumen asli dari Buper Lebak Barat</p>
                </div>
              </div>
              <div className="grid gap-2 text-sm text-slate-700 pt-2 border-t border-emerald-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">No Invoice</span>
                  <span className="font-mono font-bold text-brown">{result.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sekolah</span>
                  <span className="font-semibold">{result.school_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peserta</span>
                  <span>{result.participant_count} siswa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PIC</span>
                  <span>{result.pic_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal</span>
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
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga</span>
                  <span className="font-semibold">
                    {typeof result.price === "number" || typeof result.price === "string"
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(Number(result.price))
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold uppercase">{result.status}</span>
                </div>
                {result.invoice_generated_at && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Diterbitkan</span>
                    <span className="text-xs">
                      {format(new Date(result.invoice_generated_at), "d MMM yyyy HH:mm", {
                        locale: localeId,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {result && !result.verified && (
            <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-5 flex items-start gap-3">
              <XCircle size={28} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 text-sm">Invoice Tidak Ditemukan</p>
                <p className="mt-1 text-xs text-red-600">{result.message}</p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Tips: Buka kamera HP, scan QR code di invoice cetak. Sistem akan membuka halaman verifikasi otomatis.
        </p>
      </main>
    </div>
  );

  function CheckCircle(props: { size: number }) {
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
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    );
  }
}
