import { Check, Compass } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import ScoutBadge from "@/components/landing/ornaments/ScoutBadge";
import { useLandingTheme } from "@/components/landing/ThemeContext";

const advantages = [
  "Lokasi strategis dengan suasana alam asri",
  "Kapasitas maksimal 600 peserta",
  "Fasilitas gedung serbaguna & MCK",
  "Dapur umum dan ruang logistik",
  "Area aman dengan 1 akses masuk & keluar",
  "Akses mudah dan parkir luas",
];

export default function About() {
  const left = useReveal<HTMLDivElement>();
  const right = useReveal<HTMLDivElement>();
  const { isDark } = useLandingTheme();

  return (
    <section id="tentang" className={`relative py-16 md:py-24 transition-colors duration-700 ${isDark ? "bg-[#0e1a12]" : "bg-cream"}`}>
      <TopoPattern />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div
            ref={left.ref}
            className={`reveal reveal-left ${left.visible ? "is-visible" : ""}`}
          >
            <div className="flex items-center gap-3">
              <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-emerald-50" : "text-brown"}`}>
                Tentang Buper Lebak Barat
              </h2>
              <Compass
                size={32}
                className={`flex-shrink-0 transition-transform duration-700 hover:rotate-180 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </div>
            <p className={`mt-4 leading-relaxed ${isDark ? "text-emerald-200/70" : "text-slate-700"}`}>
              Bumi Perkemahan Lebak Barat merupakan lokasi perkemahan yang
              terletak di Desa Girimulya, Kecamatan Banjaran, Kabupaten
              Majalengka, Jawa Barat. Dengan suasana alam yang asri dan
              fasilitas yang memadai, tempat ini cocok untuk kegiatan kemah,
              school camp, gathering, dan berbagai aktivitas luar ruangan
              lainnya.
            </p>
            <p className={`mt-4 leading-relaxed ${isDark ? "text-emerald-200/70" : "text-slate-700"}`}>
              Dengan kapasitas hingga 600 peserta, kami menyediakan fasilitas
              lengkap termasuk gedung serbaguna, dapur umum, toilet, mushola,
              dan ruang logistik dengan harga terjangkau.
            </p>
          </div>
          <div
            ref={right.ref}
            className={`reveal reveal-right ${right.visible ? "is-visible" : ""}`}
          >
            <h3 className={`text-xl font-semibold mb-6 ${isDark ? "text-emerald-100" : "text-brown"}`}>
              Keunggulan Kami
            </h3>
            <ul className="space-y-4">
              {advantages.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex-shrink-0">
                    <ScoutBadge
                      icon={<Check size={16} />}
                      size={40}
                      colorClass={isDark ? "text-emerald-400" : "text-emerald-600"}
                    />
                  </span>
                  <span className={isDark ? "text-emerald-200/80" : "text-slate-700"}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
