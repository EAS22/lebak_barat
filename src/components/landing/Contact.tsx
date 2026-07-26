import { MapPin, Clock, MessageCircle, Mail } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { useWaBooking } from "@/components/landing/WaBookingModal";
import CampfireFlame from "@/components/landing/ornaments/CampfireFlame";

const MAP_URL = "https://maps.app.goo.gl/K9xTHjgc4boF3YQu5";
const MAP_COORDS = "-6.943210, 108.325651";

export default function Contact() {
  const card = useReveal<HTMLDivElement>();
  const { openWaModal } = useWaBooking();

  return (
    <section id="kontak" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown">
            Kontak & Lokasi
          </h2>
          <p className="mt-3 text-slate-600">
            Hubungi admin booking kami untuk informasi lebih lanjut.
          </p>
        </div>

        <div
          ref={card.ref}
          className={`max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center reveal ${
            card.visible ? "is-visible" : ""
          }`}
        >
          <div className="flex justify-center mb-4">
            <CampfireFlame size={56} />
          </div>

          <button
            type="button"
            onClick={() =>
              openWaModal(
                "Halo, saya ingin bertanya tentang booking Bumi Perkemahan Lebak Barat."
              )
            }
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors anim-pulse-soft"
          >
            <MessageCircle size={20} />
            Hubungi via WhatsApp
          </button>

          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Alamat</p>
                <p className="text-sm text-slate-600">
                  Desa Girimulya, Kecamatan Banjaran, Kabupaten Majalengka,
                  Jawa Barat
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Koordinat: {MAP_COORDS}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Jam Operasional</p>
                <p className="text-sm text-slate-600">
                  Setiap hari, 08.00 – 17.00 WIB
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Email</p>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    <span className="font-medium">Umum:</span>{" "}
                    <a href="mailto:lebakbarat@girimulya.com" className="text-emerald-600 hover:text-emerald-700">
                      lebakbarat@girimulya.com
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Booking:</span>{" "}
                    <a href="mailto:booking.lebakbarat@girimulya.com" className="text-emerald-600 hover:text-emerald-700">
                      booking.lebakbarat@girimulya.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <MapPin size={16} />
            Buka di Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
