import { useState, useEffect } from "react";

export function useAutoDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 18 || hour < 6;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark || isNight);
    };

    check();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => check();
    mq.addEventListener("change", onChange);
    const id = window.setInterval(check, 60_000);

    return () => {
      mq.removeEventListener("change", onChange);
      clearInterval(id);
    };
  }, []);

  return isDark;
}
