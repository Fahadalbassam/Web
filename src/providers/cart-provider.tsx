"use client";

import * as React from "react";
import type { Part } from "@/lib/mock/parts";

export type CartLine = {
  part: Part;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (part: Part, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);

  const add = React.useCallback((part: Part, quantity = 1) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.part.slug === part.slug);
      if (idx === -1) return [...prev, { part, quantity }];
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        quantity: next[idx].quantity + quantity,
      };
      return next;
    });
  }, []);

  const setQuantity = React.useCallback((slug: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.part.slug !== slug));
      return;
    }
    setLines((prev) =>
      prev.map((l) =>
        l.part.slug === slug ? { ...l, quantity } : l
      )
    );
  }, []);

  const remove = React.useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.part.slug !== slug));
  }, []);

  const clear = React.useCallback(() => setLines([]), []);

  const subtotal = React.useMemo(
    () => lines.reduce((sum, l) => sum + l.part.price * l.quantity, 0),
    [lines]
  );

  const count = React.useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );

  const value = React.useMemo(
    () => ({
      lines,
      add,
      setQuantity,
      remove,
      clear,
      subtotal,
      count,
    }),
    [lines, add, setQuantity, remove, clear, subtotal, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
