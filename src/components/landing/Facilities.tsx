import {
  Building,
  Utensils,
  Package,
  Users,
  Droplets,
  Heart,
  Car,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useReveal } from "@/hooks/useReveal";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";

interface Facility {
  title: string;
  desc: string;
  Icon: LucideIcon;
}

const facilities: Facility[] = [
  {
    title: "Gedung Serbaguna",
    desc: "2 kamar multi fungsi untuk kegiatan indoor.",
    Icon: Building,
  },
  {
    title: "Dapur Umum",
    desc: "Dapur lengkap untuk memasak massal.",
    Icon: Utensils,
  },
  {
    title: "Ruang Logistik",
    desc: "Penyimpanan perlengkapan dan peralatan.",
    Icon: Package,
  },
  {
    title: "Toilet Panitia",
    desc: "Toilet khusus untuk panitia.",
    Icon: Users,
  },
  {
    title: "Toilet MCK Pria",
    desc: "Fasilitas mandi cuci kakus pria.",
    Icon: Droplets,
  },
  {
    title: "Toilet MCK Wanita",
    desc: "Fasilitas mandi cuci kakus wanita.",
    Icon: Droplets,
  },
  {
    title: "Mushola",
    desc: "Tempat ibadah yang nyaman.",
    Icon: Heart,
  },
  {
    title: "Area Parkir",
    desc: "Parkir luas untuk bus dan kendaraan.",
    Icon: Car,
  },
  {
    title: "Kantin / Warung",
    desc: "Warung makan dan minuman ringan.",
    Icon: Store,
  },
];

export default function Facilities() {
  const grid = useReveal<HTMLDivElement>(0.05);

  return (
    <section id="fasilitas" className="relative py-16 md:py-24 bg-cream">
      <TopoPattern />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown">
            Fasilitas
          </h2>
          <p className="mt-3 text-slate-600">
            Fasilitas lengkap untuk kenyamanan kegiatan Anda.
          </p>
        </div>

        <div
          ref={grid.ref}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
        >
          {facilities.map(({ title, desc, Icon }, i) => (
            <div
              key={title}
              className={`group bg-white rounded-xl border-2 border-dashed border-amber-300 p-4 text-center transition-all hover:-translate-y-1 hover:rotate-1 hover:shadow-lg hover:border-emerald-400 reveal ${
                grid.visible ? "is-visible" : ""
              }`}
              style={{ "--delay": `${i * 0.06}s` } as CSSProperties}
            >
              <div className="w-11 h-11 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-brown text-sm leading-tight">
                {title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
