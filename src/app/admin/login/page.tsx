"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/providers/admin-session-provider";

/**
 * Compatibility route: middleware normally sends guests to `/?login=1` and non-admins to `/`.
 * This page remains for bookmarks and edge cases (e.g. middleware disabled in dev).
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { refresh, isAdminAuthenticated, hydrated } = useAdminSession();

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (hydrated && isAdminAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [hydrated, isAdminAuthenticated, router]);

  return (
    <div className="flex flex-1 flex-col justify-center text-center text-sm text-muted-foreground">
      <p className="font-heading text-lg font-medium text-foreground">Staff sign-in</p>
      <p className="mt-3 max-w-sm self-center leading-relaxed">
        Gulf Parts Co uses one account for the storefront and admin. Use <span className="text-foreground">Sign in</span>{" "}
        in the site header, or open the login prompt directly.
      </p>
      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs">
        <Link href="/?login=1" className="text-primary underline underline-offset-4">
          Open storefront sign in
        </Link>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <Link href="/" className="text-foreground underline underline-offset-4">
          Home
        </Link>
      </p>
    </div>
  );
}
