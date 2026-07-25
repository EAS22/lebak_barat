import { Check } from "lucide-react";

const advantages = [
  "Lokasi strategis di kaki Gunung Ciremai",
  "Kapasitas hingga 200 peserta",
  "Paket lengkap 3 Hari 2 Malam",
  "Fasilitas gedung serbaguna & MCK",
  "Dapur umum dan ruang logistik",
  "Akses mudah dan parkir luas",
];

export default function About() {
  return (
    <section id="tentang" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Tentang Buper Lebak Barat
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Bumi Perkemahan Lebak Barat merupakan lokasi perkemahan dan
              outbound yang terletak di Desa Girimulya, Kecamatan Banjaran,
              Kabupaten Majalengka, Jawa Barat. Dengan suasana alam yang asri
              dan fasilitas yang memadai, tempat ini cocok untuk kegiatan
              kemah, outbound, gathering, dan berbagai aktivitas luar ruangan
              lainnya.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Kami menyediakan paket 3 Hari 2 Malam dengan harga terjangkau
              dan fasilitas lengkap, termasuk gedung serbaguna, dapur umum,
              toilet, mushola, dan ruang logistik.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              Keunggulan Kami
            </h3>
            <ul className="space-y-4">
              {advantages.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check size={14} />
                  </span>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
