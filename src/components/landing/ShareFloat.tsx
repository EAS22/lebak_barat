import { useState, useEffect } from "react";
import { Share2, Copy, Check, X, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useLandingTheme } from "@/components/landing/ThemeContext";

const SITE_URL = "https://lebakbarat.girimulya.com";
const SITE_TITLE = "Bumi Perkemahan Lebak Barat";
const SITE_DESC = "Bumi perkemahan eksklusif di Majalengka untuk school camp 3H2M — cek tanggal, fasilitas, galeri!";

export default function ShareFloat() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isDark } = useLandingTheme();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(open ? "sharefloat:open" : "sharefloat:close"));
  }, [open]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      toast.success("Link website disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin link");
    }
  }

  const encodedUrl = encodeURIComponent(SITE_URL);
  const encodedText = encodeURIComponent(`${SITE_TITLE} — ${SITE_DESC} ${SITE_URL}`);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[87] bg-black/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:pointer-events-none" onClick={() => setOpen(false)} />
      )}

      <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col items-end gap-2 max-w-[calc(100vw-32px)] ${open ? "z-[92]" : "z-[88]"}`}>
        {open && (
          <div className={`rounded-2xl shadow-2xl border-2 border-dashed p-3 w-[min(300px,calc(100vw-32px))] max-w-[calc(100vw-32px)] animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto transition-colors ${isDark ? "bg-[#132a1a] border-emerald-800" : "bg-white border-amber-300"}`}>
            <div className="flex items-center justify-between mb-2.5">
              <p className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-emerald-100" : "text-brown"}`}>
                <Share2 size={14} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                Bagikan Website
              </p>
              <button
                onClick={() => setOpen(false)}
                className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? "bg-[#1e3a2a] hover:bg-[#14301c] text-emerald-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
              >
                <X size={12} />
              </button>
            </div>

            <div className={`rounded-xl border px-3 py-2 flex items-center gap-2 mb-3 ${isDark ? "bg-[#0a1210] border-emerald-800" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-[11px] font-mono truncate flex-1 ${isDark ? "text-emerald-200/60" : "text-slate-600"}`}>{SITE_URL}</p>
              <button
                onClick={handleCopy}
                className="shrink-0 w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(SITE_TITLE + " — " + SITE_DESC)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
              >
                <Send size={14} />
                Telegram
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                <span className="font-bold text-sm">f</span>
                Facebook
              </a>
              <button
                type="button"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: SITE_TITLE, text: SITE_DESC, url: SITE_URL });
                    } catch {
                      // user cancelled
                    }
                  } else {
                    handleCopy();
                  }
                }}
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors"
              >
                <Share2 size={14} />
                Lainnya
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-dashed shadow-xl hover:shadow-2xl hover:scale-105 hover:rotate-[-2deg] transition-all duration-300 flex items-center justify-center group pointer-events-auto ${isDark ? "bg-[#132a1a] border-emerald-800 hover:border-emerald-600" : "bg-white border-amber-300 hover:border-emerald-300"}`}
          title="Bagikan website"
          aria-label="Bagikan website"
        >
          {open ? (
            <X size={22} className={isDark ? "text-emerald-200" : "text-slate-600"} />
          ) : (
            <Share2 size={22} className={`${isDark ? "text-emerald-300" : "text-emerald-700"} group-hover:scale-110 transition-transform`} />
          )}
        </button>
      </div>
    </>
  );
}
