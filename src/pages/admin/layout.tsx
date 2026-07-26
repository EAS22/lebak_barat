import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Users, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth, type AuthUser } from "@/lib/authContext";

export type { AuthUser };
export type AdminOutletContext = { user: AuthUser };

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays, end: false },
  { to: "/admin/users", label: "Users", icon: Users, end: false, superOnly: true },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false, superOnly: true },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [loading, user, navigate]);

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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="font-semibold text-emerald-700">Buper Admin</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="text-xs text-gray-500 mb-2 px-3">
            {user.username} ({user.role})
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center h-16 px-4 border-b bg-white lg:px-6">
          <button className="lg:hidden mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Panel Admin</h1>
        </header>

        <main className="flex-1 p-4 lg:p-6 bg-gray-50">
          <Outlet context={{ user } satisfies AdminOutletContext} />
        </main>
      </div>
    </div>
  );
}
