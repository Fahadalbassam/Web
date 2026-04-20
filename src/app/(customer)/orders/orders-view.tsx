"use client";

import * as React from "react";
import Link from "next/link";
import { PageSection } from "@/components/site/page-section";
import { PageIntro } from "@/components/site/page-intro";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SarCurrency } from "@/components/site/sar-currency";
import { CatalogPartImage } from "@/components/site/catalog-part-image";
import { resolvePartImageSrc } from "@/lib/catalog/resolve-part-image";
import { phpBrowserUrl } from "@/lib/php-backend";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { useStorefrontAuthModal } from "@/providers/storefront-auth-modal-provider";

type OrderSummary = {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  status: string;
  total: number;
  itemCount: number;
};

type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type OrderDetail = {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string | null;
  updatedAt: string | null;
  items: OrderItem[];
  shipping: Record<string, string>;
  customer: Record<string, string>;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function OrdersView() {
  const { isLoggedIn, hydrated } = useCustomerAuth();
  const { openLogin } = useStorefrontAuthModal();
  const [orders, setOrders] = React.useState<OrderSummary[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(phpBrowserUrl("orders/mine.php"), {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = (await res.json()) as { orders?: OrderSummary[] };
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isLoggedIn && hydrated) void load();
  }, [isLoggedIn, hydrated, load]);

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(phpBrowserUrl(`orders/detail.php?id=${encodeURIComponent(id)}`), {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setDetail(null);
        return;
      }
      const data = (await res.json()) as { order?: OrderDetail };
      setDetail(data.order ?? null);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <PageSection className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <PageIntro title="Orders" description="Loading your session…" />
        </div>
      </PageSection>
    );
  }

  if (!isLoggedIn) {
    return (
      <PageSection className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <PageIntro
            title="Orders"
            description="Sign in to view orders placed with your Gulf Parts Co account."
          />
          <Button type="button" className="mt-8" onClick={() => openLogin("/orders")}>
            Sign in
          </Button>
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection className="py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <PageIntro
          title="Orders"
          description="Your recent orders from checkout. Open a row to inspect line items and shipping."
        />
        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            No orders yet — when you check out, they will appear here.
          </p>
        ) : (
          <div className="mt-10 space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-foreground">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{formatWhen(o.createdAt)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{o.itemCount} line(s)</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="bg-secondary capitalize text-secondary-foreground">
                    {statusLabel(o.status)}
                  </Badge>
                  <SarCurrency amount={o.total} className="text-sm font-semibold text-foreground" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border"
                    type="button"
                    onClick={() => void openDetail(o.id)}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Separator className="my-10 bg-border" />
        <div className="text-sm text-muted-foreground">
          Need help with an order?{" "}
          <Link href="/support" className="font-medium text-primary hover:underline">
            Contact support
          </Link>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Order details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {detail ? (
                <>
                  <span className="font-mono text-foreground">{detail.id}</span> · {formatWhen(detail.createdAt)}
                </>
              ) : (
                "Loading…"
              )}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : detail ? (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="capitalize">
                  {statusLabel(detail.status)}
                </Badge>
              </div>
              <div className="space-y-3">
                {detail.items.map((it) => (
                  <div key={`${detail.id}-${it.slug}-${it.productId}`} className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      <CatalogPartImage
                        src={resolvePartImageSrc(it.image)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium text-foreground">{it.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ×{it.quantity} · <SarCurrency amount={it.unitPrice} className="inline text-xs" /> each
                      </p>
                      <SarCurrency amount={it.lineTotal} className="text-sm font-semibold text-foreground" />
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <SarCurrency amount={detail.subtotal} className="font-semibold text-foreground" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <SarCurrency amount={detail.total} className="font-semibold text-foreground" />
              </div>
              {detail.shipping && Object.keys(detail.shipping).length > 0 ? (
                <>
                  <Separator className="bg-border" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Shipping</p>
                    <p className="mt-1 text-muted-foreground">
                      {[detail.shipping.line1, detail.shipping.line2, detail.shipping.city, detail.shipping.state, detail.shipping.postal]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-destructive">Could not load this order.</p>
          )}
        </DialogContent>
      </Dialog>
    </PageSection>
  );
}
