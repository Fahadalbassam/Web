"use client";

import Link from "next/link";
import { useCustomerAuth } from "@/providers/customer-auth-provider";

export function FooterStaffNote() {
  const { isLoggedIn, hydrated } = useCustomerAuth();

  if (hydrated && isLoggedIn) {
    return (
      <span className="text-muted-foreground/80">
        Staff use the same account as customers — open Admin from the account menu when your role is admin.
      </span>
    );
  }

  return (
    <span className="text-muted-foreground/80">
      Staff use the same account as customers — sign in from the header, then open Admin from the account menu when
      your role is admin (
      <Link href="/?login=1" className="text-foreground hover:underline">
        open sign in
      </Link>
      ).
    </span>
  );
}
