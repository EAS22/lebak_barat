import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/landing";
import AdminLogin from "@/pages/admin/login";
import AdminLayout from "@/pages/admin/layout";
import Dashboard from "@/pages/admin/dashboard";
import BookingsPage from "@/pages/admin/bookings";

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="users" element={<div>Users placeholder</div>} />
          <Route path="settings" element={<div>Settings placeholder</div>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
