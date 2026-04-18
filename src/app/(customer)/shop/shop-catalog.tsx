"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { mockParts, type Part, type StockStatus } from "@/lib/mock/parts";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { PageIntro } from "@/components/site/page-intro";
import { cn } from "@/lib/utils";

const categories = Array.from(new Set(mockParts.map((p) => p.category))).sort();
const brands = Array.from(new Set(mockParts.map((p) => p.brand))).sort();

const PAGE_SIZE = 9;

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

function matchesStock(part: Part, stock: StockStatus | "all"): boolean {
  if (stock === "all") return true;
  return part.stockStatus === stock;
}

function CatalogPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (n: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <Pagination className="mt-8">
      <PaginationContent className="flex-wrap justify-center gap-1">
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            className="border-border"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
        </PaginationItem>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => (
          <PaginationItem key={num}>
            <Button
              variant={page === num ? "outline" : "ghost"}
              size="icon"
              className="size-9"
              aria-current={page === num ? "page" : undefined}
              onClick={() => onPageChange(num)}
            >
              {num}
            </Button>
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            className="border-border"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export function ShopCatalog() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [brand, setBrand] = React.useState<string>("all");
  const [priceMax, setPriceMax] = React.useState<string>("");
  const [stock, setStock] = React.useState<StockStatus | "all">("all");
  const [sort, setSort] = React.useState<SortKey>("featured");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [search, category, brand, priceMax, stock, sort]);

  const filtered = React.useMemo(() => {
    let list = [...mockParts];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (brand !== "all") list = list.filter((p) => p.brand === brand);
    if (priceMax) {
      const max = Number(priceMax);
      if (!Number.isNaN(max) && max > 0) {
        list = list.filter((p) => p.price <= max);
      }
    }
    list = list.filter((p) => matchesStock(p, stock));

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [search, category, brand, priceMax, stock, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const currentPage = Math.min(page, pageCount);

  const paged = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const filterControls = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="shop-search-sidebar">Search</Label>
        <Input
          id="shop-search-sidebar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Part, brand, number…"
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover">
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Brand</Label>
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover">
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price-max">Max price (USD)</Label>
        <Input
          id="price-max"
          inputMode="decimal"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder="e.g. 150"
          className="bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label>Stock status</Label>
        <Select
          value={stock}
          onValueChange={(v) => setStock(v as StockStatus | "all")}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover">
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="in_stock">In stock</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full border-border"
        onClick={() => {
          setSearch("");
          setCategory("all");
          setBrand("all");
          setPriceMax("");
          setStock("all");
          setSort("featured");
        }}
      >
        Reset filters
      </Button>
    </div>
  );

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setBrand("all");
    setPriceMax("");
    setStock("all");
  };

  const productGrid = (gridClass: string) => (
    <div className={cn("grid gap-6", gridClass)}>
      {paged.map((p) => (
        <ProductCard key={p.slug} part={p} />
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <PageIntro
        title="Shop parts"
        description="Filter locally against mock SKUs — layout mirrors a production catalog without backend wiring."
      />

      <div className="mt-8 flex flex-col gap-4 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts…"
            className="bg-background pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 border-border bg-card">
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="border-border bg-popover">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{filterControls}</div>
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="flex-1 bg-background">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 hidden gap-8 md:grid md:grid-cols-[240px_1fr] md:items-start">
        <aside className="sticky top-24 z-10 w-full max-w-[240px] self-start rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-background pl-9"
            />
          </div>
          {filterControls}
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-medium text-foreground">{filtered.length}</span> parts
            </p>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-44 bg-background">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="mb-8 bg-border" />
          {filtered.length === 0 ? (
            <EmptyState
              title="No parts match"
              description="Relax a filter or reset to see the full mock catalog."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              {productGrid("sm:grid-cols-2 xl:grid-cols-3")}
              <CatalogPagination
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-8 md:hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No parts match"
            description="Relax a filter or reset to see the full mock catalog."
            action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Page {currentPage} of {pageCount} · {filtered.length} parts
            </p>
            {productGrid("sm:grid-cols-2")}
            <CatalogPagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
