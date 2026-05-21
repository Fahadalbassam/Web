import type { Part } from "@/lib/catalog/part";

export type { Part, StockStatus } from "@/lib/catalog/part";

const img = (seed: string) =>
  `https://picsum.photos/seed/carpart-${seed}/800/600`;

export const mockParts: Part[] = [
  {
    id: "1",
    slug: "bosch-icon-wiper-24",
    name: "ICON Beam Wiper Blade — 24\"",
    brand: "Bosch",
    partNumber: "24OE",
    price: 28.99,
    image: img("wiper"),
    category: "Wipers",
    description:
      "Dual rubber compound with asymmetric spoiler for quiet, streak-free wipes in rain and snow. Direct-fit hook adapter included.",
    stockStatus: "in_stock",
    compatibility: [
      "2018–2024 Honda Accord (all trims)",
      "2019–2023 Toyota Camry LE/XLE",
      "2020–2024 Subaru Outback",
    ],
  },
  {
    id: "2",
    slug: "mann-filter-hu816x",
    name: "Spin-On Oil Filter (OEM spec)",
    brand: "Mann-Filter",
    partNumber: "HU 816 X",
    price: 12.5,
    image: img("filter"),
    category: "Filters",
    description:
      "High-capacity media and anti-drainback valve for cold-start protection. Meets OEM flow and bypass specs for modern turbo engines.",
    stockStatus: "in_stock",
    compatibility: [
      "BMW N20/N26 2.0L turbo (2012–2017)",
      "BMW N55 3.0L (select applications)",
    ],
  },
  {
    id: "3",
    slug: "ate-ceramic-front-pads",
    name: "Ceramic Front Brake Pad Set",
    brand: "ATE",
    partNumber: "607132",
    price: 89.0,
    image: img("brake"),
    category: "Brakes",
    description:
      "Low-dust ceramic formulation with OE-style shims and hardware kit. Bedding guide included for optimal bite and noise control.",
    stockStatus: "low_stock",
    compatibility: [
      "2015–2020 Audi A4 (B9) quattro front axle",
      "2015–2019 Audi A5 Sportback",
    ],
  },
  {
    id: "4",
    slug: "ngk-laser-iridium-97506",
    name: "Laser Iridium Spark Plug (each)",
    brand: "NGK",
    partNumber: "97506",
    price: 14.25,
    image: img("spark"),
    category: "Ignition",
    description:
      "Fine-wire iridium center electrode and platinum pad on ground strap for long service life and stable combustion.",
    stockStatus: "in_stock",
    compatibility: [
      "Subaru FA20DIT (2015–2021 WRX)",
      "Toyota 2.0L turbo (select)",
    ],
  },
  {
    id: "5",
    slug: "mobil1-0w20-5qt",
    name: "Full Synthetic 0W-20 — 5 qt",
    brand: "Mobil 1",
    partNumber: "120760",
    price: 34.99,
    category: "Fluids",
    description:
      "Advanced full synthetic for modern GDI and hybrid engines. Excellent high-temp stability and wear protection.",
    stockStatus: "in_stock",
    compatibility: [
      "API SP / ILSAC GF-6A applications",
      "Most Asian OEM 0W-20 specs",
    ],
    image: img("fluid"),
  },
  {
    id: "6",
    slug: "denso-4504-o2-sensor",
    name: "Air/Fuel Ratio Sensor (upstream)",
    brand: "Denso",
    partNumber: "234-4504",
    price: 142.0,
    image: img("sensor"),
    category: "Sensors",
    description:
      "Wideband A/F sensor engineered to OE response curves for accurate closed-loop control and emissions compliance.",
    stockStatus: "out_of_stock",
    compatibility: [
      "2004–2008 Toyota Corolla 1.8L",
      "2005–2010 Scion tC",
    ],
  },
  {
    id: "7",
    slug: "lemforder-control-arm-l",
    name: "Front Lower Control Arm — Left",
    brand: "Lemförder",
    partNumber: "3620201",
    price: 198.0,
    image: img("suspension"),
    category: "Suspension",
    description:
      "Forged aluminum arm with bonded bushings and ball joint pre-assembled. Powder-coated for corrosion resistance.",
    stockStatus: "in_stock",
    compatibility: [
      "2012–2018 BMW F30 328i/330i (RWD)",
      "2014–2020 BMW F32 428i",
    ],
  },
  {
    id: "8",
    slug: "gates-timing-kit",
    name: "Timing Belt Kit with Water Pump",
    brand: "Gates",
    partNumber: "TCKWP329",
    price: 249.0,
    image: img("filter"),
    category: "Engine",
    description:
      "Complete kit: belt, tensioner, idlers, and OE-profile water pump. Mileage-rated components for confident interval service.",
    stockStatus: "in_stock",
    compatibility: [
      "2009–2014 Acura TSX 2.4L",
      "2008–2012 Honda Accord 2.4L",
    ],
  },
];

export function getPartBySlug(slug: string): Part | undefined {
  return mockParts.find((p) => p.slug === slug);
}

export function getRelatedParts(slug: string, limit = 4): Part[] {
  const current = getPartBySlug(slug);
  return mockParts
    .filter((p) => p.slug !== slug && p.category === current?.category)
    .slice(0, limit);
}
