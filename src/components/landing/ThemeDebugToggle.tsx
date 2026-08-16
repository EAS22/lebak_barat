import { useLandingTheme } from "@/components/landing/ThemeContext";
import { setThemeOverride, type ThemeOverride } from "@/hooks/useAutoDarkMode";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeDebugToggle() {
  const { isDark, override, setOverride } = useLandingTheme() as unknown as {
    isDark: boolean;
    override: ThemeOverride;
    setOverride: (v: ThemeOverride) => void;
  };

  if (!override && typeof override === "undefined") return null;

  const btnBase = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border transition-colors";

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] md:bottom-6 md:left-auto md:right-[88px] md:translate-x-0 flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
      <button
        className={`${btnBase} ${override === "light" ? "bg-white text-slate-900 border-white" : "bg-transparent text-white/60 border-transparent hover:text-white"}`}
        onClick={() => (setOverride ?? setThemeOverride)("light")}
        title="Paksa siang (light)"
      >
        <Sun size={12} /> Siang
      </button>
      <button
        className={`${btnBase} ${override === "dark" ? "bg-white text-slate-900 border-white" : "bg-transparent text-white/60 border-transparent hover:text-white"}`}
        onClick={() => (setOverride ?? setThemeOverride)("dark")}
        title="Paksa malam (dark)"
      >
        <Moon size={12} /> Malam
      </button>
      <button
        className={`${btnBase} ${override === "auto" ? "bg-white text-slate-900 border-white" : "bg-transparent text-white/60 border-transparent hover:text-white"}`}
        onClick={() => (setOverride ?? setThemeOverride)("auto")}
        title="Auto ikut jam device + OS"
      >
        <Monitor size={12} /> Auto
      </button>
      <span className="ml-1 text-[10px] text-white/50 hidden md:inline">
        {isDark ? "🌙 Dark" : "☀️ Light"} · {override}
      </span>
    </div>
  );
}
