import "server-only";

import fs from "fs";
import path from "path";

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
