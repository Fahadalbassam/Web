/**
 * TEMPORARY: merges PHP/MongoDB catalog parts with milestone preview rows from
 * `getPreviewPartsFromLocalImages()`. Real inventory stays primary; previews fill
 * gaps for screenshots. Remove when demo inventory is no longer needed.
 */
import "server-only";

import type { Part } from "@/lib/catalog/part";
import { getPreviewPartsFromLocalImages } from "@/lib/catalog/preview-local-inventory";

/** When fewer than this many published parts load, shop listing pads with preview rows. */
const SHOP_PREVIEW_FALLBACK_THRESHOLD = 8;

function slugSet(parts: Part[]): Set<string> {
  return new Set(parts.map((p) => p.slug));
}

function appendPreviewsAvoidingCollisions(real: Part[], preview: Part[]): Part[] {
  const taken = slugSet(real);
  const extra = preview.filter((p) => !taken.has(p.slug));
  return [...real, ...extra];
}

/** Latest arrivals row: all real parts first (API order), then previews; cap at `limit`. */
export function mergePartsForHomeRow(real: Part[], preview: Part[], limit = 4): Part[] {
  const merged = appendPreviewsAvoidingCollisions(real, preview);
  return merged.slice(0, limit);
}

/** Full shop grid: real-only when the catalog is already well populated; otherwise pad. */
export function mergePartsForShopCatalog(real: Part[], preview: Part[]): Part[] {
  if (real.length >= SHOP_PREVIEW_FALLBACK_THRESHOLD) {
    return real;
  }
  return appendPreviewsAvoidingCollisions(real, preview);
}

export function getLocalPreviewCatalogParts(): Part[] {
  return getPreviewPartsFromLocalImages();
}
