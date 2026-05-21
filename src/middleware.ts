import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  const checkStorefrontSession = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${phpOrigin()}/auth/customer-me.php`, {
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

  const redirectNonAdminAway = async () => {
    const signedInStorefront = await checkStorefrontSession();
    const dest = signedInStorefront ? "/" : "/?login=1";
    return NextResponse.redirect(new URL(dest, request.url));
  };

  if (pathname === "/admin/login") {
    if (await checkAdmin()) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (await checkStorefrontSession()) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL("/?login=1", request.url));
  }

  if (!(await checkAdmin())) {
    return redirectNonAdminAway();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
