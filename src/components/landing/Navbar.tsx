import { useState, useEffect } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  buperName: string;
}

const links = [
  { href: "#tentang", label: "Tentang" },
  { href: "#profil", label: "Profil" },
  { href: "#kalender", label: "Kalender" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#kontak", label: "Kontak" },
  { href: "/verifikasi", label: "Verifikasi", isRoute: true },
] as const;

function BrandLogo() {
  return (
    <img
      src="/images/logo.png"
      alt="Logo Bumi Perkemahan Lebak Barat"
      className="h-10 w-auto drop-shadow-sm"
    />
  );
}

export default function Navbar({ buperName }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function onScroll() {
      if (location.pathname !== "/") {
        setScrolled(true);
        return;
      }
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href") ?? "";
    const isHash = href.startsWith("#");
    if (location.pathname !== "/" && isHash) {
      e.preventDefault();
      setOpen(false);
      navigate(`/${href}`);
      return;
    }
    if (isHash) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      setOpen(false);
    } else {
      setOpen(false);
    }
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
            <BrandLogo />
            <span className="truncate">{buperName || "Buper Lebak Barat"}</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => {
              const isRoute = (l as { isRoute?: boolean }).isRoute;
              if (isRoute) {
                return (
                  <Link
                    key={l.href}
                    to={l.href}
                    className="relative text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all hover:after:w-full"
                  >
                    {l.label}
                  </Link>
                );
              }
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={handleNavClick}
                  className="relative text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-600 after:transition-all hover:after:w-full"
                >
                  {l.label}
                </a>
              );
            })}
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              title="Login Admin"
            >
              <LogIn size={16} />
              Login
            </Link>
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
            {links.map((l) => {
              const isRoute = (l as { isRoute?: boolean }).isRoute;
              if (isRoute) {
                return (
                  <Link
                    key={l.href}
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
                  >
                    {l.label}
                  </Link>
                );
              }
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={handleNavClick}
                  className="block py-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
                >
                  {l.label}
                </a>
              );
            })}
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              <LogIn size={16} />
              Login Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
