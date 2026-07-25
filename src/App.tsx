import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "@/pages/landing";
import AdminLogin from "@/pages/admin/login";
import AdminLayout from "@/pages/admin/layout";
import Dashboard from "@/pages/admin/dashboard";
import BookingsPage from "@/pages/admin/bookings";
import UsersPage from "@/pages/admin/users";
import SettingsPage from "@/pages/admin/settings";
import { useOutletContext } from "react-router-dom";
import type { AdminOutletContext } from "@/pages/admin/layout";

function UsersRoute() {
  const { user } = useOutletContext<AdminOutletContext>();
  return <UsersPage currentUser={user} />;
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
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="users" element={<UsersRoute />} />
          <Route path="settings" element={<SettingsRoute />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
