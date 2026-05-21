"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStorefrontAuthModal } from "@/providers/storefront-auth-modal-provider";

export function StorefrontAuthDeepLinkOpener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openLogin } = useStorefrontAuthModal();

  React.useEffect(() => {
    if (searchParams.get("login") !== "1") {
      return;
    }
    openLogin();
    const next = new URLSearchParams(searchParams.toString());
    next.delete("login");
    const qs = next.toString();
    const base = pathname || "/";
    router.replace(qs ? `${base}?${qs}` : base, { scroll: false });
  }, [searchParams, router, pathname, openLogin]);

  return null;
}
