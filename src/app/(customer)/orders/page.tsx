import type { Metadata } from "next";
import Link from "next/link";
import { PageSection } from "@/components/site/page-section";
import { PageIntro } from "@/components/site/page-intro";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Orders" };

const mockOrders = [
  { id: "NL-10432", date: "Apr 2, 2026", total: 186.4, status: "Shipped" as const },
  { id: "NL-10308", date: "Mar 18, 2026", total: 64.25, status: "Processing" as const },
];

export default function OrdersPage() {
  return (
    <PageSection className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <PageIntro
          title="Orders"
          description="Order history is mocked for the beta. Sign in from the navbar to unlock the account menu."
        />
        <div className="mt-10 space-y-4">
          {mockOrders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">{o.id}</p>
                <p className="text-xs text-muted-foreground">{o.date}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  {o.status}
                </Badge>
                <span className="text-sm font-semibold tabular-nums">${o.total.toFixed(2)}</span>
                <Button size="sm" variant="outline" className="border-border" type="button" disabled>
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-10 bg-border" />
        <div className="text-sm text-muted-foreground">
          Need help with an order?{" "}
          <Link href="/support" className="font-medium text-primary hover:underline">
            Contact support
          </Link>
        </div>
      </div>
    </PageSection>
  );
}
