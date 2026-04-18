"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { MobileNav } from "@/components/site/mobile-nav";
import { AuthModal } from "@/components/site/auth-modal";
import { UserMenu } from "@/components/site/user-menu";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { useCart } from "@/providers/cart-provider";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/support", label: "Support" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isLoggedIn } = useCustomerAuth();
  const { count } = useCart();
  const [authOpen, setAuthOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="font-heading text-xl font-semibold tabular-nums tracking-tight text-foreground"
            aria-label="Gulf Parts Co home"
          >
            G
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex">
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
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
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
                onClick={() => setAuthOpen(true)}
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
                onClick={() => setAuthOpen(true)}
              >
                Log in
              </Button>
            ) : null}
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
