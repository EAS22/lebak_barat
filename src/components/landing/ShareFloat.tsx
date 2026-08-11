import { useState } from "react";
import { Share2, Copy, Check, X, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

const SITE_URL = "https://lebakbarat.girimulya.com";
const SITE_TITLE = "Bumi Perkemahan Lebak Barat";
const SITE_DESC = "Bumi perkemahan eksklusif di Majalengka untuk school camp 3H2M — cek tanggal, fasilitas, galeri!";

export default function ShareFloat() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
      <div className="fixed bottom-4 right-4 z-[88] md:bottom-6 md:right-6 flex flex-col items-end gap-2">
        {open && (
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-dashed border-amber-300 p-3 w-[280px] animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold text-brown flex items-center gap-1.5">
                <Share2 size={14} className="text-emerald-600" />
                Bagikan Website
              </p>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center gap-2 mb-3">
              <p className="text-[11px] font-mono text-slate-600 truncate flex-1">{SITE_URL}</p>
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
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-dashed border-amber-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-emerald-300 hover:rotate-[-2deg] transition-all duration-300 flex items-center justify-center group"
          title="Bagikan website"
          aria-label="Bagikan website"
        >
          {open ? (
            <X size={22} className="text-slate-600" />
          ) : (
            <Share2 size={22} className="text-emerald-700 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>
    </>
  );
}
