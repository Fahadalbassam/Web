import { notFound } from "next/navigation";
import { mockParts } from "@/lib/mock/parts";
import { AdminProductForm } from "@/components/admin/admin-product-form";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return mockParts.map((p) => ({ id: p.id }));
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const part = mockParts.find((p) => p.id === id);
  if (!part) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {part.name} · <span className="font-mono text-xs">{part.partNumber}</span>
        </p>
      </div>
      <AdminProductForm mode="edit" initial={part} />
    </div>
  );
}
