export type Reaction = "preferred" | "pass";

export interface WatchVariant {
  id: string;
  modelId: string;
  reference: string;
  label: string;
  link?: string;
  reaction: Reaction | null;
  notes?: string;
}

export interface WatchModel {
  id: string;
  brand: string;
  name: string;
  heroImage: string;
  notes: string;
  topPickVariantId: string | null;
  rank: number | null;
  variants: WatchVariant[];
}
