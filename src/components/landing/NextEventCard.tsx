import { useState, useEffect } from "react";
import { CalendarClock, MapPin, Users, Tent, Sparkles, ArrowRight, X } from "lucide-react";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  fetchPublicYearBookings,
  fetchPublicEventsByYear,
  type PublicYearBooking,
  type PublicEvent,
} from "@/lib/api";
import { useReveal } from "@/hooks/useReveal";
import ScoutBadge from "@/components/landing/ornaments/ScoutBadge";
import { useLandingTheme } from "@/components/landing/ThemeContext";

type Unified = (PublicYearBooking & { _kind: "booking" }) | (PublicEvent & { _kind: "event" });

function parseOnly(s: string): Date {
  return new Date(s.slice(0, 10) + "T00:00:00");
}

function daysUntil(dateStr: string): number {
  const today = startOfDay(new Date());
  const target = startOfDay(parseOnly(dateStr));
  return differenceInCalendarDays(target, today);
}

function fmtRange(startStr: string, endStr: string): string {
  const s = parseOnly(startStr);
  const e = parseOnly(endStr);
  if (s.getMonth() === e.getMonth()) {
    return `${format(s, "d")}–${format(e, "d MMMM", { locale: localeId })}`;
  }
  return `${format(s, "d MMM", { locale: localeId })} – ${format(e, "d MMM", { locale: localeId })}`;
}

