import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Tent,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, type AuthUser } from "@/lib/authContext";

export type { AuthUser };
export type AdminOutletContext = { user: AuthUser };

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, superOnly: false },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays, end: false, superOnly: false },
  { to: "/admin/facilities", label: "Fasilitas", icon: Tent, end: false, superOnly: true },
  { to: "/admin/users", label: "Users", icon: Users, end: false, superOnly: true },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false, superOnly: true },
];

const COLLAPSE_KEY = "buper_sidebar_collapsed";

function roleLabel(role: string): string {
  return role === "super_admin" ? "Super Admin" : "Admin Booking";
}

function initialsOf(user: AuthUser): string {
  const name = (user as { displayName?: string }).displayName ?? user.username;
  return name.slice(0, 2).toUpperCase();
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [loading, user, navigate]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // storage unavailable — ignore
      }
      return next;
    });
  }

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const filteredNav = navItems.filter(
    (item) => !item.superOnly || user.role === "super_admin"
  );

  const displayName = (user as { displayName?: string }).displayName ?? user.username;
  const initials = initialsOf(user);

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:z-auto",
          "bg-gradient-to-b from-[#14301c] to-[#1b3a24] text-emerald-100",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-64 lg:w-[68px]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 border-b border-white/10 shrink-0",
            collapsed ? "lg:justify-center lg:px-0 px-4 justify-between" : "px-4 justify-between"
          )}
        >
          <div className={cn("flex items-center gap-2.5 min-w-0", collapsed && "lg:hidden")}>
            <img src="/images/logo.png" alt="Logo" className="h-9 w-auto shrink-0" />
            <span className="font-semibold text-white truncate">Buper Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
              className="hidden lg:inline-flex p-1.5 rounded-md text-emerald-200/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <button
              className="lg:hidden text-emerald-200/70 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "lg:justify-center lg:px-0",
                  isActive
                    ? "bg-emerald-500/20 text-white"
                    : "text-emerald-200/70 hover:bg-white/5 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-emerald-400" />
                  )}
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn("p-3 border-t border-white/10", collapsed && "lg:px-2")}>
          <div
            className={cn(
              "flex items-center gap-3 px-2 py-2 mb-1",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">
              {initials}
            </div>
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-emerald-300/70">{roleLabel(user.role)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between h-16 px-4 border-b bg-white lg:px-6">
          <div className="flex items-center">
            <button className="lg:hidden mr-3" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Panel Admin</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700">{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 bg-slate-50/80">
          <Outlet context={{ user } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
}
