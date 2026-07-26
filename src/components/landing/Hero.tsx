import { useState, useEffect } from "react";
import { CalendarDays, Phone, Tent } from "lucide-react";
import { waLink } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import CloudsSun from "@/components/landing/ornaments/CloudsSun";
import TentIllustration from "@/components/landing/ornaments/TentIllustration";
import MountainDivider from "@/components/landing/ornaments/MountainDivider";
import ScoutBadge from "@/components/landing/ornaments/ScoutBadge";

interface HeroProps {
  waNumber: string;
  waLabel: string;
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const { ref, visible } = useReveal<HTMLSpanElement>();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (target <= 1) {
      setCount(target);
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.round(target / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setCount(current);
    }, 40);
    return () => clearInterval(interval);
  }, [visible, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Hero({ waNumber, waLabel }: HeroProps) {
  const [offsetX, setOffsetX] = useState(0);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width - 0.5;
    setOffsetX(ratio * 12);
  }

  return (
    <section
      className="relative overflow-hidden pt-24 pb-28 md:pt-32 md:pb-40 bg-gradient-to-b from-sky-100 to-amber-50"
      onMouseMove={handleMouseMove}
    >
      <CloudsSun />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-4">
              <ScoutBadge
                icon={<Tent size={22} />}
                label="3H2M"
                size={56}
                colorClass="text-emerald-700"
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown leading-tight">
              Bumi Perkemahan{" "}
              <span className="text-emerald-600">Lebak Barat</span>
            </h1>
            <p className="mt-4 text-lg text-slate-700 leading-relaxed">
              Terletak di Desa Girimulya, Kecamatan Banjaran, Kabupaten
              Majalengka. Paket 3 Hari 2 Malam dengan fasilitas lengkap untuk
              kegiatan outbound, kemah, dan gathering.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#kalender"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector("#kalender")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <CalendarDays size={18} />
                Lihat Kalender
              </a>
              <a
                href={waLink(
                  waNumber,
                  `Halo ${waLabel}, saya ingin bertanya tentang ketersediaan jadwal.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-brown bg-tent rounded-lg hover:bg-amber-400 transition-colors"
              >
                <Phone size={18} />
                Booking via WhatsApp
              </a>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-brown">
                  <Counter target={10} />
                </div>
                <div className="text-sm text-slate-600">Fasilitas</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-brown">
                  <Counter target={1} />
                </div>
                <div className="text-sm text-slate-600">Akses Aman</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-brown">
                  3H2M
                </div>
                <div className="text-sm text-slate-600">Hari 2 Malam</div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-6">
            <img
              src="/images/logo.png"
              alt="Logo Bumi Perkemahan Lebak Barat"
              className="w-64 lg:w-80 h-auto anim-floaty drop-shadow-xl"
            />
            <TentIllustration className="w-56 lg:w-72" />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 -left-4 transition-transform duration-300 ease-out"
        style={{
          width: "calc(100% + 32px)",
          transform: `translateX(${offsetX}px)`,
        }}
      >
        <MountainDivider colors={["#A5D6A7", "#66BB6A", "#FFF8E1"]} />
      </div>
    </section>
  );
}
