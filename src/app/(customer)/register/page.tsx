"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageIntro } from "@/components/site/page-intro";
import { PageSection } from "@/components/site/page-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomerAuth } from "@/providers/customer-auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { registerAccount, isLoggedIn, hydrated } = useCustomerAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (hydrated && isLoggedIn) {
      router.replace("/");
    }
  }, [hydrated, isLoggedIn, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const r = await registerAccount(email, password);
    setPending(false);
    if (!r.ok) {
      setError(r.error ?? "Registration failed");
      return;
    }
    router.replace("/");
  };

  if (!hydrated) {
    return (
      <PageSection density="compact" className="pt-10 md:pt-14">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <PageIntro title="Create account" description="Loading…" />
        </div>
      </PageSection>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <>
      <PageSection density="compact" className="pt-10 md:pt-14">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <PageIntro
            title="Create account"
            description="Register with email and password. Passwords are hashed on the server; nothing sensitive is stored in plain text."
          />
        </div>
      </PageSection>
      <PageSection className="pt-0 pb-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password (min. 8 characters)</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background"
                disabled={pending}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
                Sign in from the header
              </Link>
            </p>
          </form>
        </div>
      </PageSection>
    </>
  );
}
