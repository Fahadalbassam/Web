"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  className?: string;
};

export function HeroCarousel({ slides, className }: HeroCarouselProps) {
  const limited = slides.slice(0, 3);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className={cn("space-y-5", className)}>
      <Carousel className="w-full" opts={{ loop: true }} setApi={setApi}>
        <CarouselContent className="items-stretch">
          {limited.map((slide) => (
            <CarouselItem key={slide.id} className="flex">
              <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-2 md:h-[28rem] md:min-h-[28rem]">
                <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.05fr_0.95fr] md:grid-rows-1">
                  <div className="flex flex-col justify-center px-6 py-8 sm:px-10 md:h-full md:min-h-0 md:overflow-y-auto md:py-10 md:pr-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Precision fitment
                    </p>
                    <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {slide.subtitle}
                    </p>
                    <div className="mt-8 shrink-0">
                      <Button asChild size="lg">
                        <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="relative min-h-[220px] shrink-0 md:h-full md:min-h-0">
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      priority={slide.id === limited[0]?.id}
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent md:bg-gradient-to-l md:from-background/25" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-center gap-4 px-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Previous slide"
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex items-center justify-center gap-2">
          {limited.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-pressed={i === current}
              className={cn(
                "h-2 rounded-full transition-[width,background-color,opacity] duration-300",
                i === current
                  ? "w-7 bg-foreground opacity-90"
                  : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/55"
              )}
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Next slide"
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
