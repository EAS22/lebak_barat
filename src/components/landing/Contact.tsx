import { MapPin, Clock, MessageCircle, Mail } from "lucide-react";
import { waLink } from "@/lib/utils";

interface ContactProps {
  waNumber: string;
  waLabel: string;
}

export default function Contact({ waNumber, waLabel }: ContactProps) {
  const mapUrl =
    "https://maps.google.com/?q=Desa+Girimulya+Banjaran+Majalengka";

  return (
    <section id="kontak" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Kontak & Lokasi
          </h2>
          <p className="mt-3 text-slate-600">
            Hubungi kami untuk informasi lebih lanjut.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <a
            href={waLink(
              waNumber,
              `Halo ${waLabel}, saya ingin bertanya tentang booking Bumi Perkemahan Lebak Barat.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle size={20} />
            Hubungi via WhatsApp
          </a>

          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Alamat</p>
                <p className="text-sm text-slate-600">
                  Desa Girimulya, Kecamatan Banjaran, Kabupaten Majalengka,
                  Jawa Barat
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
                  <p>
                    <span className="font-medium">Developer:</span>{" "}
                    <a href="mailto:dev.lebakbarat@girimulya.com" className="text-emerald-600 hover:text-emerald-700">
                      dev.lebakbarat@girimulya.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={mapUrl}
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
