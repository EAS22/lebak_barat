import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatIDR(n?: number | null) {
  if (n == null) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function dateOnly(s: string): string {
  return s.slice(0, 10);
}

export function parseDateOnly(s: string): Date {
  return new Date(s.slice(0, 10) + "T00:00:00");
}

export function waLink(num: string, text: string) {
  const clean = num.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export function formatDateWIB(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

export function formatDateTimeWIB(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(d);
}
