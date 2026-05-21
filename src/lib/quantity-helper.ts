export const MIN_ORDER_QUANTITY = 1;

export type QuantityLimitContext = "product" | "cart";

export function resolveStockQty(stockQty: number | null | undefined): number | null {
  if (typeof stockQty !== "number" || !Number.isFinite(stockQty)) return null;
  const q = Math.trunc(stockQty);
  return q < 0 ? 0 : q;
}

export function canDecreaseQuantity(currentQty: number): boolean {
  return currentQty > MIN_ORDER_QUANTITY;
}

export function canIncreaseQuantity(
  currentQty: number,
  stockQty: number | null | undefined,
): boolean {
  const stock = resolveStockQty(stockQty);
  if (stock === null) return true;
  if (stock < 1) return false;
  return currentQty < stock;
}

export function getIncreaseLimitMessage(stockQty: number): string {
  const stock = resolveStockQty(stockQty) ?? 0;
  const noun = stock === 1 ? "item" : "items";
  return `Only ${stock} ${noun} available in stock.`;
}

export function getDecreaseLimitMessage(context: QuantityLimitContext): string {
  if (context === "cart") {
    return "Quantity cannot be less than 1. Use Remove to delete this item.";
  }
  return "Quantity cannot be less than 1.";
}

export function getCartMaxQuantityMessage(): string {
  return "You already have the maximum available quantity in your cart.";
}

export function getOutOfStockMessage(): string {
  return "This product is currently out of stock.";
}

export function clampQuantityToStock(
  requested: number,
  stockQty: number | null | undefined,
): number {
  let q = Math.max(MIN_ORDER_QUANTITY, Math.trunc(requested));
  const stock = resolveStockQty(stockQty);
  if (stock !== null && stock >= 1) q = Math.min(q, stock);
  return q;
}

export type AddToCartValidation =
  | { ok: true; quantity: number }
  | { ok: false; message: string };

export function validateAddToCart(
  existingInCart: number,
  addQty: number,
  stockQty: number | null | undefined,
): AddToCartValidation {
  const stock = resolveStockQty(stockQty);
  if (stock !== null && stock < 1) {
    return { ok: false, message: getOutOfStockMessage() };
  }
  if (stock !== null) {
    if (existingInCart >= stock) {
      return { ok: false, message: getCartMaxQuantityMessage() };
    }
    if (existingInCart + addQty > stock) {
      return { ok: false, message: getIncreaseLimitMessage(stock) };
    }
    return { ok: true, quantity: Math.min(addQty, stock - existingInCart) };
  }
  return { ok: true, quantity: Math.max(1, Math.trunc(addQty)) };
}
