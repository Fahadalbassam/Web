import "server-only";

import fs from "fs";
import path from "path";

/**
 * Lists public URL paths for logo files under `public/images/brandlogos/`.
 * Sorted by filename so new assets are picked up without code changes.
 */
export function getBrandLogoPublicPaths(): string[] {
  const dir = path.join(process.cwd(), "public", "images", "brandlogos");
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => /\.(png|jpe?g|svg|webp)$/i.test(name))
      .filter((name) => !name.startsWith("."))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((name) => `/images/brandlogos/${name}`);
  } catch {
    return [];
  }
}
