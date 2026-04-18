import Link from "next/link";

const cols = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All parts" },
      { href: "/shop?category=Brakes", label: "Brakes" },
      { href: "/shop?category=Filters", label: "Filters" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/support", label: "Support" },
      { href: "/orders", label: "Orders" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="font-heading text-lg font-semibold">Gulf Parts Co</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              OEM-grade and performance parts for daily drivers and enthusiasts.
              Beta storefront — mock checkout for demos.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {c.title}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-foreground/90 hover:text-foreground hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Gulf Parts Co. All rights reserved.</span>
          <span className="text-muted-foreground/80">
            Customer UI only — admin sign-in lives at{" "}
            <Link href="/admin/login" className="text-foreground hover:underline">
              /admin/login
            </Link>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}
