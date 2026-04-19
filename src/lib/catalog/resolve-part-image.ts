/**
 * Normalize catalog image paths for Next/Image and browser (DB stores filename or path).
 * Files under `/uploads/` are stored on the PHP public root; the UI loads them via the
 * Next rewrite prefix `/backend/` so same-origin `next/image` works in dev.
 */
export function resolvePartImageSrc(image: string | undefined | null): string {
  const raw = String(image ?? "").trim();
  if (raw === "") return "/placeholder-product.svg";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/backend/uploads/")) return raw;
  if (raw.startsWith("/uploads/")) return `/backend${raw}`;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\/+/, "")}`;
}
