import { useState, useEffect } from "react";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import TopoPattern from "@/components/landing/ornaments/TopoPattern";
import { fetchPublicGallery, type PublicGalleryItem } from "@/lib/api";

type GalleryItem = PublicGalleryItem;

const FALLBACK_GALLERY: GalleryItem[] = [
  {
    slot_number: 1,
    caption: "Jambore Ranting Banjaran",
    year: "'23",
    image_url: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&h=600&fit=crop",
  },
  {
    slot_number: 2,
    caption: "Api Unggun Malam",
    year: "'23",
    image_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop",
  },
  {
    slot_number: 3,
    caption: "Upacara Bendera",
    year: "'24",
    image_url: "https://images.unsplash.com/photo-1482398650355-d4c6462afa0e?w=600&h=600&fit=crop",
  },
  {
    slot_number: 4,
    caption: "Area Tenda Peserta",
    year: "'24",
    image_url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=700&fit=crop",
  },
  {
    slot_number: 5,
    caption: "Jelajah Alam",
    year: "'24",
    image_url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop",
  },
  {
    slot_number: 6,
    caption: "Foto Bersama Kwarran",
    year: "'25",
    image_url: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=600&h=750&fit=crop",
  },
  {
    slot_number: 7,
    caption: "Senam Pagi Ceria",
    year: "'25",
    image_url: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=600&h=600&fit=crop",
  },
  {
    slot_number: 8,
    caption: "Pentas Seni Api Unggun",
    year: "'25",
    image_url: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&h=800&fit=crop",
  },
];

const ROTATIONS = [-2.5, 2, -1.5, 3, -2, 1.8, -2.2, 2.4];

function PolaroidCard({
  item,
  index,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}) {
  const rot = ROTATIONS[index % ROTATIONS.length]!;
  const tapeRot = index % 2 === 0 ? -3 : 3;
  return (
    <div
      className="group cursor-pointer"
      style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center" }}
      onClick={onClick}
    >
      <div className="relative bg-[#FFF8E1] rounded-[2px] p-3 pb-12 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.12)] group-hover:rotate-0 group-hover:scale-[1.03] group-hover:z-10">
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-amber-200/60 rounded-sm shadow-sm"
          style={{ transform: `translateX(-50%) rotate(${tapeRot}deg)` }}
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(0,0,0,0.04)_3px,rgba(0,0,0,0.04)_6px)]" />
        </div>
        <div className="aspect-square overflow-hidden bg-slate-100">
          <img
            src={item.image_url}
            alt={item.caption}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-3 pt-2 pb-3 flex items-end justify-between">
          <span
            className="font-bold text-brown text-[13px] leading-tight"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            {item.caption}
          </span>
          {item.year && (
            <span className="font-mono text-[11px] font-semibold text-slate-500">
              {item.year}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: GalleryItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
      >
        <X size={20} />
      </button>
      <button
        type="button"
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
      >
        <ChevronRight size={20} />
      </button>
      <div className="max-w-3xl w-full">
        <img src={item.image_url} alt={item.caption} className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
        <p className="mt-3 text-center text-white text-sm font-medium">
          {item.caption} {item.year && `· ${item.year}`}
        </p>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

export default function Gallery() {
  const reveal = useReveal<HTMLDivElement>(0.05);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicGallery().then((data) => {
      if (cancelled) return;
      if (data.length > 0) {
        setItems(data);
      } else {
        setItems(FALLBACK_GALLERY);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selItem = selected !== null ? items.find((g) => g.slot_number === selected) ?? null : null;
  const selIdx = selItem ? items.indexOf(selItem) : -1;

  function prev() {
    if (selIdx === -1) return;
    const n = (selIdx - 1 + items.length) % items.length;
    setSelected(items[n]!.slot_number);
  }
  function next() {
    if (selIdx === -1) return;
    const n = (selIdx + 1) % items.length;
    setSelected(items[n]!.slot_number);
  }

  return (
    <section id="galeri" className="relative py-16 md:py-24 bg-cream overflow-x-clip">
      <TopoPattern />
      <div
        ref={reveal.ref}
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal ${reveal.visible ? "is-visible" : ""}`}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-4">
            <Images size={16} />
            Galeri Kegiatan
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brown">Momen Seru di Lebak Barat</h2>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto text-sm md:text-base">
            Foto-foto kemah, jambore, api unggun, dan kebersamaan yang bikin kangen balik lagi.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-7 max-w-5xl mx-auto overflow-hidden py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[2px] bg-white/60 border-2 border-dashed border-amber-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-7 lg:gap-8 max-w-5xl mx-auto overflow-visible md:overflow-visible py-2 px-1">
            {items.map((item, i) => (
              <PolaroidCard key={item.slot_number} item={item} index={i} onClick={() => setSelected(item.slot_number)} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Klik foto untuk memperbesar · Geser kiri/kanan di lightbox
        </p>
      </div>

      {selItem && <Lightbox item={selItem} onClose={() => setSelected(null)} onPrev={prev} onNext={next} />}
    </section>
  );
}
