import { headers } from "next/headers";

export function phpInternalOrigin(): string {
  return process.env.PHP_BACKEND_URL ?? "http://127.0.0.1:8080";
}

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
