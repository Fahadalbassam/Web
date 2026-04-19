"use client";

import * as React from "react";
import type { Part } from "@/lib/catalog/part";
import { phpBrowserUrl } from "@/lib/php-backend";

export type CartLine = {
  part: Part;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  /** True after first PHP cart sync (session may be empty). */
  hydrated: boolean;
  add: (part: Part, quantity?: number) => Promise<void>;
  setQuantity: (slug: string, quantity: number) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  subtotal: number;
  count: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch(phpBrowserUrl("cart/get.php"), { credentials: "include" });
      if (!res.ok) {
        setLines([]);
        return;
      }
      const data = (await res.json()) as { lines?: CartLine[] };
      setLines(data.lines ?? []);
    } catch {
      setLines([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = React.useCallback(async (part: Part, quantity = 1) => {
    const res = await fetch(phpBrowserUrl("cart/add.php"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: part.slug, quantity }),
    });
    if (res.ok) {
      const data = (await res.json()) as { lines?: CartLine[] };
      setLines(data.lines ?? []);
    }
  }, []);

  const setQuantity = React.useCallback(async (slug: string, quantity: number) => {
    if (quantity < 1) {
      const res = await fetch(phpBrowserUrl("cart/remove.php"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = (await res.json()) as { lines?: CartLine[] };
        setLines(data.lines ?? []);
      }
      return;
    }
    const res = await fetch(phpBrowserUrl("cart/update.php"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, quantity }),
    });
    if (res.ok) {
      const data = (await res.json()) as { lines?: CartLine[] };
      setLines(data.lines ?? []);
    }
  }, []);

  const remove = React.useCallback(async (slug: string) => {
    const res = await fetch(phpBrowserUrl("cart/remove.php"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (res.ok) {
      const data = (await res.json()) as { lines?: CartLine[] };
      setLines(data.lines ?? []);
    }
  }, []);

  const clear = React.useCallback(async () => {
    const res = await fetch(phpBrowserUrl("cart/clear.php"), {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      setLines([]);
    }
  }, []);

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
      hydrated,
      add,
      setQuantity,
      remove,
      clear,
      refresh,
      subtotal,
      count,
    }),
    [lines, hydrated, add, setQuantity, remove, clear, refresh, subtotal, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
