"use client";

import * as React from "react";
import type { AdminOrderDetail, AdminOrderSummaryRow } from "@/lib/catalog-fetch";
import { phpBrowserUrl } from "@/lib/php-backend";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SarCurrency } from "@/components/site/sar-currency";
import { CatalogPartImage } from "@/components/site/catalog-part-image";
import { resolvePartImageSrc } from "@/lib/catalog/resolve-part-image";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

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

export function AdminOrdersPanel({ initial }: { initial: AdminOrderSummaryRow[] }) {
  const [orders, setOrders] = React.useState(initial);
  const [q, setQ] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);

  React.useEffect(() => {
    setOrders(initial);
  }, [initial]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        o.userEmail.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.userId.toLowerCase().includes(s)
    );
  }, [orders, q]);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const res = await fetch(phpBrowserUrl("admin/order.php"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) return;
      const nowIso = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, updatedAt: nowIso } : o))
      );
      setDetail((d) => (d && d.id === id ? { ...d, status, updatedAt: nowIso } : d));
    } finally {
      setBusyId(null);
    }
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(phpBrowserUrl(`admin/order.php?id=${encodeURIComponent(id)}`), {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setDetail(null);
        return;
      }
      const data = (await res.json()) as { order?: AdminOrderDetail };
      setDetail(data.order ?? null);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <Input
          placeholder="Search id, email, customer…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No orders match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="align-top">
                    <p className="font-mono text-xs font-medium text-foreground">{o.id}</p>
                    <p className="text-xs text-muted-foreground">{formatWhen(o.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{o.itemCount} line(s)</p>
                  </TableCell>
                  <TableCell className="align-top text-sm">
                    <p className="font-medium text-foreground">{o.customerName || "—"}</p>
                    <p className="text-xs text-muted-foreground">{o.userEmail}</p>
                  </TableCell>
                  <TableCell className="align-top">
                    <SarCurrency amount={o.total} className="text-sm font-semibold text-foreground" />
                  </TableCell>
                  <TableCell className="align-top">
                    <Select
                      value={o.status}
                      onValueChange={(v) => void updateStatus(o.id, v)}
                      disabled={busyId === o.id}
                    >
                      <SelectTrigger className="h-9 w-[160px] border-border bg-background capitalize">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {statusLabel(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-border"
                      onClick={() => void openDetail(o.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Order</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {detail ? (
                <>
                  <span className="font-mono text-foreground">{detail.id}</span> ·{" "}
                  {formatWhen(detail.createdAt)}
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
              <div className="text-sm">
                <p className="font-medium text-foreground">Account</p>
                <p className="text-muted-foreground">{detail.userEmail}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{detail.userId || "—"}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">Contact (checkout form)</p>
                <p className="text-muted-foreground">{detail.customerName}</p>
                <p className="text-muted-foreground">{detail.customer?.email}</p>
                <p className="text-muted-foreground">{detail.customer?.phone}</p>
              </div>
              <Separator className="bg-border" />
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
                      {[
                        detail.shipping.line1,
                        detail.shipping.line2,
                        detail.shipping.city,
                        detail.shipping.state,
                        detail.shipping.postal,
                      ]
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
    </div>
  );
}
