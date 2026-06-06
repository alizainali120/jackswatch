export type WatchStyle = "diver" | "sport" | "dress" | "pilot" | "casual" | "field";
export type WatchTier = "must-have" | "consider" | "maybe" | "pass";

export interface WatchSpecs {
  caseDiameter: string;
  caseThickness?: string;
  caseMaterial: string;
  movement: string;
  powerReserve?: string;
  waterResistance?: string;
  crystal?: string;
  bracelet: string;
}

export interface ColorOption {
  name: string;
  hex: string;
  description?: string;
}

export interface Watch {
  id: string;
  brand: string;
  name: string;
  reference: string;
  price: number;
  style: WatchStyle;
  description: string;
  highlights: string[];
  specs: WatchSpecs;
  colorOptions: ColorOption[];
  stockPhotos: string[];
  wristPhotos: string[];
  notes: string;
  rank: number;
  tier?: WatchTier;
}
