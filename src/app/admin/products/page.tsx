import Link from "next/link";
import { mockParts } from "@/lib/mock/parts";
import { Button } from "@/components/ui/button";
import { AdminProductsDataTable } from "@/components/admin/admin-products-data-table";

export default function AdminProductsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data table over mock SKUs — search, paginate, and open actions (edit / delete are UI-only).
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>
      <AdminProductsDataTable initialParts={mockParts} />
    </div>
  );
}
