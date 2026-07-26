import { Landmark, Waves, Trees } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import ScoutBadge from "@/components/landing/ornaments/ScoutBadge";

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

  return (
    <section id="profil" className="relative py-16 md:py-24 bg-cream">
      <TopoPattern />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-4">
            <Landmark size={16} />
            Profil & Sejarah
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brown">
            Sejarah Buper Lebak Barat
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
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
            <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-dashed border-amber-300 bg-white p-2">
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
            <p className="mt-3 text-center text-xs text-slate-500">
              Video profil Bumi Perkemahan Lebak Barat
            </p>
          </div>

          {/* Text */}
          <div
            ref={right.ref}
            className={`reveal reveal-right ${right.visible ? "is-visible" : ""}`}
          >
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Bumi Perkemahan Lebak Barat diresmikan pada tanggal{" "}
                <span className="font-semibold text-brown">
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
                <span className="font-semibold text-brown">15.000 m²</span>,
                terdapat kolam (embung desa) yang berada di tengah-tengah Buper
                sehingga menambah daya tarik pengunjung.
              </p>
              <p>
                Buper Lebak Barat merupakan{" "}
                <span className="font-semibold text-brown">
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
                      colorClass="text-emerald-600"
                    />
                  </span>
                  <span>
                    <span className="block font-semibold text-brown text-sm">
                      {title}
                    </span>
                    <span className="block text-sm text-slate-600 mt-0.5">
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
