import type { Part } from "@/lib/catalog/part";
import { LOW_STOCK_QTY_MAX, effectiveStockQty } from "@/lib/catalog/part";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StorefrontStockBadge({
  part,
  className,
  size = "default",
}: {
  part: Part;
  className?: string;
    size?: "default" | "lg";
}) {
  const qty = effectiveStockQty(part);
  const lowCls =
    "border-amber-500/55 bg-amber-500/10 font-medium text-amber-950 dark:text-amber-100";
  const okCls = "border-border/80 bg-muted/40 font-medium text-foreground dark:bg-muted/25";

  if (qty !== null) {
    if (qty <= 0) {
      return (
        <Badge variant="destructive" className={cn(className, size === "lg" && "text-sm")}>
          Out of stock
        </Badge>
      );
    }
    const low = qty <= LOW_STOCK_QTY_MAX;
    return (
      <Badge
        variant="outline"
        className={cn(low ? lowCls : okCls, className, size === "lg" && "text-sm")}
      >
        {qty} left
      </Badge>
    );
  }

  switch (part.stockStatus) {
    case "in_stock":
      return (
        <Badge
          variant="outline"
          className={cn(
            "border-border/80 bg-muted/40 font-medium text-foreground dark:bg-muted/25",
            className,
            size === "lg" && "text-sm"
          )}
        >
          In stock
        </Badge>
      );
    case "low_stock":
      return (
        <Badge variant="outline" className={cn("border-border", className, size === "lg" && "text-sm")}>
          Low stock
        </Badge>
      );
    case "out_of_stock":
      return (
        <Badge variant="destructive" className={cn(className, size === "lg" && "text-sm")}>
          Out of stock
        </Badge>
      );
  }
}
