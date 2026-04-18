import { AdminProductForm } from "@/components/admin/admin-product-form";

export default function AdminNewProductPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">New product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Shared admin form layout — persists when the API is ready.
        </p>
      </div>
      <AdminProductForm mode="create" />
    </div>
  );
}
