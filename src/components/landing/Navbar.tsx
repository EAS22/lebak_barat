import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { waLink } from "@/lib/utils";

interface NavbarProps {
  buperName: string;
  waNumber: string;
  waLabel: string;
}

const links = [
  { href: "#tentang", label: "Tentang" },
  { href: "#kalender", label: "Kalender" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#kontak", label: "Kontak" },
];

function TentLogo() {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" aria-hidden="true">
      <polygon
        points="2,22 14,3 26,22"
        fill="#FBC02D"
        stroke="#3E2723"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polygon points="14,10 10,22 18,22" fill="#3E2723" />
    </svg>
  );
}

export default function Navbar({ buperName, waNumber, waLabel }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const target = document.querySelector(
      (e.currentTarget as HTMLAnchorElement).getAttribute("href") ?? ""
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-white/90 backdrop-blur-lg shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-bold text-brown truncate"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <TentLogo />
            <span className="truncate">{buperName || "Buper Lebak Barat"}</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={handleNavClick}
                className="relative text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
            <a
              href={waLink(waNumber, `Halo ${waLabel}, saya ingin bertanya tentang booking.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Booking via WA
            </a>
          </div>

          <button
            type="button"
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-4 py-3 space-y-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={handleNavClick}
                className="block py-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
              >
                {l.label}
              </a>
            ))}
            <a
              href={waLink(waNumber, `Halo ${waLabel}, saya ingin bertanya tentang booking.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              Booking via WA
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
