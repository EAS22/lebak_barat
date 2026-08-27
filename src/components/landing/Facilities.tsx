import { useState, useEffect } from "react";
import {
  Building,
  Building2,
  Utensils,
  UtensilsCrossed,
  Package,
  Droplets,
  Heart,
  HeartHandshake,
  Car,
  Store,
  Shield,
  ShieldCheck,
  Flame,
  Zap,
  Music,
  Cross,
  Map,
  Mic,
  Tent,
  Flag,
  TreePine,
  Waves,
  Coffee,
  Lamp,
  Speaker,
  Mountain,
  Binoculars,
  Footprints,
  Sun,
  Moon,
  Star,
  Cloud,
  CloudRain,
  Umbrella,
  Thermometer,
  Wind,
  Snowflake,
  Sunset,
  Sunrise,
  Compass,
  Anchor,
  Route,
  MapPin,
  Navigation,
  Globe,
  Home,
  House,
  Castle,
  TentTree,
  Backpack,
  Luggage,
  Drum,
  Guitar,
  Radio,
  Megaphone,
  Bookmark,
  BadgeCheck,
  Trophy,
  Award,
  Medal,
  Gift,
  PartyPopper,
  Sparkles,
  Lightbulb,
  Wrench,
  Hammer,
  Plug,
  Battery,
  Wifi,
  Signal,
  Phone,
  Mail,
  MessageCircle,
  Users,
  UserCheck,
  UserRound,
  Baby,
  GraduationCap,
  BookOpen,
  Clipboard,
  FileText,
  Scroll,
  Shirt,
  Beef,
  Soup,
  Apple,
  Cherry,
  Cookie,
  Flower,
  Leaf,
  Bird,
  Fish,
  Bug,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useReveal } from "@/hooks/useReveal";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import { fetchPublicFacilities, type PublicFacility } from "@/lib/api";
import { useLandingTheme } from "@/components/landing/ThemeContext";

export const ICON_MAP: Record<string, LucideIcon> = {
  tent: Tent,
  flag: Flag,
  utensils: Utensils,
  "utensils-crossed": UtensilsCrossed,
  car: Car,
  heart: Heart,
  "heart-handshake": HeartHandshake,
  droplets: Droplets,
  waves: Waves,
  music: Music,
  cross: Cross,
  zap: Zap,
  shield: Shield,
  "shield-check": ShieldCheck,
  flame: Flame,
  map: Map,
  mic: Mic,
  store: Store,
  building: Building,
  "building-2": Building2,
  package: Package,
  treepine: TreePine,
  coffee: Coffee,
  lamp: Lamp,
  speaker: Speaker,
  mountain: Mountain,
  binoculars: Binoculars,
  footprints: Footprints,
  sun: Sun,
  moon: Moon,
  star: Star,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  umbrella: Umbrella,
  thermometer: Thermometer,
  wind: Wind,
  snowflake: Snowflake,
  sunset: Sunset,
  sunrise: Sunrise,
  compass: Compass,
  anchor: Anchor,
  route: Route,
  "map-pin": MapPin,
  navigation: Navigation,
  globe: Globe,
  home: Home,
  house: House,
  castle: Castle,
  "tent-tree": TentTree,
  campfire: Flame,
  backpack: Backpack,
  luggage: Luggage,
  drum: Drum,
  guitar: Guitar,
  radio: Radio,
  megaphone: Megaphone,
  bookmark: Bookmark,
  "badge-check": BadgeCheck,
  trophy: Trophy,
  award: Award,
  medal: Medal,
  gift: Gift,
  "party-popper": PartyPopper,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  wrench: Wrench,
  hammer: Hammer,
  "tool-case": Wrench,
  plug: Plug,
  battery: Battery,
  wifi: Wifi,
  signal: Signal,
  phone: Phone,
  mail: Mail,
  "message-circle": MessageCircle,
  users: Users,
  "user-check": UserCheck,
  "user-round": UserRound,
  baby: Baby,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  clipboard: Clipboard,
  "file-text": FileText,
  scroll: Scroll,
  shirt: Shirt,
  "fork-knife": Utensils,
  beef: Beef,
  soup: Soup,
  apple: Apple,
  cherry: Cherry,
  cookie: Cookie,
  flower: Flower,
  leaf: Leaf,
  bird: Bird,
  fish: Fish,
  bug: Bug,
  "paw-print": PawPrint,
};

