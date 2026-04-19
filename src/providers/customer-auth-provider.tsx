"use client";

import * as React from "react";
import { phpBrowserUrl } from "@/lib/php-backend";

type CustomerAuthContextValue = {
  isLoggedIn: boolean;
  /** Display name for menu (email-based). */
  userLabel: string;
  /** Raw email when signed in (for menu subtitle). */
  userEmail: string | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = React.createContext<CustomerAuthContextValue | null>(null);

function labelFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  if (!local) return email;
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [email, setEmail] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch(phpBrowserUrl("auth/customer-me.php"), {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setEmail(null);
        return;
      }
      const data = (await res.json()) as { authenticated?: boolean; email?: string };
      if (data.authenticated === true && data.email) {
        setEmail(String(data.email));
      } else {
        setEmail(null);
      }
    } catch {
      setEmail(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const loginWithCredentials = React.useCallback(
    async (rawEmail: string, password: string) => {
      const res = await fetch(phpBrowserUrl("auth/customer-login.php"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: rawEmail.trim(), password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        return { ok: false as const, error: body.error ?? "Invalid credentials" };
      }
      await refresh();
      return { ok: true as const };
    },
    [refresh]
  );

  const logout = React.useCallback(async () => {
    try {
      await fetch(phpBrowserUrl("auth/customer-logout.php"), {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    setEmail(null);
    await refresh();
  }, [refresh]);

  const value = React.useMemo(
    () => ({
      isLoggedIn: Boolean(email),
      userLabel: email ? labelFromEmail(email) : "Guest",
      userEmail: email,
      hydrated,
      refresh,
      loginWithCredentials,
      logout,
    }),
    [email, hydrated, refresh, loginWithCredentials, logout]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = React.useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}
