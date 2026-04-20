"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { phpBrowserUrl } from "@/lib/php-backend";

type AdminSessionContextValue = {
  isAdminAuthenticated: boolean;
  hydrated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AdminSessionContext = React.createContext<AdminSessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = React.useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch(phpBrowserUrl("auth/me.php"), {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as { authenticated?: boolean };
      // me.php returns 200 + { authenticated } for both guest and signed-in admin.
      if (!res.ok) {
        setIsAdminAuthenticated(false);
        return;
      }
      setIsAdminAuthenticated(data.authenticated === true);
    } catch {
      setIsAdminAuthenticated(false);
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!pathname.startsWith("/admin")) {
      return;
    }
    void refresh();
  }, [pathname, refresh]);

  const logout = React.useCallback(async () => {
    try {
      await fetch(phpBrowserUrl("auth/logout.php"), {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    setIsAdminAuthenticated(false);
    void refresh();
  }, [refresh]);

  const value = React.useMemo(
    () => ({
      isAdminAuthenticated,
      hydrated,
      refresh,
      logout,
    }),
    [isAdminAuthenticated, hydrated, refresh, logout]
  );

  return (
    <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const ctx = React.useContext(AdminSessionContext);
  if (!ctx) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return ctx;
}
