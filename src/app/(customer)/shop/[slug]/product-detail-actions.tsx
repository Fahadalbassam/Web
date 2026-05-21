"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import type { Part } from "@/lib/catalog/part";
import { effectiveStockQty, isEffectivelyOutOfStock } from "@/lib/catalog/part";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/site/quantity-stepper";
import { QuantityLimitNotice } from "@/components/site/quantity-limit-notice";
import { useCart } from "@/providers/cart-provider";
import {
  clampQuantityToStock,
  getOutOfStockMessage,
  validateAddToCart,
} from "@/lib/quantity-helper";

export function ProductDetailActions({ part }: { part: Part }) {
  const { add, lines } = useCart();
  const [qty, setQty] = React.useState(1);
  const [notice, setNotice] = React.useState<string | null>(null);

  const outOfStock = isEffectivelyOutOfStock(part);
  const stockQty = effectiveStockQty(part);
  const inCartQty =
    lines.find((l) => l.part.slug === part.slug)?.quantity ?? 0;

  const handleAdd = async () => {
    const check = validateAddToCart(inCartQty, qty, stockQty);
    if (!check.ok) {
      setNotice(check.message);
      return;
    }
    setNotice(null);
    await add(part, check.quantity);
  };

  return (
    <div className="flex flex-col gap-3">
      {outOfStock ? (
        <p className="text-sm text-muted-foreground" role="status">
          {getOutOfStockMessage()}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <QuantityStepper
          quantity={qty}
          stockQty={stockQty}
          context="product"
          disabled={outOfStock}
          onDecrease={() => setQty((q) => Math.max(1, q - 1))}
          onIncrease={() =>
            setQty((q) => clampQuantityToStock(q + 1, stockQty))
          }
        />
        <Button
          type="button"
          size="lg"
          className="sm:flex-1"
          disabled={outOfStock}
          onClick={() => void handleAdd()}
        >
          <ShoppingCart className="size-4" />
          Add to cart
        </Button>
      </div>
      <QuantityLimitNotice
        message={notice}
        onDismiss={() => setNotice(null)}
      />
    </div>
  );
}
