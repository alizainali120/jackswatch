import type { Watch, WatchVariant } from "@/types/watch";

const SUBMARINER_VARIANTS: WatchVariant[] = [
  {
    id: "124060",
    label: "No-Date",
    reference: "124060",
    url: "https://www.rolex.com/en-us/watches/submariner/m124060-0001",
    dialColor: "Black",
    bracelet: "Oyster",
    movement: "Cal. 3230",
    notable: [
      "No date complication — cleaner dial symmetry",
      "Slightly slimmer profile without date mechanism",
      "Symmetric crown guards",
    ],
  },
  {
    id: "126610LN",
    label: "Date",
    reference: "126610LN",
    url: "https://www.rolex.com/en-us/watches/submariner/m126610ln-0001",
    dialColor: "Black",
    bracelet: "Oyster",
    movement: "Cal. 3235",
    notable: [
      "Date window at 3 o'clock with Cyclops magnification",
      "Cal. 3235 — 70hr power reserve, more recent movement",
      "Larger crown guards vs. the no-date",
    ],
  },
];

// Maps watch IDs to variant data + optional display name override.
// Also maps the legacy "Submariner Date" ID so existing Sheet entries get enriched.
export const WATCH_VARIANTS: Record<string, { name: string; defaultVariantId: string; variants: WatchVariant[] }> = {
  "rolex-submariner": {
    name: "Submariner",
    defaultVariantId: "124060",
    variants: SUBMARINER_VARIANTS,
  },
  "rolex-sub-126610ln": {
    name: "Submariner",
    defaultVariantId: "126610LN",
    variants: SUBMARINER_VARIANTS,
  },
};

export const DEFAULT_WATCHES: Watch[] = [
  {
    id: "rolex-submariner",
    brand: "Rolex",
    name: "Submariner",
    reference: "124060 / 126610LN",
    caseSize: "41mm",
    movement: "Cal. 3230 / 3235",
    powerReserve: "70 hours",
    image: "/images/rolex-sub-126610ln.jpg",
    recommendation:
      "The question is always: date or no-date? Same DNA, same legend, very different feel. No-date is cleaner and more symmetrical. Date adds practicality and the more modern movement. Both are unmistakably Submariner.",
    rank: 1,
    tier: undefined,
    notes: undefined,
  },
  {
    id: "rolex-gmt-126710blnr",
    brand: "Rolex",
    name: "GMT-Master II",
    reference: "126710BLNR",
    caseSize: "40mm",
    movement: "Cal. 3285",
    powerReserve: "70 hours",
    image: "",
    recommendation:
      "The Batman. Harder to get than the Sub, but worth understanding why people love it. The GMT complication feels meaningful, not gimmicky. Jubilee bracelet on this ref makes it exceptional.",
    rank: 2,
    tier: undefined,
    notes: undefined,
  },
  {
    id: "rolex-datejust-126300",
    brand: "Rolex",
    name: "Datejust 41",
    reference: "126300",
    caseSize: "41mm",
    movement: "Cal. 3235",
    powerReserve: "70 hours",
    image: "",
    recommendation:
      "Most underrated Rolex in the lineup. Same Cal. 3235 as the Sub at a lower price point. The variety of dial and bracelet combinations means you can make it very personal.",
    rank: 3,
    tier: undefined,
    notes: undefined,
  },
  {
    id: "omega-seamaster-diver-300m",
    brand: "Omega",
    name: "Seamaster Diver 300M",
    reference: "210.30.42.20.01.001",
    caseSize: "42mm",
    movement: "Cal. 8800",
    powerReserve: "55 hours",
    image: "",
    recommendation:
      "Bond's watch. The wave-pattern dial is genuinely beautiful in person — photos don't do it justice. Master Chronometer certification means it's been through more rigorous testing than COSC alone.",
    rank: 4,
    tier: undefined,
    notes: undefined,
  },
  {
    id: "omega-speedmaster-moonwatch",
    brand: "Omega",
    name: "Speedmaster Professional",
    reference: "310.30.42.50.01.001",
    caseSize: "42mm",
    movement: "Cal. 3861",
    powerReserve: "50 hours",
    image: "",
    recommendation:
      "You're not buying a watch, you're buying history. The hesalite crystal gives it a warm, almost analog quality that modern sapphire crystals lack. The manual-wind ritual is a feature, not a bug.",
    rank: 5,
    tier: undefined,
    notes: undefined,
  },
  {
    id: "tudor-blackbay58",
    brand: "Tudor",
    name: "Black Bay 58",
    reference: "79030N",
    caseSize: "39mm",
    movement: "Cal. MT5402",
    powerReserve: "70 hours",
    image: "",
    recommendation:
      "The smart buy. 39mm is the magic number — wears vintage-small in the best possible way. In-house movement with Rolex DNA. If Jack values value-for-money over brand prestige, this wins.",
    rank: 6,
    tier: undefined,
    notes: undefined,
  },
  {
    id: "iwc-pilot-mark-xx",
    brand: "IWC",
    name: "Pilot's Watch Mark XX",
    reference: "IW328201",
    caseSize: "40mm",
    movement: "Cal. 35111",
    powerReserve: "72 hours",
    image: "",
    recommendation:
      "The understated choice. Nobody talks about the Mark XX at parties, which is exactly why certain people love it. Clean Arabic numerals, antimagnetic case, longest power reserve in this lineup.",
    rank: 7,
    tier: undefined,
    notes: undefined,
  },
  {
    id: "cartier-santos-large",
    brand: "Cartier",
    name: "Santos Large",
    reference: "WSSA0061",
    caseSize: "39.8mm",
    movement: "Cal. 1847 MC",
    powerReserve: "42 hours",
    image: "",
    recommendation:
      "The wildcard. If every other watch on this list is a sports watch, the Santos is the conversation piece. 120 years old and still the most distinctive silhouette in any room. Put this on last.",
    rank: 8,
    tier: undefined,
    notes: undefined,
  },
];
