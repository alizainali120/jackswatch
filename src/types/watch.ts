export type WatchTier = "must-have" | "consider" | "maybe" | "pass";

export interface WatchNotes {
  fitScore: number;
  dialScore: number;
  overallNotes: string;
  wristPhoto?: string;
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
}
