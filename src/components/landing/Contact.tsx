import { useState } from "react";
import { MapPin, Clock, MessageCircle, Mail, Instagram, Youtube, Maximize2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { useWaBooking } from "@/components/landing/WaBookingModal";
import CampfireFlame from "@/components/landing/ornaments/CampfireFlame";
import { useLandingTheme } from "@/components/landing/ThemeContext";

const MAP_URL = "https://maps.app.goo.gl/K9xTHjgc4boF3YQu5";
const MAP_COORDS = "-6.943210, 108.325651";

const SOCIALS = [
  {
    icon: Instagram,
    label: "@lebakbaratedupark",
    desc: "Buper Lebak Barat",
    url: "https://instagram.com/lebakbaratedupark",
  },
  {
    icon: Instagram,
    label: "@girimulya.bjr",
    desc: "Pemerintah Desa Girimulya",
    url: "https://instagram.com/girimulya.bjr",
  },
  {
    icon: Instagram,
    label: "@bumdesgunungsembung",
    desc: "Bumdes Gunung Sembung",
    url: "https://instagram.com/bumdesgunungsembung",
  },
  {
    icon: Youtube,
    label: "Pemdes Girimulya",
    desc: "YouTube",
    url: "https://www.youtube.com/@pemdesgirimulya",
  },
];

const DENAH_SRC = "/images/denah.png";

export default function Contact() {
  const card = useReveal<HTMLDivElement>();
  const denah = useReveal<HTMLDivElement>();
  const { openWaModal } = useWaBooking();
  const { isDark } = useLandingTheme();
  const [showDenahFull, setShowDenahFull] = useState(false);

  return (
    <section id="kontak" className={`py-16 md:py-24 transition-colors duration-700 ${isDark ? "bg-[#0a1210]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown">
            Kontak & Lokasi
          </h2>
          <p className="mt-3 text-slate-600">
            Hubungi admin booking kami dan lihat denah lokasi Buper.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto lg:items-stretch items-start">
          {/* Card Denah */}
          <div
            ref={denah.ref}
            className={`flex flex-col bg-white rounded-2xl shadow-lg border-2 border-dashed border-emerald-300 p-4 md:p-5 reveal ${denah.visible ? "is-visible" : ""}`}
          >
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="flex items-center gap-2 text-base font-bold text-brown">
                <MapPin size={18} className="text-emerald-600" />
                Denah Buper Lebak Barat
              </h3>
              <button
                type="button"
                onClick={() => setShowDenahFull(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Maximize2 size={14} />
                Perbesar
              </button>
            </div>

            <div
              className="relative flex-1 min-h-[400px] lg:min-h-0 group overflow-hidden rounded-xl bg-white cursor-zoom-in border border-amber-200"
              onClick={() => setShowDenahFull(true)}
            >
              <img
                src={DENAH_SRC}
                alt="Denah Bumi Perkemahan Lebak Barat"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] flex items-center gap-1">
                <Maximize2 size={12} /> Klik untuk memperbesar
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <MapPin size={16} />
                Buka di Google Maps
              </a>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Koordinat: {MAP_COORDS}
              </p>
            </div>
          </div>

          {/* Card Kontak */}
          <div
            ref={card.ref}
            className={`flex flex-col bg-white rounded-2xl shadow-lg border-2 border-dashed border-amber-300 p-6 sm:p-8 text-center reveal ${card.visible ? "is-visible" : ""}`}
          >
            <div className="flex justify-center mb-4 shrink-0">
              <CampfireFlame size={56} />
            </div>

            <button
              type="button"
              onClick={() =>
                openWaModal(
                  "Halo, saya ingin bertanya tentang booking Bumi Perkemahan Lebak Barat."
                )
              }
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors anim-pulse-soft"
            >
              <MessageCircle size={20} />
              Hubungi via WhatsApp
            </button>

            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Alamat</p>
                  <p className="text-sm text-slate-600">
                    Desa Girimulya, Kecamatan Banjaran, Kabupaten Majalengka,
                    Jawa Barat
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Jam Operasional</p>
                  <p className="text-sm text-slate-600">
                    Setiap hari, 08.00 – 17.00 WIB
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">Email</p>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>
                      <span className="font-medium">Umum:</span>{" "}
                      <a href="mailto:lebakbarat@girimulya.com" className="text-emerald-600 hover:text-emerald-700">
                        lebakbarat@girimulya.com
                      </a>
                    </p>
                    <p>
                      <span className="font-medium">Booking:</span>{" "}
                      <a href="mailto:booking.lebakbarat@girimulya.com" className="text-emerald-600 hover:text-emerald-700">
                        booking.lebakbarat@girimulya.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left">
              <p className="font-medium text-slate-900 mb-3 text-center">
                Ikuti Kami
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {SOCIALS.map(({ icon: Icon, label, desc, url }) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group"
                  >
                    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-brown truncate">
                        {label}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">
                        {desc}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen denah modal */}
      {showDenahFull && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowDenahFull(false)}>
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setShowDenahFull(false)}
            aria-label="Tutup"
          >
            <X size={24} />
          </button>
          <img
            src={DENAH_SRC}
            alt="Denah Bumi Perkemahan Lebak Barat - Full"
            className="max-w-full max-h-[92vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
