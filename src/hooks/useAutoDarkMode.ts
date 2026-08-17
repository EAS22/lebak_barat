import { useState, useEffect, useCallback } from "react";

export type ThemeOverride = "auto" | "light" | "dark";
const LS_KEY = "__buper_theme_override__";

function readOverride(): ThemeOverride {
  try {
    const ls = localStorage.getItem(LS_KEY) as ThemeOverride | null;
    if (ls === "light" || ls === "dark" || ls === "auto") return ls;
  } catch {}
  try {
    const u = new URL(window.location.href);
    const q = u.searchParams.get("theme") as ThemeOverride | null;
    if (q === "light" || q === "dark" || q === "auto") return q;
  } catch {}
  return "auto";
}

function computeDark(override: ThemeOverride): boolean {
  if (override === "light") return false;
  if (override === "dark") return true;
  const h = new Date().getHours();
  const isNight = h >= 18 || h < 6;
  return isNight;
}

export function useAutoDarkMode() {
  const [override, setOverrideRaw] = useState<ThemeOverride>(() => readOverride());
  const [isDark, setIsDark] = useState(() => computeDark(readOverride()));

  const refresh = useCallback(() => {
    const ov = readOverride();
    setOverrideRaw(ov);
    setIsDark(computeDark(ov));
  }, []);

  useEffect(() => {
    refresh();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => { if (readOverride() === "auto") refresh(); };
    mq.addEventListener("change", onMq);
    const iv = setInterval(() => { if (readOverride() === "auto") refresh(); }, 60_000);
    const onStorage = (e: StorageEvent) => { if (e.key === LS_KEY) refresh(); };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("__buper_theme_change__" as never, onCustom as never);
    return () => {
      mq.removeEventListener("change", onMq);
      clearInterval(iv);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("__buper_theme_change__" as never, onCustom as never);
    };
  }, [refresh]);

  const setOverride = useCallback((v: ThemeOverride) => {
    try {
      if (v === "auto") localStorage.removeItem(LS_KEY);
      else localStorage.setItem(LS_KEY, v);
    } catch {}
    try { window.dispatchEvent(new CustomEvent("__buper_theme_change__")); } catch {}
  }, []);

  return { isDark, override, setOverride, refresh };
}

export function setThemeOverride(v: ThemeOverride) {
  try {
    if (v === "auto") localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, v);
  } catch {}
  try { window.dispatchEvent(new CustomEvent("__buper_theme_change__")); } catch {}
}
