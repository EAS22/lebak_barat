import { waLink } from "@/lib/utils";

interface FooterProps {
  buperName: string;
  waNumber: string;
  waLabel: string;
}

export default function Footer({ buperName, waNumber, waLabel }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white">{buperName}</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Desa Girimulya, Kecamatan Banjaran, Kabupaten Majalengka, Jawa
              Barat.
            </p>
            <p className="mt-2 text-xs text-slate-500">
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
              <a href="mailto:dev.lebakbarat@girimulya.com" className="block text-xs text-slate-500 hover:text-white">
                dev.lebakbarat@girimulya.com
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {year} {buperName}. All rights reserved. | lebakbarat.girimulya.com
        </div>
      </div>
    </footer>
  );
}
