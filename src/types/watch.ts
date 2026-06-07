export type Reaction = "preferred" | "pass";
export type Condition = "new" | "preowned";
export type StrapType = "bracelet" | "leather" | "rubber" | "fabric";

export interface WatchVariant {
  id: string;
  modelId: string;
  reference: string;
  label: string;
  size?: string;
  dialColor: string;
  strapType: StrapType;
  strapColor: string;
  condition: Condition;
  priceRange?: string;
  link?: string;
  reaction: Reaction | null;
}

export interface WatchModel {
  id: string;
  brand: string;
  name: string;
  heroImage: string;
  notes: string;
  reactionTags: string[];
  topPickVariantId: string | null;
  rank: number | null;
  variants: WatchVariant[];
}
