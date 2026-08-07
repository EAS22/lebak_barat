import { useState, useEffect } from "react";
import {
  Building,
  Utensils,
  Package,
  Droplets,
  Heart,
  Car,
  Store,
  Shield,
  Flame,
  Zap,
  Music,
  Cross,
  Map,
  Mic,
  Tent,
  Flag,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useReveal } from "@/hooks/useReveal";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import { fetchPublicFacilities, type PublicFacility } from "@/lib/api";

function iconFor(name: string): LucideIcon {
  const n = name.toLowerCase();
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
  const Icon = iconFor(facility.name);
  return (
    <div
      className={`group bg-white rounded-xl border-2 p-4 text-center flex flex-col items-center justify-between h-full min-h-[128px] transition-all hover:-translate-y-1 hover:rotate-1 hover:shadow-lg reveal ${
        opsional
          ? "border-dashed border-emerald-300 hover:border-emerald-500"
          : "border-dashed border-amber-300 hover:border-emerald-400"
      } ${visible ? "is-visible" : ""}`}
      style={{ "--delay": `${index * 0.06}s` } as CSSProperties}
    >
      <div className="flex flex-col items-center">
        <div className="w-11 h-11 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 shrink-0">
          <Icon size={20} />
        </div>
        <h3 className="font-semibold text-brown text-sm leading-tight">
          {facility.name}
        </h3>
      </div>
      {opsional && (
        <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 shrink-0">
          Opsional
        </span>
      )}
    </div>
  );
}

export default function Facilities() {
  const grid = useReveal<HTMLDivElement>(0.05);
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
    <section id="fasilitas" className="relative py-16 md:py-24 bg-cream">
      <TopoPattern />
      <div
        ref={grid.ref}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown">
            Fasilitas
          </h2>
          <p className="mt-3 text-slate-600">
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
                <h3 className="text-lg font-bold text-brown mb-4 text-center md:text-left">
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
                <h3 className="text-lg font-bold text-brown mb-4 text-center md:text-left">
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
