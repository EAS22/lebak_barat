import {
  Building,
  Utensils,
  Package,
  Users,
  Droplets,
  Heart,
  Car,
  Store,
  Shield,
  type LucideIcon,
} from "lucide-react";

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
  {
    title: "Pos Keamanan",
    desc: "Keamanan 24 jam di lokasi.",
    Icon: Shield,
  },
];

export default function Facilities() {
  return (
    <section id="fasilitas" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Fasilitas
          </h2>
          <p className="mt-3 text-slate-600">
            Fasilitas lengkap untuk kenyamanan kegiatan Anda.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Icon size={24} />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
