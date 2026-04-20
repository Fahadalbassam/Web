import { fetchSupportTicketsAdmin } from "@/lib/catalog-fetch";
import { AdminSupportTicketsPanel } from "@/components/admin/admin-support-tickets-panel";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  let tickets = [] as Awaited<ReturnType<typeof fetchSupportTicketsAdmin>>;
  try {
    tickets = await fetchSupportTicketsAdmin();
  } catch {
    tickets = [];
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Support tickets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions from the public support form. Status updates save to MongoDB.
        </p>
      </div>
      <AdminSupportTicketsPanel initial={tickets} />
    </div>
  );
}
