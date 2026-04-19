import type { LucideIcon } from "lucide-react";
import { Car, CircleDot, Cog, Gauge, Wrench } from "lucide-react";

/** Legacy placeholder marks — homepage strip now uses files under `public/images/brandlogos/` via `BrandStrip`. */
export type BrandMarkDef = {
  id: string;
  /** Reserved for real logos and a11y; not shown as the primary visual. */
  name: string;
  Icon: LucideIcon;
};

/** Slot order matches intended OEM/aftermarket logos (Toyota … Audi). */
export const coveredBrandMarks: BrandMarkDef[] = [
  { id: "toyota", name: "Toyota", Icon: Car },
  { id: "hyundai", name: "Hyundai", Icon: Cog },
  { id: "mitsubishi", name: "Mitsubishi", Icon: Gauge },
  { id: "bmw", name: "BMW", Icon: Wrench },
  { id: "chevrolet", name: "Chevrolet", Icon: CircleDot },
  { id: "ford", name: "Ford", Icon: Car },
  { id: "changan", name: "Changan", Icon: Cog },
  { id: "haval", name: "Haval", Icon: Gauge },
  { id: "land-rover", name: "Land Rover", Icon: Wrench },
  { id: "nissan", name: "Nissan", Icon: CircleDot },
  { id: "volkswagen", name: "Volkswagen", Icon: Car },
  { id: "gmc", name: "GMC", Icon: Cog },
  { id: "cadillac", name: "Cadillac", Icon: Gauge },
  { id: "audi", name: "Audi", Icon: Wrench },
];
