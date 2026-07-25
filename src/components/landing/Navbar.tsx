import { useState } from "react";
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

export default function Navbar({ buperName, waNumber, waLabel }: NavbarProps) {
  const [open, setOpen] = useState(false);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a
            href="#"
            className="text-lg font-bold text-slate-900 truncate"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {buperName || "Buper Lebak Barat"}
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={handleNavClick}
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
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
