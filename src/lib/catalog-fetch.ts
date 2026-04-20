import type { Part } from "@/lib/catalog/part";
import { phpServerFetch } from "@/lib/php-server-fetch";

export async function fetchPublishedParts(limit?: number): Promise<Part[]> {
  const qs =
    limit != null
      ? `/catalog/products.php?published=1&limit=${limit}`
      : `/catalog/products.php?published=1`;
  try {
    const res = await phpServerFetch(qs, { skipCookie: true });
    if (!res.ok) return [];
    const data = (await res.json()) as { parts?: Part[] };
    return data.parts ?? [];
  } catch {
    return [];
  }
}

export async function fetchPartBySlug(slug: string): Promise<Part | null> {
  try {
    const res = await phpServerFetch(
      `/catalog/product.php?slug=${encodeURIComponent(slug)}`,
      { skipCookie: true }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { part?: Part };
    return data.part ?? null;
  } catch {
    return null;
  }
}

export async function fetchRelatedParts(slug: string, limit = 4): Promise<Part[]> {
  try {
    const res = await phpServerFetch(
      `/catalog/related.php?slug=${encodeURIComponent(slug)}&limit=${limit}`,
      { skipCookie: true }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { parts?: Part[] };
    return data.parts ?? [];
  } catch {
    return [];
  }
}

export async function fetchAllProductsAdmin(): Promise<Part[]> {
  try {
    const res = await phpServerFetch(`/admin/products.php`);
    if (!res.ok) return [];
    const data = (await res.json()) as { parts?: Part[] };
    return data.parts ?? [];
  } catch {
    return [];
  }
}

export async function fetchProductByIdAdmin(id: string): Promise<Part | null> {
  try {
    const res = await phpServerFetch(`/admin/product.php?id=${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { part?: Part };
    return data.part ?? null;
  } catch {
    return null;
  }
}

export type SupportTicketRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  userId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function fetchSupportTicketsAdmin(q?: string): Promise<SupportTicketRow[]> {
  const qs = q != null && q.trim() !== "" ? `?q=${encodeURIComponent(q.trim())}` : "";
  try {
    const res = await phpServerFetch(`/admin/support-tickets.php${qs}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { tickets?: SupportTicketRow[] };
    return data.tickets ?? [];
  } catch {
    return [];
  }
}
