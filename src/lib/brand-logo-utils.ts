/** Shared helpers for homepage brand logo strip (safe for client + server). */

export function brandLabelFromPublicPath(publicPath: string): string {
  const file = publicPath.split("/").pop() ?? "";
  const base = file.replace(/\.[^.]+$/i, "");
  if (!base) return "Brand";
  return base
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
