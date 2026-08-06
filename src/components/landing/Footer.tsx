import { Link, useLocation, useNavigate } from "react-router-dom";
import Stars from "@/components/landing/ornaments/Stars";
import { useWaBooking } from "@/components/landing/WaBookingModal";
import { APP_VERSION } from "@/lib/version";

interface FooterProps {
  buperName: string;
}

export default function Footer({ buperName }: FooterProps) {
  const { openWaModal } = useWaBooking();
  const location = useLocation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (href.startsWith("#") && location.pathname !== "/") {
      e.preventDefault();
      navigate(`/${href}`);
    }
  }

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
                <a
                  href="#tentang"
                  onClick={(e) => handleNavClick(e, "#tentang")}
                  className="hover:text-white transition-colors"
                >
                  Tentang
                </a>
              </li>
              <li>
                <a
                  href="#profil"
                  onClick={(e) => handleNavClick(e, "#profil")}
                  className="hover:text-white transition-colors"
                >
                  Profil & Sejarah
                </a>
              </li>
              <li>
                <a
                  href="#kalender"
                  onClick={(e) => handleNavClick(e, "#kalender")}
                  className="hover:text-white transition-colors"
                >
                  Kalender
                </a>
              </li>
              <li>
                <a
                  href="#fasilitas"
                  onClick={(e) => handleNavClick(e, "#fasilitas")}
                  className="hover:text-white transition-colors"
                >
                  Fasilitas
                </a>
              </li>
              <li>
                <a
                  href="#kontak"
                  onClick={(e) => handleNavClick(e, "#kontak")}
                  className="hover:text-white transition-colors"
                >
                  Kontak
                </a>
              </li>
              <li>
                <Link to="/verifikasi" className="hover:text-white transition-colors">
                  Verifikasi Invoice
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Kontak
            </h4>
            <div className="space-y-2 text-sm">
              <button
                type="button"
                onClick={() => openWaModal("Halo, saya ingin bertanya tentang booking.")}
                className="block hover:text-white transition-colors text-left"
              >
                WhatsApp: Admin Booking
              </button>
              <a href="mailto:lebakbarat@girimulya.com" className="block hover:text-white">
                lebakbarat@girimulya.com
              </a>
              <a href="mailto:booking.lebakbarat@girimulya.com" className="block hover:text-white">
                booking.lebakbarat@girimulya.com
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-emerald-900 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center text-xs text-emerald-200/60">
          <span>&copy; {year} {buperName}. All rights reserved. | lebakbarat.girimulya.com</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-mono text-emerald-100/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            v{APP_VERSION}
          </span>
        </div>
      </div>
    </footer>
  );
}
