import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import {
  fetchPartBySlug,
  fetchPublishedParts,
  fetchRelatedParts,
} from "@/lib/catalog-fetch";
import type { Part } from "@/lib/catalog/part";
import { resolvePartImageSrc } from "@/lib/catalog/resolve-part-image";
import { PageSection } from "@/components/site/page-section";
import { ProductCard } from "@/components/site/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductDetailActions } from "./product-detail-actions";
import { SarCurrency } from "@/components/site/sar-currency";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const part = await fetchPartBySlug(slug);
    if (!part) return { title: "Part" };
    return { title: part.name };
  } catch {
    return { title: "Part" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let part: Part | null = null;
  try {
    part = await fetchPartBySlug(slug);
  } catch {
    notFound();
  }
  if (!part) notFound();

  const partImage = resolvePartImageSrc(part.image);

  let related: Part[] = [];
  try {
    related = await fetchRelatedParts(slug, 4);
  } catch {
    related = [];
  }

  if (related.length === 0) {
    try {
      const pool = await fetchPublishedParts();
      related = pool.filter((p) => p.slug !== slug).slice(0, 4);
    } catch {
      related = [];
    }
  }

  return (
    <div>
      <PageSection density="compact" className="pt-8 pb-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3 opacity-60" />
            <Link href="/shop" className="hover:text-foreground">
              Shop
            </Link>
            <ChevronRight className="size-3 opacity-60" />
            <span className="text-foreground">{part.name}</span>
          </nav>
        </div>
      </PageSection>

      <PageSection density="compact" className="pt-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={partImage}
                alt={part.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {part.brand}
              </p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {part.name}
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                Part # <span className="text-foreground">{part.partNumber}</span> ·{" "}
                {part.category}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SarCurrency amount={part.price} className="text-3xl font-semibold text-foreground" />
              {part.stockStatus === "in_stock" ? (
                <Badge className="bg-secondary text-secondary-foreground">In stock</Badge>
              ) : null}
              {part.stockStatus === "low_stock" ? (
                <Badge variant="outline" className="border-border">
                  Low stock
                </Badge>
              ) : null}
              {part.stockStatus === "out_of_stock" ? (
                <Badge variant="destructive">Out of stock</Badge>
              ) : null}
            </div>

            <ProductDetailActions part={part} />

            <p className="text-sm leading-relaxed text-muted-foreground">{part.description}</p>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Confirmed compatibility
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Always verify against your VIN and option codes before ordering. This block highlights
            common fitments for the SKU.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-surface-2/60 p-6 md:p-8">
            <ul className="space-y-3 text-sm text-foreground">
              {part.compatibility.length === 0 ? (
                <li className="text-muted-foreground">No compatibility lines stored for this SKU.</li>
              ) : (
                part.compatibility.map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </PageSection>

      <PageSection density="compact" className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">Related parts</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Same category when available — otherwise other published catalog items.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/shop">Back to shop</Link>
            </Button>
          </div>
          <Separator className="my-8 bg-border" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} part={p} />
            ))}
          </div>
        </div>
      </PageSection>
    </div>
  );
}
