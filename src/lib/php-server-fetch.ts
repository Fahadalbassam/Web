import { headers } from "next/headers";

/** Origin where the PHP built-in server (or Apache) listens — same target as Next rewrites. */
export function phpInternalOrigin(): string {
  return process.env.PHP_BACKEND_URL ?? "http://127.0.0.1:8080";
}

/**
 * Server-side fetch to PHP (RSC / route handlers). Forwards `Cookie` by default so admin session works.
 */
export async function phpServerFetch(
  pathnameWithQuery: string,
  init?: RequestInit & { skipCookie?: boolean }
): Promise<Response> {
  const path = pathnameWithQuery.startsWith("/") ? pathnameWithQuery : `/${pathnameWithQuery}`;
  const url = `${phpInternalOrigin()}${path}`;

  const h = new Headers(init?.headers);
  if (!init?.skipCookie) {
    const cookie = (await headers()).get("cookie");
    if (cookie) {
      h.set("cookie", cookie);
    }
  }

  return fetch(url, {
    ...init,
    headers: h,
    cache: "no-store",
  });
}
