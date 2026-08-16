import { Landmark, Waves, Trees } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import ScoutBadge from "@/components/landing/ornaments/ScoutBadge";
import { useLandingTheme } from "@/components/landing/ThemeContext";

const MILESTONES = [
  {
    icon: Landmark,
    title: "Diresmikan 14 Agustus 2023",
    desc: "Oleh Bupati Majalengka sekaligus Mabicab, Bapak Dr. H. Karna Sobahi, M.M.Pd., bertepatan dengan Jambore Ranting Kecamatan Banjaran & Hari Jadi Pramuka ke-62.",
  },
  {
    icon: Waves,
    title: "Luas 15.000 m² + Embung Desa",
    desc: "Tanah aset (bengkok) Desa Girimulya dengan kolam (embung desa) di tengah Buper yang menambah daya tarik pengunjung.",
  },
  {
    icon: Trees,
    title: "Home Base Kwarran Banjaran",
    desc: "Seluruh kegiatan kepramukaan Kecamatan Banjaran dikonsentrasikan di Buper Lebak Barat.",
  },
];

export default function History() {
  const left = useReveal<HTMLDivElement>();
  const right = useReveal<HTMLDivElement>();
  const { isDark } = useLandingTheme();

  return (
    <section id="profil" className={`relative py-16 md:py-24 transition-colors duration-700 ${isDark ? "bg-[#0e1a12]" : "bg-cream"}`}>
      <TopoPattern />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${isDark ? "bg-emerald-900/50 text-emerald-200 border border-emerald-800" : "bg-emerald-100 text-emerald-800"}`}>
            <Landmark size={16} />
            Profil & Sejarah
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-emerald-50" : "text-brown"}`}>
            Sejarah Buper Lebak Barat
          </h2>
          <p className={`mt-3 max-w-2xl mx-auto ${isDark ? "text-emerald-200/70" : "text-slate-600"}`}>
            Perjalanan Bumi Perkemahan Lebak Barat dari peresmian hingga menjadi
            pusat kegiatan kepramukaan Kecamatan Banjaran.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          {/* Video */}
          <div
            ref={left.ref}
            className={`reveal reveal-left ${left.visible ? "is-visible" : ""}`}
          >
            <div className={`rounded-2xl overflow-hidden shadow-lg border-2 border-dashed p-2 transition-colors ${isDark ? "border-emerald-800 bg-[#132a1a]" : "border-amber-300 bg-white"}`}>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/zP_ydkFJKhI?si=fe4ChfoywvSXXR-7"
                  title="Profil Bumi Perkemahan Lebak Barat"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            <div className={`mt-4 rounded-2xl overflow-hidden shadow-lg border-2 border-dashed p-2 transition-colors ${isDark ? "border-emerald-800 bg-[#132a1a]" : "border-amber-300 bg-white"}`}>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/vD2wR4GNyCQ?si=_fmfGiHz5WTqC-lq"
                  title="Dokumentasi Bumi Perkemahan Lebak Barat"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            <p className={`mt-3 text-center text-xs ${isDark ? "text-emerald-200/50" : "text-slate-500"}`}>
              Video profil &amp; dokumentasi Bumi Perkemahan Lebak Barat
            </p>
          </div>

          <div
            ref={right.ref}
            className={`reveal reveal-right ${right.visible ? "is-visible" : ""}`}
          >
            <div className={`space-y-4 leading-relaxed ${isDark ? "text-emerald-200/70" : "text-slate-700"}`}>
              <p>
                Bumi Perkemahan Lebak Barat diresmikan pada tanggal{" "}
                <span className={`font-semibold ${isDark ? "text-emerald-100" : "text-brown"}`}>
                  14 Agustus 2023
                </span>{" "}
                oleh Bupati Majalengka sekaligus Mabicab (Bapak Dr. H. Karna
                Sobahi, M.M.Pd.) yang bertepatan dengan Jambore Ranting
                Kecamatan Banjaran dan Peringatan Hari Jadi Pramuka ke-62.
                Dihadiri oleh Ketua Kwarcab Majalengka (Bapak Drs. H. Eman
                Suherman, M.M.) yang juga menjabat sebagai Sekda Kabupaten
                Majalengka.
              </p>
              <p>
                Buper Lebak Barat merupakan tanah Aset (Bengkok) Desa Girimulya
                dengan luas{" "}
                <span className={`font-semibold ${isDark ? "text-emerald-100" : "text-brown"}`}>15.000 m²</span>,
                terdapat kolam (embung desa) yang berada di tengah-tengah Buper
                sehingga menambah daya tarik pengunjung.
              </p>
              <p>
                Buper Lebak Barat merupakan{" "}
                <span className={`font-semibold ${isDark ? "text-emerald-100" : "text-brown"}`}>
                  Home Base Kwartir Ranting Pramuka Kecamatan Banjaran
                </span>{" "}
                dimana seluruh kegiatan kepramukaan yang ada di Kecamatan
                Banjaran akan dikonsentrasikan di Buper Lebak Barat. Pengelolaan
                Buper Lebak Barat awalnya dilakukan oleh pihak Pemerintah Desa
                Girimulya, namun sekarang dialihkan pengelolaannya kepada BUMDes
                Gunung Sembung Desa Girimulya yang bekerja sama dengan Kwartir
                Ranting Pramuka Banjaran.
              </p>
            </div>

            <ul className="mt-6 space-y-4">
              {MILESTONES.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5">
                    <ScoutBadge
                      icon={<Icon size={18} />}
                      size={44}
                      colorClass={isDark ? "text-emerald-400" : "text-emerald-600"}
                    />
                  </span>
                  <span>
                    <span className={`block font-semibold text-sm ${isDark ? "text-emerald-100" : "text-brown"}`}>
                      {title}
                    </span>
                    <span className={`block text-sm mt-0.5 ${isDark ? "text-emerald-200/60" : "text-slate-600"}`}>
                      {desc}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
