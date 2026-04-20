import type { Metadata } from "next";
import { ShopCatalog } from "./shop-catalog";
import { fetchPublishedParts } from "@/lib/catalog-fetch";

export const metadata: Metadata = {
  title: "Shop",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  let parts = [] as Awaited<ReturnType<typeof fetchPublishedParts>>;
  try {
    parts = await fetchPublishedParts();
  } catch {
    parts = [];
  }

  return <ShopCatalog parts={parts} />;
}
