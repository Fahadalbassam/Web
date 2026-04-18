"use client";

import * as React from "react";
import Link from "next/link";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/cart-provider";

export function CheckoutForm() {
  const { lines, subtotal, clear } = useCart();
  const [placed, setPlaced] = React.useState(false);

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    clear();
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <PageIntro
          title="Order placed (mock)"
          description="No payment was processed. This flow demonstrates the checkout layout only."
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
        description="Shipping details and a concise order summary — aligned with support and settings forms."
      />

      <form onSubmit={handlePlaceOrder} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
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
                <span className="shrink-0 tabular-nums">${(part.price * quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <Button type="submit" size="lg" className="w-full">
            Place order
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            By placing this order you acknowledge the beta terms — no payment or fulfillment occurs.
          </p>
        </aside>
      </form>
    </div>
  );
}