export const ICON_OPTIONS = [
  { key: "tent", label: "Tenda" },
  { key: "tent-tree", label: "Tenda + Pohon" },
  { key: "campfire", label: "Api Unggun" },
  { key: "flame", label: "Kayu Bakar / Api" },
  { key: "backpack", label: "Ransel / Kemah" },
  { key: "footprints", label: "Jejak / Hiking" },
  { key: "mountain", label: "Gunung" },
  { key: "treepine", label: "Pohon" },
  { key: "flower", label: "Bunga" },
  { key: "leaf", label: "Daun" },
  { key: "bird", label: "Burung" },
  { key: "fish", label: "Ikan" },
  { key: "bug", label: "Serangga" },
  { key: "paw-print", label: "Jejak Hewan" },
  { key: "sun", label: "Matahari" },
  { key: "moon", label: "Bulan" },
  { key: "star", label: "Bintang" },
  { key: "sunrise", label: "Matahari Terbit" },
  { key: "sunset", label: "Matahari Terbenam" },
  { key: "cloud", label: "Awan" },
  { key: "cloud-rain", label: "Hujan" },
  { key: "wind", label: "Angin" },
  { key: "snowflake", label: "Salju" },
  { key: "thermometer", label: "Suhu" },
  { key: "umbrella", label: "Payung" },
  { key: "flag", label: "Bendera / Lapangan" },
  { key: "map", label: "Peta" },
  { key: "map-pin", label: "Pin Lokasi" },
  { key: "compass", label: "Kompas" },
  { key: "navigation", label: "Navigasi" },
  { key: "route", label: "Rute / Jalur" },
  { key: "globe", label: "Globe" },
  { key: "anchor", label: "Jangkar" },
  { key: "binoculars", label: "Teropong" },
  { key: "utensils", label: "Dapur" },
  { key: "utensils-crossed", label: "Dapur Silang" },
  { key: "fork-knife", label: "Garpu-Pisau" },
  { key: "beef", label: "Daging / BBQ" },
  { key: "soup", label: "Sup / Makan" },
  { key: "coffee", label: "Kopi" },
  { key: "apple", label: "Buah Apel" },
  { key: "cherry", label: "Ceri" },
  { key: "cookie", label: "Kue / Snack" },
  { key: "building", label: "Gedung" },
  { key: "building-2", label: "Gedung 2" },
  { key: "home", label: "Rumah" },
  { key: "house", label: "House" },
  { key: "castle", label: "Kastil / Aula Besar" },
  { key: "car", label: "Parkir / Mobil" },
  { key: "luggage", label: "Koper / Barang" },
  { key: "heart", label: "Hati / Kasih" },
  { key: "heart-handshake", label: "Mushola / Kepedulian" },
  { key: "droplets", label: "Air / Tetesan" },
  { key: "waves", label: "Ombak / Embung" },
  { key: "shield", label: "Shield / Keamanan" },
  { key: "shield-check", label: "Shield Check" },
  { key: "zap", label: "Listrik" },
  { key: "plug", label: "Stopkontak" },
  { key: "battery", label: "Baterai" },
  { key: "lamp", label: "Lampu" },
  { key: "lightbulb", label: "Ide / Lampu Ide" },
  { key: "wifi", label: "WiFi" },
  { key: "signal", label: "Sinyal" },
  { key: "wrench", label: "Kunci Inggris" },
  { key: "hammer", label: "Palu" },
  { key: "tool-case", label: "Toolbox" },
  { key: "music", label: "Musik" },
  { key: "guitar", label: "Gitar" },
  { key: "drum", label: "Drum" },
  { key: "speaker", label: "Speaker" },
  { key: "radio", label: "Radio" },
  { key: "megaphone", label: "Megaphone / Pengumuman" },
  { key: "mic", label: "Mic / Pemateri" },
  { key: "store", label: "Toko / Kantin" },
  { key: "shirt", label: "Kaos / Seragam" },
  { key: "cross", label: "P3K / Medis" },
  { key: "users", label: "Peserta / Group" },
  { key: "user-check", label: "User Check / Panitia" },
  { key: "user-round", label: "User / PIC" },
  { key: "baby", label: "Anak / Peserta Muda" },
  { key: "graduation-cap", label: "Kelulusan / Pendidikan" },
  { key: "book-open", label: "Buku / Materi" },
  { key: "clipboard", label: "Clipboard / Daftar" },
  { key: "file-text", label: "File / Dokumen" },
  { key: "scroll", label: "Gulungan / Piagam" },
  { key: "bookmark", label: "Bookmark" },
  { key: "badge-check", label: "Badge / Lencana" },
  { key: "trophy", label: "Piala" },
  { key: "award", label: "Award / Penghargaan" },
  { key: "medal", label: "Medali" },
  { key: "gift", label: "Hadiah" },
  { key: "party-popper", label: "Pesta / Selebrasi" },
  { key: "sparkles", label: "Kilau / Spesial" },
  { key: "phone", label: "Telepon" },
  { key: "mail", label: "Email / Surat" },
  { key: "message-circle", label: "Chat / Pesan" },
  { key: "package", label: "Lainnya" },
] as const;

