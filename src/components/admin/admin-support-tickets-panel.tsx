"use client";

import * as React from "react";
import type { SupportTicketRow } from "@/lib/catalog-fetch";
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

const STATUSES = ["open", "in_progress", "closed"] as const;

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AdminSupportTicketsPanel({ initial }: { initial: SupportTicketRow[] }) {
  const [tickets, setTickets] = React.useState(initial);
  const [q, setQ] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTickets(initial);
  }, [initial]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tickets;
    return tickets.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        t.email.toLowerCase().includes(s) ||
        t.subject.toLowerCase().includes(s) ||
        t.message.toLowerCase().includes(s)
    );
  }, [tickets, q]);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const res = await fetch(phpBrowserUrl("admin/support-tickets.php"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) return;
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t))
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <Input
          placeholder="Search name, email, subject…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">When</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No tickets match.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="align-top text-xs text-muted-foreground">
                    {formatWhen(t.createdAt)}
                  </TableCell>
                  <TableCell className="align-top">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                    {t.userId ? (
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">user {t.userId}</p>
                    ) : null}
                    <p className="mt-2 max-w-md whitespace-pre-wrap text-xs text-muted-foreground">
                      {t.message}
                    </p>
                  </TableCell>
                  <TableCell className="align-top text-sm">{t.subject}</TableCell>
                  <TableCell className="align-top">
                    <Select
                      value={t.status}
                      disabled={busyId === t.id}
                      onValueChange={(v) => updateStatus(t.id, v)}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
