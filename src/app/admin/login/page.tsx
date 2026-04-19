"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { phpBrowserUrl } from "@/lib/php-backend";
import { useAdminSession } from "@/providers/admin-session-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refresh, isAdminAuthenticated, hydrated } = useAdminSession();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (hydrated && isAdminAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [hydrated, isAdminAuthenticated, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("adminId") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    try {
      const res = await fetch(phpBrowserUrl("auth/login.php"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(body.error ?? "Invalid credentials");
        setPending(false);
        return;
      }

      await refresh();
      router.push("/admin/dashboard");
    } catch {
      setError("Could not reach the sign-in service. Try again or contact support.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Staff access
          </p>
          <CardTitle className="font-heading text-2xl">Admin sign in</CardTitle>
          <CardDescription>
            Staff credentials are verified securely using a browser session cookie (HttpOnly, SameSite=Lax).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="admin-login-form" onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-id">Admin ID or email</Label>
              <Input
                id="admin-id"
                name="adminId"
                type="text"
                required
                autoComplete="username"
                className="bg-background"
                placeholder="you@example.com"
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="bg-background"
                placeholder="••••••••"
                disabled={pending}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <p className="text-xs text-muted-foreground">
              Auth errors stay generic — no account hints. JavaScript validation can extend this form
              without changing layout.
            </p>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="submit" form="admin-login-form" className="w-full sm:w-auto" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </CardFooter>
      </Card>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="text-foreground hover:underline">
          ← Back to store
        </Link>
      </p>
    </div>
  );
}
