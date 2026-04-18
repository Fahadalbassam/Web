"use client";

import * as React from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { Part } from "@/lib/mock/parts";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";

export function ProductDetailActions({ part }: { part: Part }) {
  const { add } = useCart();
  const [qty, setQty] = React.useState(1);

  const disabled = part.stockStatus === "out_of_stock";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="inline-flex items-center rounded-md border border-border bg-background">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-none"
          disabled={disabled || qty <= 1}
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </Button>
        <span className="min-w-10 text-center text-sm font-medium tabular-nums text-foreground">
          {qty}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-none"
          disabled={disabled}
          onClick={() => setQty((q) => q + 1)}
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Button
        type="button"
        size="lg"
        className="sm:flex-1"
        disabled={disabled}
        onClick={() => add(part, qty)}
      >
        <ShoppingCart className="size-4" />
        Add to cart
      </Button>
    </div>
  );
}
