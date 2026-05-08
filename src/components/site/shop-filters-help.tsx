"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Opens an instructional dialog — satisfies “help window” style UX for the shop filter panel.
 */
export function ShopFiltersHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="How shop filters work"
        >
          <Info className="size-4" strokeWidth={2} />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">How shop filters work</DialogTitle>
          <DialogDescription className="sr-only">
            Explains search, category and brand lists, price, stock filters, and reset.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Search</span> matches part name, brand, part
            number, and URL slug — useful when you already know what you are looking for.
          </p>
          <p>
            <span className="font-medium text-foreground">Category</span> and{" "}
            <span className="font-medium text-foreground">Brand</span> lists are built from{" "}
            <span className="text-foreground">this catalog only</span>: they show labels that exist on
            parts currently published by suppliers (admins). They are not an exhaustive list of every
            category or brand in the industry — only what is stocked here.
          </p>
          <p>
            <span className="font-medium text-foreground">Max price</span> hides parts above that SAR
            amount. <span className="font-medium text-foreground">Stock status</span> narrows by
            availability (including optional out-of-stock SKUs when you turn that filter on).
          </p>
          <p>
            Use <span className="font-medium text-foreground">Reset filters</span> to clear everything
            and start over.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
