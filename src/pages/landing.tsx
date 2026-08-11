import { useEffect } from "react";
import type { PublicSettings } from "@/lib/api";
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

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-clip max-w-[100vw]">
      <Navbar buperName={settings.buper_name} />
      <Hero />
      <About />
      <div className="bg-cream">
        <PineDivider color="#ffffff" />
      </div>
      <div className="bg-white">
        <MountainDivider colors={["#FFECB3", "#FFE082", "#FFF8E1"]} />
      </div>
      <History />
      <div className="bg-cream">
        <PineDivider color="#ffffff" />
      </div>
      <CalendarStatus />
      <div className="bg-white">
        <MountainDivider colors={["#FFECB3", "#FFE082", "#FFF8E1"]} />
      </div>
      <Facilities />
      <div className="bg-white">
        <MountainDivider colors={["#FFECB3", "#FFE082", "#FFF8E1"]} />
      </div>
      <Gallery />
      <div className="bg-cream">
        <PineDivider color="#ffffff" />
      </div>
      <Contact />
      <div className="bg-white">
        <PineDivider color="#14301c" />
      </div>
      <Footer buperName={settings.buper_name} />
      <NextEventCard />
      <ShareFloat />
    </div>
  );
}
