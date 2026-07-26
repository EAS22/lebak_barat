import { useState, useEffect } from "react";
import { fetchPublicSettings, type PublicSettings } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import CalendarStatus from "@/components/landing/CalendarStatus";
import Facilities from "@/components/landing/Facilities";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import PineDivider from "@/components/landing/ornaments/PineDivider";
import MountainDivider from "@/components/landing/ornaments/MountainDivider";
import { WaBookingProvider } from "@/components/landing/WaBookingModal";

const DEFAULT_SETTINGS: PublicSettings = {
  landing_wa_number: "6280000000000",
  landing_wa_label: "Admin Booking",
  buper_name: "Bumi Perkemahan Lebak Barat",
};

export default function Landing() {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchPublicSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (settings.buper_name) {
      document.title = settings.buper_name;
    }
  }, [settings.buper_name]);

  return (
    <WaBookingProvider
      fallbackNumber={settings.landing_wa_number}
      fallbackLabel={settings.landing_wa_label}
    >
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar buperName={settings.buper_name} />
        <Hero />
        <About />
        <div className="bg-cream">
          <PineDivider color="#ffffff" />
        </div>
        <CalendarStatus />
        <div className="bg-white">
          <MountainDivider colors={["#FFECB3", "#FFE082", "#FFF8E1"]} />
        </div>
        <Facilities />
        <div className="bg-cream">
          <PineDivider color="#ffffff" />
        </div>
        <Contact />
        <div className="bg-white">
          <PineDivider color="#14301c" />
        </div>
        <Footer buperName={settings.buper_name} />
      </div>
    </WaBookingProvider>
  );
}
