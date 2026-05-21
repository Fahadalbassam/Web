
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

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
    stockQty?: number;
    published?: boolean;
};

export function stockStatusFromQty(qty: number): StockStatus {
  if (!Number.isFinite(qty) || qty <= 0) return "out_of_stock";
  if (qty <= LOW_STOCK_QTY_MAX) return "low_stock";
  return "in_stock";
}

export function effectiveStockQty(part: Part): number | null {
  if (typeof part.stockQty === "number" && Number.isFinite(part.stockQty)) {
    return Math.max(0, Math.trunc(part.stockQty));
  }
  return null;
}

export function isStorefrontAvailable(part: Part): boolean {
  const q = effectiveStockQty(part);
  if (q !== null) return q > 0;
  return part.stockStatus !== "out_of_stock";
}

export function isEffectivelyOutOfStock(part: Part): boolean {
  const q = effectiveStockQty(part);
  if (q !== null) return q <= 0;
  return part.stockStatus === "out_of_stock";
}
