import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/authContext";
import { WaBookingProvider } from "@/components/landing/WaBookingModal";
import Landing from "@/pages/landing";
import VerificationPage from "@/pages/verification";
import AdminLogin from "@/pages/admin/login";
import { fetchPublicSettings, type PublicSettings } from "@/lib/api";

const DEFAULT_SETTINGS: PublicSettings = {
  landing_wa_number: "6280000000000",
  landing_wa_label: "Admin Booking",
  buper_name: "Bumi Perkemahan Lebak Barat",
};

function PublicRoutes() {
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <WaBookingProvider
      fallbackNumber={settings.landing_wa_number}
      fallbackLabel={settings.landing_wa_label}
    >
      <Routes>
        <Route path="/" element={<Landing sharedSettings={settings} />} />
        <Route path="/verifikasi" element={<VerificationPage sharedSettings={settings} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </WaBookingProvider>
  );
}
import AdminLayout from "@/pages/admin/layout";
import Dashboard from "@/pages/admin/dashboard";
import BookingsPage from "@/pages/admin/bookings";
import EventsPage from "@/pages/admin/events";
import UsersPage from "@/pages/admin/users";
import SettingsPage from "@/pages/admin/settings";
import FacilitiesPage from "@/pages/admin/facilities";
import GalleryAdminPage from "@/pages/admin/gallery";
import SuratPage from "@/pages/admin/surat";
import ArsipPage from "@/pages/admin/arsip";
import InvoicesPage from "@/pages/admin/invoices";
import { useOutletContext } from "react-router-dom";
import type { AdminOutletContext } from "@/pages/admin/layout";

function UsersRoute() {
  const { user } = useOutletContext<AdminOutletContext>();
  return <UsersPage currentUser={user} />;
}

function FacilitiesRoute() {
  const { user } = useOutletContext<AdminOutletContext>();
  return <FacilitiesPage currentUser={user} />;
}

function SettingsRoute() {
  const { user } = useOutletContext<AdminOutletContext>();
  return <SettingsPage currentUser={user} />;
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">404 — Halaman tidak ditemukan</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/*" element={<PublicRoutes />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="facilities" element={<FacilitiesRoute />} />
            <Route path="gallery" element={<GalleryAdminPage />} />
            <Route path="surat" element={<SuratPage />} />
            <Route path="arsip" element={<ArsipPage />} />
            <Route path="users" element={<UsersRoute />} />
            <Route path="settings" element={<SettingsRoute />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
