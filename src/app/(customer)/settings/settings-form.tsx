"use client";

import * as React from "react";
import { PageIntro } from "@/components/site/page-intro";
import { PageSection } from "@/components/site/page-section";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SettingsForm() {
  const [saved, setSaved] = React.useState(false);

  return (
    <PageSection className="py-12 md:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <PageIntro
          title="Account settings"
          description="Profile fields mirror checkout styling — persistence ships with the backend."
        />
        <form
          className="mt-10 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            <div className="mt-4 grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" defaultValue="Alex Driver" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  defaultValue="alex@example.com"
                  className="bg-background"
                />
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card p-6 text-card-foreground">
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Email alerts for back-in-stock and shipment updates — UI placeholder.
            </p>
            <Separator className="my-4 bg-border" />
            <Button type="button" variant="secondary" disabled>
              Save preferences
            </Button>
          </section>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Save changes</Button>
            {saved ? (
              <span className="text-sm text-muted-foreground">Saved locally (demo).</span>
            ) : null}
          </div>
        </form>
      </div>
    </PageSection>
  );
}
