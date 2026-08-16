import { createContext, useContext } from "react";
import type { ThemeOverride } from "@/hooks/useAutoDarkMode";

type ThemeCtx = {
  isDark: boolean;
  override: ThemeOverride;
  setOverride: (v: ThemeOverride) => void;
};

export const LandingThemeContext = createContext<ThemeCtx>({
  isDark: false,
  override: "auto",
  setOverride: () => {},
});

export function useLandingTheme() {
  return useContext(LandingThemeContext);
}
