"use client";

import * as React from "react";

const STORAGE_KEY = "gulfparts-admin-demo";

type AdminSessionContextValue = {
  /** True after successful mock admin sign-in (persists in localStorage). */
  isAdminAuthenticated: boolean;
  /** Hydration complete — read storage safely for links. */
  hydrated: boolean;
  login: () => void;
  logout: () => void;
};

const AdminSessionContext = React.createContext<AdminSessionContextValue | null>(
  null
);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = React.useState(false);

  React.useEffect(() => {
    try {
      setIsAdminAuthenticated(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setIsAdminAuthenticated(false);
    }
    setHydrated(true);
  }, []);

  const login = React.useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setIsAdminAuthenticated(true);
  }, []);

  const logout = React.useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setIsAdminAuthenticated(false);
  }, []);

  const value = React.useMemo(
    () => ({
      isAdminAuthenticated,
      hydrated,
      login,
      logout,
    }),
    [isAdminAuthenticated, hydrated, login, logout]
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const ctx = React.useContext(AdminSessionContext);
  if (!ctx) {
    throw new Error("useAdminSession must be used within AdminSessionProvider");
  }
  return ctx;
}
