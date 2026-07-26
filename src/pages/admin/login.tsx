import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, LogIn, UserRound, KeyRound } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/authContext";
import CloudsSun from "@/components/landing/ornaments/CloudsSun";
import MountainDivider from "@/components/landing/ornaments/MountainDivider";
import PineDivider from "@/components/landing/ornaments/PineDivider";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading: authLoading, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/admin", { replace: true });
    }
  }, [authLoading, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        const msg = typeof data.error === "string" ? data.error : "Login gagal";
        setError(msg);
        toast.error(msg);
        return;
      }

      const userData = (await res.json()) as AuthUser;
      login(userData);
      toast.success("Login berhasil");
      navigate("/admin");
    } catch {
      setError("Terjadi kesalahan jaringan");
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50">
      <CloudsSun />

      {/* Back to landing */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/logo.png"
              alt="Logo Bumi Perkemahan Lebak Barat"
              className="h-24 w-auto drop-shadow-xl anim-floaty"
            />
            <h1 className="mt-4 text-2xl font-bold text-brown text-center">
              Selamat Datang Kembali!
            </h1>
            <p className="mt-1 text-sm text-slate-600 text-center">
              Masuk ke panel admin Buper Lebak Barat
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl border-2 border-dashed border-amber-300 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center anim-fade-slide">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-brown"
                >
                  Username
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="Masukkan username"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-brown"
                >
                  Password
                </label>
                <div className="relative">
                  <KeyRound
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Masuk...
                  </>
                ) : (
                  <>
                    <LogIn size={17} />
                    Masuk
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            Khusus admin Bumi Perkemahan Lebak Barat
          </p>
        </div>
      </div>

      {/* Bottom scenery */}
      <div className="relative z-10 pointer-events-none" aria-hidden="true">
        <div className="-mb-1">
          <PineDivider color="#A5D6A7" />
        </div>
        <MountainDivider colors={["#A5D6A7", "#66BB6A", "#2E7D32"]} className="-mt-8 md:-mt-12" />
      </div>
    </div>
  );
}
