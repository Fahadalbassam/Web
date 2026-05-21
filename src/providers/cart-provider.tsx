"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { Part } from "@/lib/catalog/part";
import { phpBrowserUrl } from "@/lib/php-backend";

export type CartLine = {
  part: Part;
  quantity: number;
    cartSlug?: string;
};

type CartContextValue = {
  lines: CartLine[];
    hydrated: boolean;
  add: (part: Part, quantity?: number) => Promise<void>;
  setQuantity: (cartKey: string, quantity: number) => Promise<void>;
  remove: (cartKey: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  subtotal: number;
  count: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch(phpBrowserUrl("cart/get.php"), {
        credentials: "include",
        cache: "no-store",
      });
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
  }, [pathname, refresh]);

    React.useEffect(() => {
    const onAuthChange = () => void refresh();
    window.addEventListener("gp-cart-refresh", onAuthChange);
    return () => window.removeEventListener("gp-cart-refresh", onAuthChange);
  }, [refresh]);

  const add = React.useCallback(
    async (part: Part, quantity = 1) => {
      try {
        const res = await fetch(phpBrowserUrl("cart/add.php"), {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: part.slug, quantity }),
        });
        await res.json().catch(() => ({}));
      } catch {
      } finally {
        await refresh();
      }
    },
    [refresh]
  );

  const setQuantity = React.useCallback(async (cartKey: string, quantity: number) => {
    const body = { cartSlug: cartKey, slug: cartKey, quantity };
    if (quantity < 1) {
      const res = await fetch(phpBrowserUrl("cart/remove.php"), {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartSlug: cartKey, slug: cartKey }),
      });
      if (res.ok) {
        const data = (await res.json()) as { lines?: CartLine[] };
        setLines(data.lines ?? []);
      } else {
        await refresh();
      }
      return;
    }
    const res = await fetch(phpBrowserUrl("cart/update.php"), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = (await res.json()) as { lines?: CartLine[] };
      setLines(data.lines ?? []);
    } else {
      await refresh();
    }
  }, [refresh]);

  const remove = React.useCallback(async (cartKey: string) => {
    const res = await fetch(phpBrowserUrl("cart/remove.php"), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartSlug: cartKey, slug: cartKey }),
    });
    if (res.ok) {
      const data = (await res.json()) as { lines?: CartLine[] };
      setLines(data.lines ?? []);
    } else {
      await refresh();
    }
  }, [refresh]);

  const clear = React.useCallback(async () => {
    const res = await fetch(phpBrowserUrl("cart/clear.php"), {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) {
      setLines([]);
    } else {
      await refresh();
    }
  }, [refresh]);

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
