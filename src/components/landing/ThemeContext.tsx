import { createContext, useContext } from "react";

export const LandingThemeContext = createContext<{ isDark: boolean }>({ isDark: false });

export function useLandingTheme() {
  return useContext(LandingThemeContext);
}
