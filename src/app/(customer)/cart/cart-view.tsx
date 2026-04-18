"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageIntro } from "@/components/site/page-intro";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/site/empty-state";
import { useCart } from "@/providers/cart-provider";

export function CartView() {
  const { lines, setQuantity, remove, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <PageIntro title="Your cart is empty" description="Add parts from the shop to see them here." />
        <EmptyState
          className="mt-10"
          title="No items yet"
          description="Browse the catalog and tap “Add to cart” on any in-stock SKU."
          action={
            <Button asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <PageIntro title="Cart" description="Review quantities before checkout — all mock for this beta." />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {lines.map(({ part, quantity }) => (
            <div
              key={part.slug}
              className="flex gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={part.image} alt="" fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {part.brand}
                    </p>
                    <Link
                      href={`/shop/${part.slug}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {part.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{part.partNumber}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(part.slug)}
                    aria-label={`Remove ${part.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-md border border-border bg-background">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-none"
                      onClick={() => setQuantity(part.slug, quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-9 text-center text-sm font-medium tabular-nums">{quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-none"
                      onClick={() => setQuantity(part.slug, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    ${(part.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-border bg-surface-2/50 p-6">
          <h2 className="text-sm font-semibold text-foreground">Summary</h2>
          <Separator className="my-4 bg-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="outline" className="mt-3 w-full border-border bg-background">
            <Link href="/shop">Keep shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
