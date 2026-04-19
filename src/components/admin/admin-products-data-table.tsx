"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Part, StockStatus } from "@/lib/catalog/part";
import { resolvePartImageSrc } from "@/lib/catalog/resolve-part-image";
import { SarCurrency } from "@/components/site/sar-currency";
import { phpBrowserUrl } from "@/lib/php-backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function displayStockQty(part: Part): number {
  if (typeof part.stockQty === "number") return part.stockQty;
  return 0;
}

function statusBadgeVariant(
  status: StockStatus
): React.ComponentProps<typeof Badge>["variant"] {
  if (status === "in_stock") return "secondary";
  if (status === "low_stock") return "outline";
  return "destructive";
}

function ProductActionsCell({
  product,
  onDeleted,
}: {
  product: Part;
  onDeleted: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        phpBrowserUrl(`admin/product.php?id=${encodeURIComponent(product.id)}`),
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) onDeleted();
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label={`Actions for ${product.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44 border-border bg-popover">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2">
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {product.name} ({product.partNumber}) will be deleted from the catalog and removed from the
              storefront.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleting} onClick={() => void remove()}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AdminProductsDataTable({ initialParts }: { initialParts: Part[] }) {
  const router = useRouter();
  const [data, setData] = React.useState(initialParts);
  const [query, setQuery] = React.useState("");
  const [serverSearchLoading, setServerSearchLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query.trim()) {
      setData(initialParts);
    }
  }, [initialParts, query]);

  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      return;
    }
    const handle = window.setTimeout(() => {
      void (async () => {
        setServerSearchLoading(true);
        try {
          const res = await fetch(
            phpBrowserUrl(`admin/products.php?q=${encodeURIComponent(q)}`),
            { credentials: "include", cache: "no-store" }
          );
          if (!res.ok) return;
          const j = (await res.json()) as { parts?: Part[] };
          setData(j.parts ?? []);
        } finally {
          setServerSearchLoading(false);
        }
      })();
    }, 350);
    return () => window.clearTimeout(handle);
  }, [query]);

  const columns = React.useMemo<ColumnDef<Part>[]>(
    () => [
      {
        id: "thumb",
        header: "",
        cell: ({ row }) => (
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            <Image
              src={resolvePartImageSrc(row.original.image)}
              alt={row.original.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="max-w-[220px]">
            <p className="truncate font-medium text-foreground">{row.original.name}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{row.original.partNumber}</p>
          </div>
        ),
      },
      { accessorKey: "brand", header: "Brand" },
      { accessorKey: "category", header: "Category" },
      {
        id: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">{displayStockQty(row.original)}</span>
        ),
      },
      {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => (
          <div className="flex justify-end text-foreground">
            <SarCurrency amount={row.original.price} />
          </div>
        ),
      },
      {
        accessorKey: "stockStatus",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant(row.original.stockStatus)} className="capitalize">
            {row.original.stockStatus.replace("_", " ")}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ProductActionsCell
              product={row.original}
              onDeleted={() => {
                setData((rows) => rows.filter((p) => p.id !== row.original.id));
                router.refresh();
              }}
            />
          </div>
        ),
      },
    ],
    [router]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            table.setPageIndex(0);
          }}
          placeholder="Search name, brand, category, or part #…"
          className="max-w-md bg-background"
          aria-label="Search products"
        />
        <p className="text-sm text-muted-foreground">
          {serverSearchLoading ? (
            <span className="text-muted-foreground">Searching catalog…</span>
          ) : (
            <>
              Showing <span className="font-medium text-foreground">{data.length}</span>{" "}
              {query.trim() ? "matches" : "products"}
            </>
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {query.trim() ? "No products match this search." : "No products in the catalog yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.previousPage();
                }}
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-40" : undefined}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  table.nextPage();
                }}
                className={!table.getCanNextPage() ? "pointer-events-none opacity-40" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
