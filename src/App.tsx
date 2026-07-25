import { BrowserRouter, Routes, Route } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Bumi Perkemahan Lebak Barat
        </h1>
        <p className="text-gray-600">Segera hadir — booking online &amp; fasilitas lengkap.</p>
      </div>
    </div>
  );
}

function Admin() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
    </div>
  );
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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
