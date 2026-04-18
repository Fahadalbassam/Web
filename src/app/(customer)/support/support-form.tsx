"use client";

import * as React from "react";
import { PageIntro } from "@/components/site/page-intro";
import { PageSection } from "@/components/site/page-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupportPageContent() {
  const [sent, setSent] = React.useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageSection density="compact" className="pt-10 md:pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PageIntro
            title="Support"
            description="Reach the beta team for fitment checks, warranty questions, or account help. This form is UI-only."
          />
        </div>
      </PageSection>

      <PageSection className="pt-0 pb-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-xl border border-border bg-card p-6 text-card-foreground md:p-8">
            {sent ? (
              <p className="text-sm text-muted-foreground">
                Thanks — your message is captured locally for this demo. We will wire delivery later.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-name">Full name</Label>
                    <Input id="support-name" required className="bg-background" autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Email</Label>
                    <Input
                      id="support-email"
                      type="email"
                      required
                      className="bg-background"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-subject">Subject</Label>
                  <Input id="support-subject" required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-message">Message</Label>
                  <Textarea id="support-message" required rows={5} className="bg-background" />
                </div>
                <Button type="submit">Send message</Button>
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
