import { fetchAdminOrders } from "@/lib/catalog-fetch";
import { AdminOrdersPanel } from "@/components/admin/admin-orders-panel";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders = [] as Awaited<ReturnType<typeof fetchAdminOrders>>;
  try {
    orders = await fetchAdminOrders();
  } catch {
    orders = [];
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Checkout orders stored in MongoDB. Update status for fulfillment workflow; customers see their own orders on{" "}
          <span className="text-foreground">/orders</span>.
        </p>
      </div>
      <AdminOrdersPanel initial={orders} />
    </div>
  );
}
