"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { phpBrowserUrl } from "@/lib/php-backend";
import { useAdminSession } from "@/providers/admin-session-provider";

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, hydrated } = useAdminSession();
  const redirectOnceRef = React.useRef(false);

  React.useEffect(() => {
    if (!hydrated || pathname === "/admin/login") {
      return;
    }
    if (isAdminAuthenticated) {
      redirectOnceRef.current = false;
      return;
    }
    if (redirectOnceRef.current) {
      return;
    }
    redirectOnceRef.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(phpBrowserUrl("auth/customer-me.php"), {
          credentials: "include",
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as { authenticated?: boolean };
        if (cancelled) return;
        const dest = data.authenticated === true ? "/" : "/?login=1";
        router.replace(dest);
      } catch {
        if (!cancelled) router.replace("/?login=1");
      }
    })();
    return () => {
      cancelled = true;
    };
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
