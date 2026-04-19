/** Shared storefront/admin product shape — mapped from MongoDB documents. */

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

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
  /**
   * Milestone-only rows synthesized from `public/images/` (not in MongoDB).
   * Storefront cards link to `/shop` instead of PDP so PHP catalog stays authoritative.
   */
  isPreviewCatalog?: boolean;
};

export function stockStatusFromQty(qty: number): StockStatus {
  if (!Number.isFinite(qty) || qty <= 0) return "out_of_stock";
  if (qty <= 5) return "low_stock";
  return "in_stock";
}
