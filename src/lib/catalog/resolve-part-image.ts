export function resolvePartImageSrc(image: string | undefined | null): string {
  let raw = String(image ?? "").trim();
  if (raw === "") return "/placeholder-product.svg";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/backend/uploads/")) return raw;
    if (raw.startsWith("uploads/")) {
    raw = `/${raw}`;
  }
  if (raw.startsWith("/uploads/")) return `/backend${raw}`;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\/+/, "")}`;
}
