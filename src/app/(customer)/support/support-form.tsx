"use client";

import * as React from "react";
import { PageIntro } from "@/components/site/page-intro";
import { PageSection } from "@/components/site/page-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { phpBrowserUrl } from "@/lib/php-backend";
import { useCustomerAuth } from "@/providers/customer-auth-provider";

export function SupportPageContent() {
  const { userEmail, hydrated } = useCustomerAuth();
  const [sent, setSent] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      subject: String(fd.get("subject") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };

    try {
      const res = await fetch(phpBrowserUrl("support/ticket.php"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send message");
        setPending(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Could not reach support. Try again later.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PageSection density="compact" className="pt-10 md:pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PageIntro
            title="Support"
            description="Reach the team for fitment checks, warranty questions, or account help. Messages are stored securely and reviewed in admin."
          />
        </div>
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-xl border border-border bg-card p-6 text-card-foreground md:p-8">
            {sent ? (
              <p className="text-sm text-muted-foreground">
                Thanks — your message was submitted. We will get back to you at the email you provided.
              </p>
            ) : (
              <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-name">Full name</Label>
                    <Input
                      id="support-name"
                      name="name"
                      required
                      className="bg-background"
                      autoComplete="name"
                      disabled={pending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Email</Label>
                    <Input
                      id="support-email"
                      name="email"
                      type="email"
                      required
                      className="bg-background"
                      autoComplete="email"
                      defaultValue={hydrated && userEmail ? userEmail : undefined}
                      disabled={pending}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-subject">Subject</Label>
                  <Input id="support-subject" name="subject" required className="bg-background" disabled={pending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-message">Message</Label>
                  <Textarea
                    id="support-message"
                    name="message"
                    required
                    rows={5}
                    className="bg-background"
                    disabled={pending}
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" disabled={pending}>
                  {pending ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface-2/50 p-6">
              <h2 className="text-sm font-semibold text-foreground">Contact</h2>
              <dl className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </dt>
                  <dd className="mt-1 text-foreground">support@gulfparts.co</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-1 text-foreground">+1 (555) 014-2271</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Hours
                  </dt>
                  <dd className="mt-1">Mon–Fri, 9a–6p ET</dd>
                </div>
              </dl>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-surface-2 via-surface-3 to-surface-2">
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">Detroit logistics hub (map placeholder)</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      1200 Industrial Ave · Detroit, MI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
