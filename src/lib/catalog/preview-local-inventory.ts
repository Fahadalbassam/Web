/**
 * TEMPORARY milestone preview inventory only.
 * Builds storefront `Part` rows from image files under `public/images/` (brake pads,
 * air filters, batteries, radiators). Not persisted in MongoDB — remove this module
 * when the real catalog pipeline fully replaces demo screenshots.
 */
import "server-only";

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { Part } from "@/lib/catalog/part";
import { stockStatusFromQty } from "@/lib/catalog/part";

const IMAGES_ROOT = path.join(process.cwd(), "public", "images");

/** Folder names are matched case-insensitively against `public/images/` contents. */
const PREVIEW_CATEGORY_KEYS = [
  "brake pads",
  "air filters",
  "batteries",
  "radiators",
] as const;

type PreviewCategoryKey = (typeof PREVIEW_CATEGORY_KEYS)[number];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const DESCRIPTIONS = [
  "OEM-style replacement for daily driving and routine maintenance.",
  "Reliable fitment-focused replacement part for regular service intervals.",
  "Built for stable performance and straightforward replacement.",
] as const;

const TEMPLATES: Record<PreviewCategoryKey, readonly string[]> = {
  "brake pads": [
    "Front Brake Pad Set",
    "Ceramic Brake Pad Kit",
    "OEM Brake Pad Set",
  ],
  "air filters": [
    "Engine Air Filter",
    "Premium Panel Air Filter",
    "OEM Air Intake Filter",
  ],
  batteries: [
    "12V Automotive Battery",
    "Maintenance-Free Car Battery",
    "High-Performance Starting Battery",
  ],
  radiators: [
    "Engine Cooling Radiator",
    "OEM Replacement Radiator",
    "Aluminum Core Radiator",
  ],
} as const;

const PRICE_BANDS: Record<PreviewCategoryKey, { min: number; max: number }> = {
  "brake pads": { min: 80, max: 220 },
  "air filters": { min: 35, max: 120 },
  batteries: { min: 180, max: 650 },
  radiators: { min: 220, max: 900 },
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: readonly T[], seed: string): T {
  return arr[hashSeed(seed) % arr.length]!;
}

function priceFor(seed: string, band: { min: number; max: number }): number {
  const span = band.max - band.min;
  const steps = Math.max(1, Math.floor(span / 5));
  const step = hashSeed(`price:${seed}`) % (steps + 1);
  const raw = band.min + step * 5;
  const tweak = (hashSeed(`tweak:${seed}`) % 3) - 1;
  return Math.min(band.max, Math.max(band.min, raw + tweak));
}

function titleCaseCategory(folderName: string): string {
  return folderName
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function normalizeKey(dirName: string): PreviewCategoryKey | null {
  const k = dirName.trim().toLowerCase();
  if ((PREVIEW_CATEGORY_KEYS as readonly string[]).includes(k)) {
    return k as PreviewCategoryKey;
  }
  return null;
}

/** Encode each path segment for a safe public URL (spaces etc.). */
function publicPathForFile(absolutePath: string): string {
  const publicDir = path.join(process.cwd(), "public");
  const rel = path.relative(publicDir, absolutePath);
  const posix = rel.split(path.sep).join("/");
  return (
    "/" +
    posix
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/")
  );
}

function stripExtension(base: string): string {
  return base.replace(/\.[^.]+$/, "");
}

function cleanFileStem(stem: string): string {
  return stripExtension(stem).replace(/\s+2$/i, "").trim();
}

function inferBrandAndTail(cleanStem: string): { brand: string; tail: string } {
  const parts = cleanStem.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { brand: "Gulf Parts", tail: "" };
  const brand = parts[0]!;
  const tail = parts.slice(1).join(" ").trim();
  return { brand, tail };
}

function buildDisplayName(
  categoryKey: PreviewCategoryKey,
  brand: string,
  cleanStem: string,
  tail: string
): string {
  if (tail.length >= 6) {
    return `${brand} ${tail}`.replace(/\s+/g, " ").trim();
  }
  const template = pick(TEMPLATES[categoryKey], cleanStem);
  return `${brand} ${template}`.trim();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function stableShortId(relPosix: string): string {
  return createHash("sha1").update(relPosix).digest("hex").slice(0, 10);
}

/**
 * Scans `public/images/` for preview category folders and returns `Part` objects
 * backed by each image file found. Empty folders and missing dirs are OK.
 */
export function getPreviewPartsFromLocalImages(): Part[] {
  if (!fs.existsSync(IMAGES_ROOT)) return [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(IMAGES_ROOT, { withFileTypes: true });
  } catch {
    return [];
  }

  const usedSlugs = new Set<string>();
  const out: Part[] = [];

  for (const dirent of entries) {
    if (!dirent.isDirectory()) continue;
    const categoryKey = normalizeKey(dirent.name);
    if (!categoryKey) continue;

    const categoryLabel = titleCaseCategory(dirent.name);
    const dirAbs = path.join(IMAGES_ROOT, dirent.name);
    let files: string[];
    try {
      files = fs.readdirSync(dirAbs);
    } catch {
      continue;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!IMAGE_EXT.has(ext)) continue;

      const abs = path.join(dirAbs, file);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(abs);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;

      const relPosix = path.relative(path.join(process.cwd(), "public"), abs).split(path.sep).join("/");
      const image = publicPathForFile(abs);
      const stem = cleanFileStem(file);
      const { brand, tail } = inferBrandAndTail(stem);
      const name = buildDisplayName(categoryKey, brand, stem, tail);

      let baseSlug = slugify(`pv-${categoryKey}-${stem}`);
      if (!baseSlug) baseSlug = `pv-${categoryKey}`;
      let slug = baseSlug;
      let n = 0;
      while (usedSlugs.has(slug)) {
        n += 1;
        slug = `${baseSlug}-${n}`;
      }
      usedSlugs.add(slug);

      const sid = stableShortId(relPosix);
      const id = `preview:${sid}`;
      const price = priceFor(relPosix, PRICE_BANDS[categoryKey]);
      const stockQty = 6 + (hashSeed(`qty:${relPosix}`) % 42);
      const description = pick(DESCRIPTIONS, relPosix);
      const partNumber = `GP-PV-${sid.slice(0, 8).toUpperCase()}`;

      const part: Part = {
        id,
        slug,
        name,
        brand,
        partNumber,
        price,
        image,
        category: categoryLabel,
        description,
        stockStatus: stockStatusFromQty(stockQty),
        compatibility: [],
        stockQty,
        published: true,
        isPreviewCatalog: true,
      };
      out.push(part);
    }
  }

  return out;
}
