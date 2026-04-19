"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Part } from "@/lib/catalog/part";
import { phpBrowserUrl } from "@/lib/php-backend";

function defaultStockQty(p?: Part): string {
  if (p?.stockQty != null) return String(p.stockQty);
  if (p?.stockStatus === "in_stock") return "24";
  if (p?.stockStatus === "low_stock") return "4";
  return "0";
}

type AdminProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initial?: Part;
};

export function AdminProductForm({ mode, productId, initial }: AdminProductFormProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);
  const [category, setCategory] = React.useState(initial?.category ?? "");
  const [imagePath, setImagePath] = React.useState(
    initial?.image && !initial.image.startsWith("blob:") ? initial.image : ""
  );
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [published, setPublished] = React.useState(
    mode === "edit" ? initial?.published !== false : true
  );

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(phpBrowserUrl("catalog/categories.php"), { cache: "no-store" });
        const j = (await res.json().catch(() => ({}))) as { categories?: string[] };
        const list = Array.isArray(j.categories) ? j.categories : [];
        if (cancelled) return;
        setCategories(list);
        setCategory((prev) => {
          if (prev && list.includes(prev)) return prev;
          const init = initial?.category?.trim();
          if (init && list.includes(init)) return init;
          return list[0] ?? "";
        });
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial?.category]);

  const compatibilityDefault = initial?.compatibility?.length
    ? initial.compatibility.join("\n")
    : "";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = String(fd.get("name") ?? "").trim();
    const brand = String(fd.get("brand") ?? "").trim();
    const partNumber = String(fd.get("partNumber") ?? "").trim();
    const slug = String(fd.get("slug") ?? "").trim();
    const description = String(fd.get("description") ?? "");
    const price = Number(fd.get("price"));
    const stockQtyRaw = Number(fd.get("stockQty"));
    const imageValue = imagePath.trim();

    const stockQty = Number.isFinite(stockQtyRaw) && stockQtyRaw >= 0 ? stockQtyRaw : 0;

    const compatLines = String(fd.get("compatibility") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = {
      name,
      brand,
      partNumber,
      slug,
      category,
      description,
      price,
      stockQty,
      published,
      image: imageValue || "/placeholder-product.svg",
      compatibility: compatLines,
    };

    try {
      const url =
        mode === "create"
          ? phpBrowserUrl("admin/products.php")
          : phpBrowserUrl(`admin/product.php?id=${encodeURIComponent(productId ?? "")}`);
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(j.error ?? "Could not save product");
        setPending(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>
            Core catalog fields are saved to the server. Storefront badges derive from quantity: 0 = out of
            stock, 1–5 = low stock, higher = in stock.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Product name</Label>
            <Input
              id="p-name"
              name="name"
              required
              defaultValue={initial?.name}
              className="bg-background"
              disabled={pending}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-brand">Brand</Label>
              <Input
                id="p-brand"
                name="brand"
                defaultValue={initial?.brand}
                className="bg-background"
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={pending || categoriesLoading || categories.length === 0}
              >
                <SelectTrigger id="p-category" className="bg-background">
                  <SelectValue
                    placeholder={categoriesLoading ? "Loading categories…" : "Choose a category"}
                  />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Options come from MongoDB (`categories` collection and existing product labels) via PHP.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-sku">Part number</Label>
              <Input
                id="p-sku"
                name="partNumber"
                defaultValue={initial?.partNumber}
                className="bg-background font-mono"
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-slug">URL slug</Label>
              <Input
                id="p-slug"
                name="slug"
                defaultValue={initial?.slug}
                className="bg-background font-mono"
                required
                disabled={pending}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-price">Price (SAR)</Label>
              <Input
                id="p-price"
                name="price"
                inputMode="decimal"
                defaultValue={initial?.price?.toString()}
                className="bg-background"
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stock">Stock quantity</Label>
              <Input
                id="p-stock"
                name="stockQty"
                inputMode="numeric"
                defaultValue={defaultStockQty(initial)}
                className="bg-background tabular-nums"
                required
                disabled={pending}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
            <Checkbox
              id="p-published"
              checked={published}
              onCheckedChange={(v) => setPublished(v === true)}
              disabled={pending}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="p-published">Published on storefront</Label>
              <p className="text-xs text-muted-foreground">
                Unpublished SKUs remain in admin only until enabled.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Description & media</CardTitle>
          <CardDescription>
            Use a full image URL, a path such as <code className="text-xs">/uploads/…</code> (after upload), or
            upload a file — stored on disk under <code className="text-xs">php/public/uploads/</code> and referenced
            by path in MongoDB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              name="description"
              rows={5}
              defaultValue={initial?.description}
              className="bg-background"
              disabled={pending}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="p-image-path">Image URL or path</Label>
            <Input
              id="p-image-path"
              name="imagePath"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              placeholder="https://… or /uploads/… after upload"
              className="bg-background"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-image-file">Product image (file)</Label>
            <Input
              id="p-image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="cursor-pointer bg-background"
              disabled={pending || uploadingImage}
              onChange={(e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (!file) return;
                void (async () => {
                  setUploadingImage(true);
                  setError(null);
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    const res = await fetch(phpBrowserUrl("admin/upload-image.php"), {
                      method: "POST",
                      credentials: "include",
                      body: fd,
                    });
                    const j = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
                    if (!res.ok) {
                      setError(j.error ?? "Upload failed");
                      return;
                    }
                    if (j.path) setImagePath(j.path);
                  } catch {
                    setError("Could not upload image");
                  } finally {
                    setUploadingImage(false);
                    input.value = "";
                  }
                })();
              }}
            />
            <p className="text-xs text-muted-foreground">
              {uploadingImage ? "Uploading…" : "JPEG / PNG / WebP / GIF, max 5MB. Saves to PHP public uploads."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Compatibility (optional)</CardTitle>
          <CardDescription>One line per fitment note — stored as an array of strings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="p-compat">Compatibility lines</Label>
            <Textarea
              id="p-compat"
              name="compatibility"
              rows={4}
              defaultValue={compatibilityDefault}
              placeholder={"2018–2024 Honda Accord (all trims)\n2019–2023 Toyota Camry"}
              className="bg-background"
              disabled={pending}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending || categoriesLoading || categories.length === 0}>
            {pending ? "Saving…" : mode === "create" ? "Save product" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-border bg-card"
            onClick={() => router.back()}
            disabled={pending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
