import { useEffect } from "react";
import type { PublicSettings } from "@/lib/api";
import { useAutoDarkMode } from "@/hooks/useAutoDarkMode";
import { LandingThemeContext } from "@/components/landing/ThemeContext";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import History from "@/components/landing/History";
import CalendarStatus from "@/components/landing/CalendarStatus";
import Facilities from "@/components/landing/Facilities";
import Gallery from "@/components/landing/Gallery";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import PineDivider from "@/components/landing/ornaments/PineDivider";
import MountainDivider from "@/components/landing/ornaments/MountainDivider";
import NextEventCard from "@/components/landing/NextEventCard";
import ShareFloat from "@/components/landing/ShareFloat";

const DEFAULT_SETTINGS: PublicSettings = {
  landing_wa_number: "6280000000000",
  landing_wa_label: "Admin Booking",
  buper_name: "Bumi Perkemahan Lebak Barat",
};

export default function Landing({
  sharedSettings,
}: {
  sharedSettings?: PublicSettings;
}) {
  const settings = sharedSettings ?? DEFAULT_SETTINGS;
  const isDark = useAutoDarkMode();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace(/^#/, "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo(0, 0);
        }
      }, 80);
    } else {
      const hasNavigatedHash = sessionStorage.getItem("scrollToHash");
      if (hasNavigatedHash) {
        sessionStorage.removeItem("scrollToHash");
        setTimeout(() => {
          const el = document.getElementById(hasNavigatedHash);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 120);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, []);

  useEffect(() => {
    if (settings.buper_name) {
      document.title = settings.buper_name;
    }
  }, [settings.buper_name]);

  const creamBg = isDark ? "bg-[#0e1a12]" : "bg-cream";
  const whiteBg = isDark ? "bg-[#0a1210]" : "bg-white";

  return (
    <LandingThemeContext.Provider value={{ isDark }}>
      <div
        className={`min-h-screen overflow-x-clip max-w-[100vw] transition-colors duration-700 ${isDark ? "bg-[#080e0a] text-emerald-100" : "bg-white text-slate-900"}`}
      >
        <Navbar buperName={settings.buper_name} />
        <Hero />
        <div className={creamBg}>
          <PineDivider color={isDark ? "#0a1210" : "#ffffff"} />
        </div>
        <div className={whiteBg}>
          <MountainDivider
            colors={
              isDark
                ? ["#1a3a26", "#14301c", "#0e1a12"]
                : ["#A5D6A7", "#66BB6A", "#FFF8E1"]
            }
          />
        </div>
        <About />
        <div className={creamBg}>
          <PineDivider color={isDark ? "#0a1210" : "#ffffff"} />
        </div>
        <div className={whiteBg}>
          <MountainDivider
            colors={
              isDark
                ? ["#1e4a2e", "#1a3a26", "#0e1a12"]
                : ["#FFECB3", "#FFE082", "#FFF8E1"]
            }
          />
        </div>
        <History />
        <div className={creamBg}>
          <PineDivider color={isDark ? "#0a1210" : "#ffffff"} />
        </div>
        <CalendarStatus />
        <div className={whiteBg}>
          <MountainDivider
            colors={
              isDark
                ? ["#1a3a26", "#14301c", "#0a1210"]
                : ["#FFECB3", "#FFE082", "#FFF8E1"]
            }
          />
        </div>
        <Facilities />
        <div className={whiteBg}>
          <MountainDivider
            colors={
              isDark
                ? ["#1e4a2e", "#14301c", "#121a0f"]
                : ["#FFECB3", "#FFE082", "#FFF8E1"]
            }
          />
        </div>
        <Gallery />
        <div className={creamBg}>
          <PineDivider color={isDark ? "#0a1210" : "#ffffff"} />
        </div>
        <Contact />
        <div className="bg-white">
          <PineDivider color="#14301c" />
        </div>
        <Footer buperName={settings.buper_name} />
        <NextEventCard />
        <ShareFloat />
      </div>
    </LandingThemeContext.Provider>
  );
}
