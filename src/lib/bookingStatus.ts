export type BookingStatus = "final" | "negosiasi" | "batal";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  final: "Final",
  negosiasi: "Negosiasi",
  batal: "Batal",
};

export const STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  final: "bg-emerald-100 text-emerald-700 border-emerald-200",
  negosiasi: "bg-amber-100 text-amber-700 border-amber-200",
  batal: "bg-slate-100 text-slate-500 border-slate-200",
};
