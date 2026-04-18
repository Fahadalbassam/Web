import type { HeroSlide } from "@/components/site/hero-carousel";

const heroImg = (seed: string) =>
  `https://picsum.photos/seed/hero-${seed}/1200/900`;

export const heroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "OEM-grade parts for daily drivers.",
    subtitle:
      "Filters, brakes, ignition, and driveline — curated for fitment and clarity.",
    ctaLabel: "Browse shop",
    ctaHref: "/shop",
    image: heroImg("garage"),
  },
  {
    id: "2",
    title: "Fitment-first checkout.",
    subtitle: "Compatibility callouts on every SKU help you buy once and install with confidence.",
    ctaLabel: "See catalog",
    ctaHref: "/shop",
    image: heroImg("engine"),
  },
  {
    id: "3",
    title: "Support that speaks mechanic.",
    subtitle: "Install intervals, torque specs, or returns — we are here for the beta.",
    ctaLabel: "Contact support",
    ctaHref: "/support",
    image: heroImg("support"),
  },
];
