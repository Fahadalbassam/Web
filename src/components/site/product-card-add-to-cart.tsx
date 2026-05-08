"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import type { Part } from "@/lib/catalog/part";
import { isStorefrontAvailable } from "@/lib/catalog/part";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";

export function ProductCardAddToCart({ part }: { part: Part }) {
  const { add } = useCart();
  const [pending, setPending] = React.useState(false);
  const canAdd = isStorefrontAvailable(part);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-9 shrink-0 border-border bg-background shadow-none"
      disabled={!canAdd || pending}
      aria-label={`Add ${part.name} to cart`}
      title={canAdd ? "Add to cart" : "Out of stock"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void (async () => {
          setPending(true);
          try {
            await add(part, 1);
          } finally {
            setPending(false);
          }
        })();
      }}
    >
      <ShoppingCart className="size-4 pointer-events-auto" />
    </Button>
  );
}
