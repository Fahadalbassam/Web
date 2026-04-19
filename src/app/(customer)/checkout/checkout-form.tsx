"use client";

import * as React from "react";
import Link from "next/link";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { phpBrowserUrl } from "@/lib/php-backend";
import { useCart } from "@/providers/cart-provider";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { useStorefrontAuthModal } from "@/providers/storefront-auth-modal-provider";
import { SarCurrency } from "@/components/site/sar-currency";

export function CheckoutForm() {
  const { lines, subtotal, clear, refresh } = useCart();
  const { isLoggedIn, hydrated } = useCustomerAuth();
  const { openLogin } = useStorefrontAuthModal();
  const [placed, setPlaced] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  if (lines.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <PageIntro title="Checkout" description="Your cart is empty — add parts before checking out." />
        <Button asChild className="mt-8">
          <Link href="/shop">Go to shop</Link>
        </Button>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <PageIntro title="Checkout" description="Loading your session…" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <PageIntro
          title="Sign in to check out"
          description="Your cart is kept in this browser session. Sign in with your Gulf Parts Co account to enter shipping details and place the order."
        />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => openLogin("/checkout")}>
            Sign in
          </Button>
          <Button asChild variant="outline" className="border-border bg-background">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      line1: String(fd.get("line1") ?? "").trim(),
      line2: String(fd.get("line2") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      state: String(fd.get("state") ?? "").trim(),
      postal: String(fd.get("postal") ?? "").trim(),
    };

    try {
      const res = await fetch(phpBrowserUrl("checkout/place.php"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };

      if (res.status === 401) {
        setError(j.error ?? "Please sign in again to place your order.");
        openLogin("/checkout");
        setPending(false);
        return;
      }

      if (!res.ok) {
        setError(j.error ?? "Could not place order");
        setPending(false);
        return;
      }

      await clear();
      await refresh();
      setPlaced(true);
    } catch {
      setError("Could not reach the checkout service.");
    } finally {
      setPending(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <PageIntro
          title="Order placed"
          description="Your order was recorded and inventory was updated. You may see a cookie set for recent order reference."
        />
        <Button asChild className="mt-8">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <PageIntro
        title="Checkout"
        description="Shipping details and order summary — your cart is tied to your current browser session."
      />

      <form
        onSubmit={(e) => void handlePlaceOrder(e)}
        className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
      >
        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
            <h2 className="text-sm font-semibold text-foreground">Customer</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" required className="bg-background" autoComplete="name" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="bg-background"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" className="bg-background" autoComplete="tel" />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
            <h2 className="text-sm font-semibold text-foreground">Shipping address</h2>
            <div className="mt-4 grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="line1">Address line 1</Label>
                <Input id="line1" name="line1" required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="line2">Address line 2</Label>
                <Input id="line2" name="line2" className="bg-background" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required className="bg-background" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" name="state" className="bg-background" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="postal">Postal code</Label>
                  <Input id="postal" name="postal" required className="bg-background" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-border bg-surface-2/50 p-6">
          <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
          <Separator className="bg-border" />
          <ul className="space-y-3 text-sm">
            {lines.map(({ part, quantity }) => (
              <li key={part.slug} className="flex justify-between gap-4 text-muted-foreground">
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {part.name}{" "}
                  <span className="text-muted-foreground">×{quantity}</span>
                </span>
                <SarCurrency
                  amount={part.price * quantity}
                  className="shrink-0 text-foreground"
                />
              </li>
            ))}
          </ul>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <SarCurrency amount={subtotal} className="text-lg font-semibold text-foreground" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Placing…" : "Place order"}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            By placing this order you acknowledge the beta terms — payment processing is out of scope;
            Your order is saved and inventory is updated automatically.
          </p>
        </aside>
      </form>
    </div>
  );
}
