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
import { useAdminSession } from "@/providers/admin-session-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminSession();
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    login();
    router.push("/admin/dashboard");
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
            Separate from the customer account modal on the storefront. Use any values for this
            milestone demo — submit stores a mock admin session in the browser.
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
                placeholder="manager@gulfparts.co"
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
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <p className="text-xs text-muted-foreground">
              Validation and API wiring can replace this shell without changing the layout.
            </p>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="submit" form="admin-login-form" className="w-full sm:w-auto">
            Sign in
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
