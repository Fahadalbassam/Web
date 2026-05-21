"use client";

import * as React from "react";
import { Suspense } from "react";
import { CustomerAuthProvider } from "@/providers/customer-auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import { StorefrontAuthModalProvider } from "@/providers/storefront-auth-modal-provider";
import { StorefrontAuthDeepLinkOpener } from "@/components/site/storefront-auth-deeplink-opener";
import { TooltipProvider } from "@/components/ui/tooltip";

export function CustomerProviders({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <StorefrontAuthModalProvider>
          <TooltipProvider delayDuration={0}>
            <Suspense fallback={null}>
              <StorefrontAuthDeepLinkOpener />
            </Suspense>
            {children}
          </TooltipProvider>
        </StorefrontAuthModalProvider>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
