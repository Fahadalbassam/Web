import Link from "next/link";
import { HeroCarousel } from "@/components/site/hero-carousel";
import { PageSection } from "@/components/site/page-section";
import { SectionHeading } from "@/components/site/section-heading";
import { PageIntro } from "@/components/site/page-intro";
import { BrandStrip } from "@/components/site/brand-strip";
import { ProductCard } from "@/components/site/product-card";
import { CTASection } from "@/components/site/cta-section";
import { Button } from "@/components/ui/button";
import { heroSlides } from "@/lib/mock/hero-slides";
import { mockParts } from "@/lib/mock/parts";

const featured = mockParts.slice(0, 4);

export default function HomePage() {
  return (
    <div>
      <PageSection density="compact" className="pt-6 pb-4 md:pt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <HeroCarousel slides={heroSlides} />
        </div>
      </PageSection>

      <PageSection density="compact" className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PageIntro
            title="Built for drivers who maintain."
            description="Proven brands, clear compatibility notes, and a calm checkout flow. This beta uses mock inventory — the experience is production-ready, the data is not."
          />
        </div>
      </PageSection>

      <PageSection density="compact" className="py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading align="center" title="Brands We Cover" className="max-w-xl" />
          <BrandStrip className="mt-8" />
        </div>
      </PageSection>

      <PageSection>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Featured"
              title="Latest arrivals"
              description="Same ProductCard component used across shop listings for visual consistency."
            />
            <Button asChild variant="outline" className="w-fit border-border bg-card">
              <Link href="/shop">View all parts</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.slug} part={p} />
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection density="compact">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <CTASection
            title="Need pads, filters, or a full service cart?"
            description="Search by category and brand, then refine by price and availability — all client-side for this milestone."
            primary={{ label: "Open shop", href: "/shop" }}
            secondary={{ label: "Browse support", href: "/support" }}
          />
        </div>
      </PageSection>

      <PageSection density="compact" className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <CTASection
            variant="muted"
            title="Installation questions or warranty paperwork?"
            description="Send a note — we will route it to the right specialist during the beta."
            primary={{ label: "Contact support", href: "/support" }}
          />
        </div>
      </PageSection>
    </div>
  );
}
