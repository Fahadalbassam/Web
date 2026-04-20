import Image from "next/image";
import Link from "next/link";
import type { Part } from "@/lib/catalog/part";
import { resolvePartImageSrc } from "@/lib/catalog/resolve-part-image";
import { SarCurrency } from "@/components/site/sar-currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function stockBadge(status: Part["stockStatus"]) {
  switch (status) {
    case "in_stock":
      return (
        <Badge
          variant="outline"
          className="border-border/80 bg-muted/40 font-medium text-foreground dark:bg-muted/25"
        >
          In stock
        </Badge>
      );
    case "low_stock":
      return (
        <Badge variant="outline" className="border-border text-muted-foreground">
          Low stock
        </Badge>
      );
    case "out_of_stock":
      return <Badge variant="destructive">Out of stock</Badge>;
  }
}

export function ProductCard({
  part,
  className,
}: {
  part: Part;
  className?: string;
}) {
  const img = resolvePartImageSrc(part.image);
  const detailHref = `/shop/${part.slug}`;

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border-border bg-card text-card-foreground shadow-none transition-[box-shadow,transform] hover:shadow-md dark:hover:shadow-none dark:hover:ring-1 dark:hover:ring-border",
        className
      )}
    >
      <CardHeader className="p-0">
        <Link href={detailHref} className="block">
          <div className="relative aspect-[4/3] bg-white">
            <Image
              src={img}
              alt={part.name}
              fill
              className="transition-transform duration-300 group-hover:scale-[1.02] object-cover"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {part.brand}
            </p>
            <Link
              href={detailHref}
              className="mt-1 line-clamp-2 text-sm font-semibold text-foreground decoration-transparent underline-offset-4 hover:underline"
            >
              {part.name}
            </Link>
          </div>
          {stockBadge(part.stockStatus)}
        </div>
        <p className="font-mono text-xs text-muted-foreground">{part.partNumber}</p>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between border-t border-border bg-muted/15 px-4 py-3 dark:bg-muted/10">
        <SarCurrency amount={part.price} className="text-base font-semibold text-foreground" />
        <Link
          href={detailHref}
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Details
        </Link>
      </CardFooter>
    </Card>
  );
}
