"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import type { Part } from "@/lib/catalog/part";
import {
  effectiveStockQty,
  isStorefrontAvailable,
} from "@/lib/catalog/part";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/cart-provider";
import {
  getOutOfStockMessage,
  validateAddToCart,
} from "@/lib/quantity-helper";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProductCardAddToCart({ part }: { part: Part }) {
  const { add, lines } = useCart();
  const [pending, setPending] = React.useState(false);
  const [limitMessage, setLimitMessage] = React.useState<string | null>(null);
  const canAdd = isStorefrontAvailable(part);
  const inCartQty =
    lines.find((l) => l.part.slug === part.slug)?.quantity ?? 0;
  const stockQty = effectiveStockQty(part);

  const button = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-9 shrink-0 border-border bg-background shadow-none"
      disabled={!canAdd || pending}
      aria-label={`Add ${part.name} to cart`}
      title={canAdd ? "Add to cart" : getOutOfStockMessage()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void (async () => {
          const check = validateAddToCart(inCartQty, 1, stockQty);
          if (!check.ok) {
            setLimitMessage(check.message);
            return;
          }
          setLimitMessage(null);
          setPending(true);
          try {
            await add(part, check.quantity);
          } finally {
            setPending(false);
          }
        })();
      }}
    >
      <ShoppingCart className="size-4 pointer-events-auto" />
    </Button>
  );

  if (!limitMessage) return button;

  return (
    <Tooltip
      open
      onOpenChange={(open) => {
        if (!open) setLimitMessage(null);
      }}
    >
      <TooltipTrigger asChild>
        <span className="inline-flex">{button}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-center">
        {limitMessage}
      </TooltipContent>
    </Tooltip>
  );
}
