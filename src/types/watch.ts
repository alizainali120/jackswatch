export type WatchTier = "must-have" | "consider" | "maybe" | "pass";

export type VariantPreference = "prefer" | "pass";

export interface WatchNotes {
  fitScore: number;
  dialScore: number;
  overallNotes: string;
  wristPhoto?: string;
  variantPreferences?: Record<string, VariantPreference>;
}

export interface WatchVariant {
  id: string;
  label: string;       // e.g. "No-Date" | "Date"
  reference: string;   // e.g. "124060"
  url: string;
  dialColor: string;   // e.g. "Black"
  bracelet: string;    // e.g. "Oyster"
  movement: string;    // overrides Watch.movement for this variant
  notable: string[];   // 2-3 key differentiators
}

export interface Watch {
  id: string;
  brand: string;
  name: string;
  reference: string;
  caseSize: string;
  movement: string;
  powerReserve: string;
  image: string;
  recommendation: string;
  rank: number;
  tier?: WatchTier;
  notes?: WatchNotes;
  variants?: WatchVariant[];
}
