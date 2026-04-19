"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { MobileNav } from "@/components/site/mobile-nav";
import { UserMenu } from "@/components/site/user-menu";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { useCart } from "@/providers/cart-provider";
import { useStorefrontAuthModal } from "@/providers/storefront-auth-modal-provider";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/support", label: "Support" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isLoggedIn } = useCustomerAuth();
  const { count } = useCart();
  const { openLogin } = useStorefrontAuthModal();

  return (
    <>
      <header className="sticky top-0 z-50 w-full min-w-0 border-b border-border bg-surface/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto grid h-16 w-full min-w-0 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 justify-start">
            <Link
              href="/"
              className="inline-flex max-h-10 shrink-0 items-center leading-none"
              aria-label="Gulf Parts Co home"
            >
              <Image
                src="/images/GulfParts.png"
                alt=""
                width={1024}
                height={1024}
                className="h-9 max-h-10 w-auto max-w-32 object-contain sm:h-10 sm:max-w-36"
                priority
              />
            </Link>
          </div>
          <nav className="hidden min-w-0 justify-center md:flex">
            <div className="flex items-center gap-1">
              {nav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-surface-2 text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              asChild
            >
              <Link href="/cart" aria-label="Cart">
                <ShoppingCart className="size-5" />
                {count > 0 ? (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]">
                    {count > 9 ? "9+" : count}
                  </Badge>
                ) : null}
              </Link>
            </Button>
            {isLoggedIn ? (
              <UserMenu />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => openLogin()}
              >
                Log in
              </Button>
            )}
            <MobileNav />
            {!isLoggedIn ? (
              <Button
                variant="secondary"
                size="sm"
                className="sm:hidden"
                onClick={() => openLogin()}
              >
                Log in
              </Button>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
