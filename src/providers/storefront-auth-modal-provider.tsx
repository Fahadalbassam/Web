"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/site/auth-modal";

type StorefrontAuthModalContextValue = {
  openLogin: (returnTo?: string) => void;
};

const StorefrontAuthModalContext = React.createContext<StorefrontAuthModalContextValue | null>(null);

export function StorefrontAuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const returnToRef = React.useRef<string | null>(null);

  const openLogin = React.useCallback((returnTo?: string) => {
    returnToRef.current = returnTo?.trim() || null;
    setOpen(true);
  }, []);

  const handleSuccess = React.useCallback(() => {
    const path = returnToRef.current;
    returnToRef.current = null;
    setOpen(false);
    if (path) {
      router.push(path);
    }
  }, [router]);

  const value = React.useMemo(() => ({ openLogin }), [openLogin]);

  return (
    <StorefrontAuthModalContext.Provider value={value}>
      {children}
      <AuthModal open={open} onOpenChange={setOpen} onLoginSuccess={handleSuccess} />
    </StorefrontAuthModalContext.Provider>
  );
}

export function useStorefrontAuthModal() {
  const ctx = React.useContext(StorefrontAuthModalContext);
  if (!ctx) {
    throw new Error("useStorefrontAuthModal must be used within StorefrontAuthModalProvider");
  }
  return ctx;
}
