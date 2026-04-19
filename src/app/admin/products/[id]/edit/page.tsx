import { notFound } from "next/navigation";
import { fetchProductByIdAdmin } from "@/lib/catalog-fetch";
import { AdminProductForm } from "@/components/admin/admin-product-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  let part = null;
  try {
    part = await fetchProductByIdAdmin(id);
  } catch {
    notFound();
  }
  if (!part) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {part.name} · <span className="font-mono text-xs">{part.partNumber}</span>
        </p>
      </div>
      <AdminProductForm mode="edit" productId={part.id} initial={part} />
    </div>
  );
}
