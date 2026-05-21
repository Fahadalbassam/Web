"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { brandLabelFromPublicPath } from "@/lib/brand-logo-utils";

type BrandStripProps = {
    logos: string[];
  className?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduce;
}

const edgeMask =
  "linear-gradient(90deg, transparent 0%, black 8%, black 90%, transparent 100%)";

function LogoSlot({
  src,
  indexInSet,
  setLength,
  priority,
}: {
  src: string;
  indexInSet: number;
  setLength: number;
  priority?: boolean;
}) {
  const t = setLength <= 1 ? 0.5 : indexInSet / (setLength - 1);
  const translateZ = -9 + t * 16;
  const scale = 0.9 + t * 0.1;
  const opacity = 0.58 + t * 0.38;

  return (
    <div
      className="relative h-9 w-19 shrink-0 sm:h-10 sm:w-22 md:h-11 md:w-24 lg:w-23"
      style={{
        transform: `translateZ(${translateZ}px) scale(${scale})`,
        opacity,
        transformStyle: "preserve-3d",
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 76px, (max-width: 1024px) 88px, 96px"
        className="object-contain select-none"
        draggable={false}
        priority={priority === true}
      />
      <span className="sr-only">{brandLabelFromPublicPath(src)}</span>
    </div>
  );
}

function LogoRow({
  logos,
  keyPrefix,
  priorityFirst,
}: {
  logos: string[];
  keyPrefix: string;
  priorityFirst?: boolean;
}) {
  const n = logos.length;
  return (
    <>
      {logos.map((src, i) => (
        <LogoSlot
          key={`${keyPrefix}-${src}-${i}`}
          src={src}
          indexInSet={i}
          setLength={n}
          priority={priorityFirst === true && i === 0}
        />
      ))}
    </>
  );
}

export function BrandStrip({ logos, className }: BrandStripProps) {
  const reduceMotion = usePrefersReducedMotion();

  if (logos.length === 0) {
    return (
      <div className={cn("w-full overflow-x-hidden", className)}>
        <div
          className="flex min-h-19 items-center justify-center rounded-lg border border-dashed border-border/40 bg-muted/10 py-8 dark:bg-muted/5"
          role="img"
          aria-label="Brand logos"
        >
          <span className="sr-only">No image files found in public images brand logos folder.</span>
        </div>
      </div>
    );
  }

  const stage = (
    <div
      className="relative px-2 py-3 sm:px-4 md:py-4"
      style={{
        maskImage: edgeMask,
        WebkitMaskImage: edgeMask,
      }}
    >
      
      <div
        className="mx-auto max-w-6xl overflow-x-hidden perspective-[1180px]"
        style={{ perspectiveOrigin: "50% 55%" }}
      >
        <div
          className={cn(
            "origin-[14%_50%]",
            !reduceMotion && "will-change-transform transform-3d"
          )}
          style={
            reduceMotion
              ? undefined
              : {
                  transform: "rotateX(2deg) rotateY(-6deg)",
                  transformStyle: "preserve-3d",
                }
          }
        >
          {reduceMotion ? (
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 px-4 sm:gap-x-10 md:gap-x-12">
              <LogoRow logos={logos} keyPrefix="still" priorityFirst />
            </div>
          ) : (
            <div className="brand-strip-runner-animated flex w-max will-change-transform">
              
              <div className="flex shrink-0 items-center gap-7 pr-12 sm:gap-9 sm:pr-14 md:gap-11 md:pr-16">
                <LogoRow logos={logos} keyPrefix="a" priorityFirst />
              </div>
              <div
                className="flex shrink-0 items-center gap-7 pr-12 sm:gap-9 sm:pr-14 md:gap-11 md:pr-16"
                aria-hidden
              >
                <LogoRow logos={logos} keyPrefix="b" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("w-full overflow-x-hidden", className)}>{stage}</div>
  );
}
