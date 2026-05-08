/** Shared storefront/admin product shape — mapped from MongoDB documents. */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** Matches PHP `gp_stock_status` — qty at or below this is “low stock”. */
export const LOW_STOCK_QTY_MAX = 5;

export type Part = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  partNumber: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stockStatus: StockStatus;
  compatibility: string[];
  /** Present when sourced from persisted inventory (MongoDB `stockQty`). */
  stockQty?: number;
  /** Present when loaded from admin/catalog persistence. */
  published?: boolean;
};

export function stockStatusFromQty(qty: number): StockStatus {
  if (!Number.isFinite(qty) || qty <= 0) return "out_of_stock";
  if (qty <= LOW_STOCK_QTY_MAX) return "low_stock";
  return "in_stock";
}

/** On-hand units when `stockQty` is present from the API; otherwise `null` (legacy mocks). */
export function effectiveStockQty(part: Part): number | null {
  if (typeof part.stockQty === "number" && Number.isFinite(part.stockQty)) {
    return Math.max(0, Math.trunc(part.stockQty));
  }
  return null;
}

/** Hide from default shop / featured unless the shopper picks “Out of stock”. */
export function isStorefrontAvailable(part: Part): boolean {
  const q = effectiveStockQty(part);
  if (q !== null) return q > 0;
  return part.stockStatus !== "out_of_stock";
}

/** Admin/inventory: true when quantity is zero or status is explicitly out of stock without qty. */
export function isEffectivelyOutOfStock(part: Part): boolean {
  const q = effectiveStockQty(part);
  if (q !== null) return q <= 0;
  return part.stockStatus === "out_of_stock";
}
