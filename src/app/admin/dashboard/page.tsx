import Link from "next/link";
import { Package, Tags, ClipboardList, Boxes, CircleOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchAllProductsAdmin } from "@/lib/catalog-fetch";
import { isEffectivelyOutOfStock } from "@/lib/catalog/part";

export default async function AdminDashboardPage() {
  let parts = [] as Awaited<ReturnType<typeof fetchAllProductsAdmin>>;
  try {
    parts = await fetchAllProductsAdmin();
  } catch {
    parts = [];
  }

  const lowStockCount = parts.filter((p) => p.stockStatus === "low_stock").length;
  const outOfStockCount = parts.filter((p) => isEffectivelyOutOfStock(p)).length;
  const categoriesCount = new Set(parts.map((p) => p.category)).size;
  const unpublished = parts.filter((p) => p.published === false).length;

  const recent = parts.slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Snapshot metrics from your live catalog — lighter chrome than the public storefront.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Total products</CardDescription>
              <Boxes className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl tabular-nums">{parts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All SKUs in database</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Out of stock</CardDescription>
              <CircleOff className="size-4 text-destructive" />
            </div>
            <CardTitle className="text-3xl tabular-nums text-destructive">{outOfStockCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Qty is zero — restock in Products</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Low stock items</CardDescription>
              <Package className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl tabular-nums">{lowStockCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Derived from quantity thresholds</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Categories</CardDescription>
              <Tags className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl tabular-nums">{categoriesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Distinct category labels</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Unpublished</CardDescription>
              <ClipboardList className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="flex items-center gap-2 text-3xl tabular-nums">{unpublished}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Not visible on storefront</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
        <Button asChild variant="outline" className="border-border bg-card">
          <Link href="/admin/products">Manage products</Link>
        </Button>
        <Button asChild variant="outline" className="border-border bg-card">
          <Link href="/" className="inline-flex items-center gap-2">
            <Home className="size-4" aria-hidden />
            Home
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">Recent catalog entries</h2>
        <p className="mt-1 text-xs text-muted-foreground">Newest products first (by created date)</p>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {recent.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted-foreground">No products yet — add your first SKU.</li>
          ) : (
            recent.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.brand} · {p.category}
                  </p>
                </div>
                <Badge
                  variant={p.stockStatus === "out_of_stock" ? "destructive" : "outline"}
                  className="capitalize"
                >
                  {p.stockStatus.replace("_", " ")}
                </Badge>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
