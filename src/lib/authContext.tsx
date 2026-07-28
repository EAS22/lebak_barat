import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  username: string;
  role: "super_admin" | "booking_admin" | string;
  displayName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const STORAGE_KEY = "buper_auth_user";

function readCache(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser & { cachedAt?: number };
    if (
      parsed.cachedAt &&
      Date.now() - parsed.cachedAt > 12 * 60 * 60 * 1000
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...user, cachedAt: Date.now() })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable — ignore
  }
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refresh: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readCache());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        writeCache(null);
        return null;
      }
      const data = (await res.json()) as AuthUser;
      setUser(data);
      writeCache(data);
      return data;
    } catch {
      return user;
    }
  }, [user]);

  useEffect(() => {
    const path = window.location.pathname;
    const isAdminRoute = path.startsWith("/admin");
    const hasCache = (() => {
      try {
        return !!localStorage.getItem(STORAGE_KEY);
      } catch {
        return false;
      }
    })();

    if (!isAdminRoute && !hasCache) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!mounted) return;
        if (res.ok) {
          const data = (await res.json()) as AuthUser;
          setUser(data);
          writeCache(data);
        } else {
          setUser(null);
          writeCache(null);
        }
      } catch {
        // network error: keep cached user (offline tolerance)
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((u: AuthUser) => {
    setUser(u);
    writeCache(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      writeCache(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
