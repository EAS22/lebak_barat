import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { X, MessageCircle, UserRound } from "lucide-react";
import { waLink } from "@/lib/utils";
import { fetchPublicContacts, type PublicContact } from "@/lib/api";
import CampfireFlame from "@/components/landing/ornaments/CampfireFlame";

interface WaBookingContextValue {
  openWaModal: (message?: string) => void;
  contacts: PublicContact[];
}

const WaBookingContext = createContext<WaBookingContextValue>({
  openWaModal: () => {},
  contacts: [],
});

export function useWaBooking() {
  return useContext(WaBookingContext);
}

const DEFAULT_MESSAGE =
  "Halo, saya ingin bertanya tentang booking Bumi Perkemahan Lebak Barat.";

export function WaBookingProvider({
  children,
  fallbackNumber,
  fallbackLabel,
}: {
  children: ReactNode;
  fallbackNumber: string;
  fallbackLabel: string;
}) {
  const [contacts, setContacts] = useState<PublicContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  useEffect(() => {
    fetchPublicContacts()
      .then(setContacts)
      .finally(() => setLoadingContacts(false));
  }, []);

  const openWaModal = useCallback(
    (msg?: string) => {
      setMessage(msg || DEFAULT_MESSAGE);
      setOpen(true);
    },
    [fallbackNumber, fallbackLabel]
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const displayList =
    contacts.length > 0
      ? contacts
      : fallbackNumber
        ? [{ display_name: fallbackLabel, wa_number: fallbackNumber }]
        : [];

  return (
    <WaBookingContext.Provider value={{ openWaModal, contacts }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih Admin Booking"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-dashed border-amber-300 p-6 anim-fade-slide">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-3">
              <CampfireFlame size={44} />
            </div>
            <h3 className="text-xl font-bold text-brown text-center">
              Pilih Admin Booking
            </h3>
            <p className="mt-1 text-sm text-slate-500 text-center">
              Chat langsung via WhatsApp dengan salah satu admin kami.
            </p>

            <div className="mt-5 space-y-3 max-h-72 overflow-y-auto pr-1">
              {loadingContacts ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : displayList.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-4">
                  Belum ada admin booking tersedia.
                </p>
              ) : (
                displayList.map((admin) => (
                  <a
                    key={admin.wa_number}
                    href={waLink(admin.wa_number, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 w-full p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-all hover:-translate-y-0.5 group"
                  >
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <UserRound size={20} />
                    </span>
                    <span className="flex-1 text-left">
                      <span className="block font-semibold text-brown text-sm">
                        {admin.display_name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        Admin Booking
                      </span>
                    </span>
                    <MessageCircle
                      size={20}
                      className="text-emerald-600 group-hover:scale-110 transition-transform"
                    />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </WaBookingContext.Provider>
  );
}
