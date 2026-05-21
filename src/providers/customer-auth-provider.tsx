"use client";

import * as React from "react";
import { phpBrowserUrl } from "@/lib/php-backend";

export type StorefrontRole = "user" | "admin";

type CustomerAuthContextValue = {
  isLoggedIn: boolean;
    userId: string | null;
    role: StorefrontRole | null;
    userLabel: string;
    userEmail: string | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerAccount: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
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
  const [userId, setUserId] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<StorefrontRole | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch(phpBrowserUrl("auth/customer-me.php"), {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as {
        authenticated?: boolean;
        userId?: string;
        email?: string;
        role?: string;
      };
      if (data.authenticated === true && data.email) {
        setUserId(data.userId ? String(data.userId) : null);
        setEmail(String(data.email));
        const r = data.role === "admin" ? "admin" : "user";
        setRole(r);
      } else {
        setUserId(null);
        setEmail(null);
        setRole(null);
      }
    } catch {
      setUserId(null);
      setEmail(null);
      setRole(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
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
      window.dispatchEvent(new Event("gp-cart-refresh"));
      return { ok: true as const };
    },
    [refresh]
  );

  const registerAccount = React.useCallback(
    async (rawEmail: string, password: string) => {
      const res = await fetch(phpBrowserUrl("auth/register.php"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: rawEmail.trim(), password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        return { ok: false as const, error: body.error ?? "Could not register" };
      }
      await refresh();
      window.dispatchEvent(new Event("gp-cart-refresh"));
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
    }
    setUserId(null);
    setEmail(null);
    setRole(null);
    await refresh();
  }, [refresh]);

  const value = React.useMemo(
    () => ({
      isLoggedIn: Boolean(email),
      userId,
      role,
      userLabel: email ? labelFromEmail(email) : "Guest",
      userEmail: email,
      hydrated,
      refresh,
      loginWithCredentials,
      registerAccount,
      logout,
    }),
    [userId, email, role, hydrated, refresh, loginWithCredentials, registerAccount, logout]
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
