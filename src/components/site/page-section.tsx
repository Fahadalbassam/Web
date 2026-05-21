import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type PageSectionProps = ComponentProps<"section"> & {
    density?: "comfortable" | "compact";
};

export function PageSection({
  className,
  density = "comfortable",
  ...props
}: PageSectionProps) {
  return (
    <section
      className={cn(
        density === "comfortable" ? "py-14 md:py-20" : "py-10 md:py-14",
        className
      )}
      {...props}
    />
  );
}