export default function NextEventCard() {
  const reveal = useReveal<HTMLDivElement>(0.05);
  const { isDark } = useLandingTheme();
  const [next, setNext] = useState<(Unified & { _isOngoing?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcedVisible, setForcedVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForcedVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onOpen = () => setShareOpen(true);
    const onClose = () => setShareOpen(false);
    window.addEventListener("sharefloat:open", onOpen);
    window.addEventListener("sharefloat:close", onClose);
    return () => {
      window.removeEventListener("sharefloat:open", onOpen);
      window.removeEventListener("sharefloat:close", onClose);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const today = startOfDay(new Date());
    const thisYear = today.getFullYear();

    async function loadYear(y: number): Promise<Unified[]> {
      try {
        const [bookings, events] = await Promise.all([
          fetchPublicYearBookings(y),
          fetchPublicEventsByYear(y),
        ]);
        const merged: Unified[] = [
          ...bookings.map((b) => ({ ...b, _kind: "booking" as const })),
          ...events.map((e) => ({ ...e, _kind: "event" as const })),
        ];
        return merged.sort(
          (a, b) => parseOnly(a.start_date).getTime() - parseOnly(b.start_date).getTime()
        );
      } catch (err) {
        console.error("[NextEventCard] loadYear failed", y, err);
        return [];
      }
    }

    async function findNext() {
      try {
        const mergedThisYear = await loadYear(thisYear);
        if (cancelled) return;
        const notEnded = mergedThisYear.filter((item) => {
          const end = parseOnly(item.end_date);
          return end >= today;
        });
        if (notEnded.length > 0) {
          const upcoming = notEnded.filter((it) => parseOnly(it.start_date) >= today);
          const rawPick = (upcoming[0] ?? notEnded[0]) as Unified & {
            _isOngoing?: boolean;
          };
          if (rawPick) {
            const pick = { ...rawPick } as Unified & { _isOngoing?: boolean };
            if (parseOnly(pick.start_date) < today) {
              pick._isOngoing = true;
            }
            setNext(pick);
          } else {
            setNext(null);
          }
          setLoading(false);
          return;
        }
        const nextYear = thisYear + 1;
        const mergedNext = await loadYear(nextYear);
        if (cancelled) return;
        if (mergedNext.length === 0) {
          setNext(null);
          setLoading(false);
          return;
        }
        const upcomingNext = mergedNext.filter((it) => parseOnly(it.start_date) >= today);
        const finalPick = (upcomingNext[0] ?? mergedNext[0]) as Unified & {
          _isOngoing?: boolean;
        };
        if (finalPick && parseOnly(finalPick.start_date) < today) {
          (finalPick as Unified & { _isOngoing?: boolean })._isOngoing = true;
        }
        setNext(finalPick ?? null);
        setLoading(false);
      } catch (e) {
        console.error("[NextEventCard] failed", e);
        if (!cancelled) setLoading(false);
      }
    }

    findNext();
    return () => {
      cancelled = true;
    };
  }, []);

  if (shareOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-[90] md:bottom-6 md:left-6 opacity-0 pointer-events-none transition-opacity duration-200">
        <div className="w-11 h-11" />
      </div>
    );
  }

  if (dismissed) {
    return (
      <div className="fixed bottom-4 left-4 z-[90] md:bottom-6 md:left-6">
        <button
          onClick={() => setDismissed(false)}
          className={`group relative w-11 h-11 md:w-10 md:h-10 rounded-full border-2 border-dashed shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ${isDark ? "bg-[#132a1a] border-emerald-800 hover:border-emerald-600" : "bg-white border-amber-300 hover:border-emerald-300"}`}
          aria-label="Tampilkan jadwal selanjutnya"
        >
          <Tent size={18} className={`${isDark ? "text-emerald-300" : "text-emerald-700"} group-hover:rotate-6 transition-transform`} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600 border-2 border-white" />
          </span>
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`fixed bottom-4 left-4 z-[60] md:bottom-6 md:left-6 w-[calc(100vw-32px)] max-w-[280px] md:max-w-[300px] rounded-xl border-2 border-dashed p-3 animate-pulse backdrop-blur-xl ${isDark ? "border-emerald-800/60 bg-[#132a1a]/70" : "border-amber-200/60 bg-white/70"}`}>
        <div className={`h-3 w-20 rounded mb-2 ${isDark ? "bg-emerald-900/50" : "bg-slate-100"}`} />
        <div className={`h-4 w-36 rounded mb-1.5 ${isDark ? "bg-emerald-900/50" : "bg-slate-100"}`} />
        <div className={`h-2.5 w-24 rounded ${isDark ? "bg-emerald-900/50" : "bg-slate-100"}`} />
      </div>
    );
  }

  if (!next) return null;

  const isEvent = next._kind === "event";
  const isOngoing = (next as Unified & { _isOngoing?: boolean })._isOngoing === true;
  const start = next.start_date;
  const dUntil = daysUntil(start);
  const range = fmtRange(next.start_date, next.end_date);

  const title = isEvent ? (next as PublicEvent).event_name : (next as PublicYearBooking).school_name;
  const subtitle = isEvent
    ? (next as PublicEvent).institution
    : `${(next as PublicYearBooking).status === "final" ? "Final" : "Negosiasi"} • Booking`;

  const badgeText = isEvent ? "Event" : (next as PublicYearBooking).status === "final" ? "Final" : "Negosiasi";
  const badgeClass = isEvent
    ? "bg-blue-900 text-white"
    : (next as PublicYearBooking).status === "final"
      ? "bg-red-500 text-white"
      : "bg-amber-400 text-brown";

  const countdownLabel = isOngoing
    ? "Berlangsung"
    : dUntil === 0
      ? "Hari ini"
      : dUntil === 1
        ? "Besok"
        : dUntil > 0
          ? `${dUntil}hr lagi`
          : `${Math.abs(dUntil)}hr lalu`;

  function handleClick() {
    document.querySelector("#kalender")?.scrollIntoView({ behavior: "smooth" });
  }

  const isVisible = reveal.visible || forcedVisible || !loading;

  return (
    <div
      ref={reveal.ref}
      className={`fixed bottom-4 left-4 z-[90] md:bottom-6 md:left-6 w-[calc(100vw-32px)] max-w-[280px] md:max-w-[300px] reveal ${isVisible ? "is-visible" : ""}`}
      style={{ ["--delay" as string]: "0.2s" }}
    >
      <div
        onClick={handleClick}
        className={`group relative cursor-pointer rounded-xl backdrop-blur-xl border-2 border-dashed p-3 pr-3 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 hover:rotate-[-0.5deg] transition-all duration-300 ${isDark ? "bg-[#132a1a]/95 border-emerald-800 hover:border-emerald-600" : "bg-white/95 border-amber-300 hover:border-emerald-300"}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border shadow-md flex items-center justify-center transition-colors z-10 ${isDark ? "bg-[#1e3a2a] border-emerald-800 text-emerald-300 hover:text-emerald-100 hover:bg-[#14301c]" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
          aria-label="Sembunyikan"
        >
          <X size={12} />
        </button>

        <div className="absolute -top-2 -left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wide shadow-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          Next
        </div>

        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent transition-transform duration-700 ease-out" />
        </div>

        <div className="relative flex items-start gap-2.5">
          <div className="shrink-0">
            <div className="relative">
              <ScoutBadge icon={<Tent size={14} />} size={36} colorClass="text-emerald-700" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-amber-300 flex items-center justify-center shadow-sm">
                <Sparkles size={8} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5 flex-wrap">
              <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${badgeClass}`}>
                {badgeText}
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <CalendarClock size={10} />
                {countdownLabel}
              </span>
            </div>

            <h4 className={`font-bold text-[12.5px] leading-tight truncate transition-colors ${isDark ? "text-emerald-100 group-hover:text-emerald-200" : "text-brown group-hover:text-emerald-700"}`}>
              {title}
            </h4>
            <p className={`text-[11px] truncate flex items-center gap-1 mt-0.5 ${isDark ? "text-emerald-200/60" : "text-slate-500"}`}>
              {isEvent ? (
                <>
                  <MapPin size={10} className="shrink-0" />
                  {subtitle}
                </>
              ) : (
                <>
                  <Users size={10} className="shrink-0" />
                  {subtitle}
                </>
              )}
            </p>

            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${isDark ? "text-amber-200 bg-amber-900/40 border border-amber-800" : "text-brown bg-amber-50 border border-amber-200"}`}>
                {range}
              </span>
              <span className={`ml-auto hidden md:inline-flex items-center gap-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                Lihat
                <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-2 left-4 right-4 h-4 bg-amber-200/20 blur-lg rounded-full -z-10 group-hover:bg-emerald-200/30 transition-colors duration-500" />
      </div>
    </div>
  );
}
