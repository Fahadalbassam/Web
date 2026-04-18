import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTASectionProps = {
  title: string;
  description: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  variant?: "default" | "muted";
  className?: string;
};

export function CTASection({
  title,
  description,
  primary,
  secondary,
  variant = "default",
  className,
}: CTASectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border px-6 py-10 sm:px-10",
        variant === "muted"
          ? "bg-surface-2/80"
          : "bg-gradient-to-br from-surface-2 via-card to-surface-2",
        className
      )}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary ? (
            <Button asChild variant="outline" size="lg" className="border-border bg-background/60">
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
