import { CalendarDays, Phone } from "lucide-react";
import { waLink } from "@/lib/utils";

interface HeroProps {
  waNumber: string;
  waLabel: string;
}

const stats = [
  { value: "1000+", label: "Peserta" },
  { value: "1", label: "Akses Aman" },
  { value: "10", label: "Fasilitas" },
];

export default function Hero({ waNumber, waLabel }: HeroProps) {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Bumi Perkemahan{" "}
              <span className="text-emerald-600">Lebak Barat</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed">
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
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Phone size={18} />
                Hubungi Admin
              </a>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold text-slate-900">
                    {s.value}
                  </div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600">
              <img
                src="/images/hero.jpg"
                alt="Bumi Perkemahan Lebak Barat"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
