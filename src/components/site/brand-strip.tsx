import { coveredBrandMarks } from "@/lib/mock/brands";
import { cn } from "@/lib/utils";

/**
 * Horizontal mark strip for “Brands we cover”.
 * Swap each `<Icon />` for `next/image` keyed by `id` when logo assets exist.
 */
export function BrandStrip({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div
        className="relative overflow-hidden py-2"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="mx-auto flex w-max max-w-full flex-nowrap items-center justify-center gap-4 px-4 sm:gap-6 sm:px-8 md:gap-8 transform-[perspective(920px)_rotateY(-6.5deg)] origin-[18%_50%]"
        >
          {coveredBrandMarks.map((b, i) => {
            const Icon = b.Icon;
            const t = i / Math.max(1, coveredBrandMarks.length - 1);
            return (
              <div
                key={b.id}
                className="flex shrink-0 items-center justify-center"
                style={{
                  transform: `translateZ(${-10 + t * 12}px) scale(${0.88 + t * 0.12})`,
                  opacity: 0.45 + t * 0.5,
                }}
              >
                <Icon
                  className="size-6 text-muted-foreground/90 sm:size-7"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <span className="sr-only">{b.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
