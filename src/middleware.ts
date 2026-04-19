import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side guard for /admin (except login): asks PHP `auth/me.php` with forwarded cookies.
 * Defense in depth with `AdminAccessGate`; PHP remains authority for role + session.
 */
function phpOrigin(): string {
  return process.env.PHP_BACKEND_URL ?? "http://127.0.0.1:8080";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const cookie = request.headers.get("cookie") ?? "";

  const checkAdmin = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${phpOrigin()}/auth/me.php`, {
        headers: { cookie },
        cache: "no-store",
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { authenticated?: boolean };
      return data.authenticated === true;
    } catch {
      return false;
    }
  };

  if (pathname === "/admin/login") {
    if (await checkAdmin()) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!(await checkAdmin())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
