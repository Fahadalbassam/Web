"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession } from "@/providers/admin-session-provider";

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, hydrated } = useAdminSession();

  React.useEffect(() => {
    if (!hydrated || pathname === "/admin/login") return;
    if (!isAdminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [hydrated, isAdminAuthenticated, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
