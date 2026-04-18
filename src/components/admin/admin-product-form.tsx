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
import type { Part } from "@/lib/mock/parts";

const categories = [
  "Brakes",
  "Engine",
  "Filters",
  "Fluids",
  "Ignition",
  "Sensors",
  "Suspension",
  "Wipers",
];

function stockQtyFromStatus(part?: Part) {
  if (!part) return "";
  if (part.stockStatus === "in_stock") return "24";
  if (part.stockStatus === "low_stock") return "4";
  return "0";
}

type AdminProductFormProps = {
  mode: "create" | "edit";
  initial?: Part;
};

export function AdminProductForm({ mode, initial }: AdminProductFormProps) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Core catalog fields — wired to mock defaults until the API exists.</CardDescription>
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
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-brand">Brand</Label>
              <Input id="p-brand" name="brand" defaultValue={initial?.brand} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-category">Category</Label>
              <Select name="category" defaultValue={initial?.category ?? categories[0]}>
                <SelectTrigger id="p-category" className="bg-background">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-slug">URL slug</Label>
              <Input id="p-slug" name="slug" defaultValue={initial?.slug} className="bg-background font-mono" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-price">Price (USD)</Label>
              <Input
                id="p-price"
                name="price"
                inputMode="decimal"
                defaultValue={initial?.price?.toString()}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stock">Stock quantity</Label>
              <Input
                id="p-stock"
                name="stockQty"
                inputMode="numeric"
                defaultValue={stockQtyFromStatus(initial)}
                className="bg-background tabular-nums"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-status">Status</Label>
            <Select name="stockStatus" defaultValue={initial?.stockStatus ?? "in_stock"}>
              <SelectTrigger id="p-status" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="in_stock">In stock</SelectItem>
                <SelectItem value="low_stock">Low stock</SelectItem>
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
            <Checkbox id="p-published" name="published" defaultChecked={Boolean(initial)} />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="p-published">Published on storefront</Label>
              <p className="text-xs text-muted-foreground">Demo toggle — does not change live catalog data.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Description & media</CardTitle>
          <CardDescription>Long-form copy and a file picker placeholder for imagery.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" name="description" rows={5} defaultValue={initial?.description} className="bg-background" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="p-image">Product image</Label>
            <Input id="p-image" name="image" type="file" accept="image/*" className="cursor-pointer bg-background" />
            <p className="text-xs text-muted-foreground">Upload wiring is out of scope for this milestone — field is visible for layout review.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Compatibility (optional)</CardTitle>
          <CardDescription>Vehicle fitment hints — placeholder inputs for a future structured fitment model.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="p-make">Make</Label>
            <Input id="p-make" name="make" placeholder="e.g. Honda" className="bg-background" />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="p-model">Model</Label>
            <Input id="p-model" name="model" placeholder="e.g. Accord" className="bg-background" />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="p-years">Year range</Label>
            <Input id="p-years" name="years" placeholder="e.g. 2018–2024" className="bg-background" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">{mode === "create" ? "Save product" : "Save changes"}</Button>
          <Button
            type="button"
            variant="outline"
            className="border-border bg-card"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
        {saved ? <p className="text-sm text-muted-foreground">Saved locally (demo).</p> : null}
      </div>
    </form>
  );
}
