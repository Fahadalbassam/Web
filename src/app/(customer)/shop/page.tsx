import type { Metadata } from "next";
import { ShopCatalog } from "./shop-catalog";
import { fetchPublishedParts } from "@/lib/catalog-fetch";
import {
  getLocalPreviewCatalogParts,
  mergePartsForShopCatalog,
} from "@/lib/catalog/storefront-catalog";

export const metadata: Metadata = {
  title: "Shop",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let real = [] as Awaited<ReturnType<typeof fetchPublishedParts>>;
  try {
    real = await fetchPublishedParts();
  } catch {
    real = [];
  }
  const preview = getLocalPreviewCatalogParts();
  const parts = mergePartsForShopCatalog(real, preview);

  return <ShopCatalog parts={parts} />;
}
