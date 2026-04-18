"use client";

import * as React from "react";
import { CustomerAuthProvider } from "@/providers/customer-auth-provider";
import { CartProvider } from "@/providers/cart-provider";

export function CustomerProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>{children}</CartProvider>
    </CustomerAuthProvider>
  );
}
