export type WatchTier = "must-have" | "consider" | "maybe" | "pass";

export interface WatchNotes {
  fitScore: number;   // 0–10
  dialScore: number;  // 0–10
  overallNotes: string;
  wristPhoto?: string; // base64 data URL
}

export interface Watch {
  id: string;
  name: string;
  reference: string;
  brand: string;
  caseSize: string;
  movement: string;
  powerReserve: string;
  image: string;          // stock photo URL (empty = gradient placeholder)
  recommendation: string; // Ali's personal note
  rank?: number;
  tier?: WatchTier;
  notes?: WatchNotes;
}
