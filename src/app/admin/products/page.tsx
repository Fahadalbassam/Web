import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminProductsDataTable } from "@/components/admin/admin-products-data-table";
import { fetchAllProductsAdmin } from "@/lib/catalog-fetch";

export default async function AdminProductsPage() {
  let parts = [] as Awaited<ReturnType<typeof fetchAllProductsAdmin>>;
  try {
    parts = await fetchAllProductsAdmin();
  } catch {
    parts = [];
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live inventory — type in search to query PHP (`admin/products.php?q=`), paginate, edit, and delete on the server.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>
      <AdminProductsDataTable initialParts={parts} />
    </div>
  );
}
