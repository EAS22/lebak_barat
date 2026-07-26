import { waLink } from "@/lib/utils";
import Stars from "@/components/landing/ornaments/Stars";

interface FooterProps {
  buperName: string;
  waNumber: string;
  waLabel: string;
}

export default function Footer({ buperName, waNumber, waLabel }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#14301c] text-slate-300">
      <Stars />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Logo Bumi Perkemahan Lebak Barat"
                className="h-14 w-auto drop-shadow-[0_0_12px_rgba(251,192,45,0.35)]"
              />
              <h3 className="text-lg font-bold text-white">{buperName}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed">
              Desa Girimulya, Kecamatan Banjaran, Kabupaten Majalengka, Jawa
              Barat.
            </p>
            <p className="mt-2 text-xs text-emerald-200/60">
              lebakbarat.girimulya.com
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#tentang" className="hover:text-white transition-colors">
                  Tentang
                </a>
              </li>
              <li>
                <a href="#kalender" className="hover:text-white transition-colors">
                  Kalender
                </a>
              </li>
              <li>
                <a href="#fasilitas" className="hover:text-white transition-colors">
                  Fasilitas
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-white transition-colors">
                  Kontak
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Kontak
            </h4>
            <div className="space-y-2 text-sm">
              <a
                href={waLink(waNumber, `Halo ${waLabel}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-white transition-colors"
              >
                WhatsApp: {waLabel}
              </a>
              <a href="mailto:lebakbarat@girimulya.com" className="block hover:text-white">
                lebakbarat@girimulya.com
              </a>
              <a href="mailto:booking.lebakbarat@girimulya.com" className="block hover:text-white">
                booking.lebakbarat@girimulya.com
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-emerald-900 text-center text-xs text-emerald-200/60">
          &copy; {year} {buperName}. All rights reserved. | lebakbarat.girimulya.com
        </div>
      </div>
    </footer>
  );
}
