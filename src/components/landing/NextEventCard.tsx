import { useState, useEffect } from "react";
import { CalendarClock, MapPin, Users, Tent, Sparkles, ArrowRight } from "lucide-react";
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
  const [next, setNext] = useState<(Unified & { _isOngoing?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcedVisible, setForcedVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForcedVisible(true), 700);
    return () => clearTimeout(t);
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

        console.log("[NextEventCard] thisYear", thisYear, "merged", mergedThisYear.length, "today", today.toISOString());

        const notEnded = mergedThisYear.filter((item) => {
          const end = parseOnly(item.end_date);
          return end >= today;
        });

        console.log("[NextEventCard] notEnded", notEnded.length);

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
            console.log("[NextEventCard] pick", pick);
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
        console.log("[NextEventCard] nextYear", nextYear, mergedNext.length);
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

  if (loading) {
    return (
      <div className="fixed bottom-6 left-6 z-[60] md:bottom-8 md:left-8 w-full max-w-[360px] rounded-2xl border-2 border-dashed border-amber-200/60 bg-white/60 p-4 animate-pulse backdrop-blur-xl">
        <div className="h-4 w-32 bg-slate-100 rounded mb-3" />
        <div className="h-5 w-48 bg-slate-100 rounded mb-2" />
        <div className="h-3 w-28 bg-slate-100 rounded" />
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
    ? "Sedang Berlangsung"
    : dUntil === 0
      ? "Hari ini"
      : dUntil === 1
        ? "Besok"
        : dUntil > 0
          ? `Dalam ${dUntil} hari`
          : `${Math.abs(dUntil)} hari lalu`;

  function handleClick() {
    document.querySelector("#kalender")?.scrollIntoView({ behavior: "smooth" });
  }

  const isVisible = reveal.visible || forcedVisible || !loading;

  return (
    <div
      ref={reveal.ref}
      className={`fixed bottom-6 left-6 z-[90] md:bottom-8 md:left-8 w-full max-w-[360px] reveal ${isVisible ? "is-visible" : ""}`}
      style={{ ["--delay" as string]: "0.2s" }}
    >
      <div
        onClick={handleClick}
        className="group relative cursor-pointer rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-dashed border-amber-300 p-4 pr-5 shadow-2xl hover:shadow-2xl hover:-translate-y-1 hover:rotate-[-1deg] hover:scale-105 transition-all duration-300 hover:border-emerald-300"
      >
        {/* Live dot + shimmer */}
        <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Next
        </div>

        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-amber-100/40 to-transparent transition-transform duration-700 ease-out" />
        </div>

        <div className="relative flex items-start gap-3">
          <div className="shrink-0">
            <div className="relative">
              <ScoutBadge
                icon={<Tent size={18} />}
                size={48}
                colorClass="text-emerald-700"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-sm">
                <Sparkles size={10} className="text-amber-500" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeClass}`}>
                {badgeText}
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                <CalendarClock size={10} />
                {countdownLabel}
              </span>
            </div>

            <h4 className="font-bold text-brown text-[15px] leading-tight truncate group-hover:text-emerald-700 transition-colors">
              {title}
            </h4>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
              {isEvent ? (
                <>
                  <MapPin size={11} className="shrink-0" />
                  {subtitle}
                </>
              ) : (
                <>
                  <Users size={11} className="shrink-0" />
                  {subtitle}
                </>
              )}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brown bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                {range}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Lihat
                <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>

        {/* Idle subtle glow */}
        <div className="absolute -bottom-3 left-6 right-6 h-6 bg-amber-200/30 blur-xl rounded-full -z-10 group-hover:bg-emerald-200/40 transition-colors duration-500" />
      </div>
    </div>
  );
}