function iconForExplicit(iconKey?: string | null, fallbackName?: string): LucideIcon {
  if (iconKey && ICON_MAP[iconKey]) return ICON_MAP[iconKey]!;
  if (!fallbackName) return Package;
  const n = fallbackName.toLowerCase();
  if (n.includes("camping") || n.includes("tenda")) return Tent;
  if (n.includes("upacara") || n.includes("lapangan")) return Flag;
  if (n.includes("dapur") || n.includes("cathering") || n.includes("catering")) return Utensils;
  if (n.includes("parkir")) return Car;
  if (n.includes("mushola") || n.includes("wudhu")) return Heart;
  if (n.includes("toilet") || n.includes("mck")) return Droplets;
  if (n.includes("sound")) return Music;
  if (n.includes("p3k")) return Cross;
  if (n.includes("listrik") || n.includes("lighting")) return Zap;
  if (n.includes("keamanan")) return Shield;
  if (n.includes("kayu")) return Flame;
  if (n.includes("route") || n.includes("jelajah")) return Map;
  if (n.includes("pemateri")) return Mic;
  if (n.includes("pedagang") || n.includes("kantin") || n.includes("warung")) return Store;
  if (n.includes("anjungan") || n.includes("gedung") || n.includes("aula")) return Building;
  return Package;
}

function FacilityCard({
  facility,
  index,
  visible,
  opsional,
}: {
  facility: PublicFacility;
  index: number;
  visible: boolean;
  opsional?: boolean;
}) {
  const Icon = iconForExplicit(facility.icon, facility.name);
  const { isDark } = useLandingTheme();

  return (
    <div
      className={`group rounded-xl border-2 p-4 text-center flex flex-col items-center justify-between h-full min-h-[128px] transition-all hover:-translate-y-1 hover:rotate-1 hover:shadow-lg reveal ${
        isDark
          ? opsional
            ? "bg-[#132a1a] border-dashed border-emerald-800 hover:border-emerald-600"
            : "bg-[#132a1a] border-dashed border-emerald-800 hover:border-emerald-600"
          : opsional
            ? "bg-white border-dashed border-emerald-300 hover:border-emerald-500"
            : "bg-white border-dashed border-amber-300 hover:border-emerald-400"
      } ${visible ? "is-visible" : ""}`}
      style={{ "--delay": `${index * 0.06}s` } as CSSProperties}
    >
      <div className="flex flex-col items-center">
        <div className={`w-11 h-11 mx-auto rounded-full flex items-center justify-center mb-2.5 transition-all group-hover:scale-110 shrink-0 ${isDark ? "bg-emerald-900/50 text-emerald-300 group-hover:bg-emerald-700 group-hover:text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"}`}>
          <Icon size={20} />
        </div>
        <h3 className={`font-semibold text-sm leading-tight ${isDark ? "text-emerald-100" : "text-brown"}`}>
          {facility.name}
        </h3>
      </div>
      {opsional && (
        <span className={`mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 shrink-0 ${isDark ? "text-emerald-300 bg-emerald-900/50" : "text-emerald-600 bg-emerald-50"}`}>
          Opsional
        </span>
      )}
    </div>
  );
}

export default function Facilities() {
  const grid = useReveal<HTMLDivElement>(0.05);
  const { isDark } = useLandingTheme();
  const [facilities, setFacilities] = useState<PublicFacility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublicFacilities().then((data) => {
      if (!cancelled) {
        setFacilities(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const utama = facilities
    .filter((f) => f.category === "utama")
    .sort((a, b) => a.sort_order - b.sort_order);
  const opsional = facilities
    .filter((f) => f.category === "opsional")
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section id="fasilitas" className={`relative py-16 md:py-24 transition-colors duration-700 ${isDark ? "bg-[#0e1a12]" : "bg-cream"}`}>
      <TopoPattern />
      <div
        ref={grid.ref}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? "text-emerald-50" : "text-brown"}`}>
            Fasilitas
          </h2>
          <p className={`mt-3 ${isDark ? "text-emerald-200/70" : "text-slate-600"}`}>
            Fasilitas lengkap untuk kenyamanan kegiatan Anda.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-white/60 border-2 border-dashed border-amber-200 animate-pulse"
              />
            ))}
          </div>
        ) : facilities.length === 0 ? (
          <p className="text-center text-slate-500">
            Data fasilitas belum tersedia.
          </p>
        ) : (
          <div className="space-y-10">
            {utama.length > 0 && (
              <div>
                <h3 className={`text-lg font-bold mb-4 text-center md:text-left ${isDark ? "text-emerald-100" : "text-brown"}`}>
                  Fasilitas Utama &amp; Area
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 items-stretch">
                  {utama.map((f, i) => (
                    <FacilityCard
                      key={f.id}
                      facility={f}
                      index={i}
                      visible={grid.visible}
                    />
                  ))}
                </div>
              </div>
            )}
            {opsional.length > 0 && (
              <div>
                <h3 className={`text-lg font-bold mb-4 text-center md:text-left ${isDark ? "text-emerald-100" : "text-brown"}`}>
                  Layanan &amp; Fasilitas Opsional
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 items-stretch">
                  {opsional.map((f, i) => (
                    <FacilityCard
                      key={f.id}
                      facility={f}
                      index={i}
                      visible={grid.visible}
                      opsional
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
