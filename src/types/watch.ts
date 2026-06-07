export type Reaction = "love" | "consider" | "pass";
export type Condition = "new" | "preowned";
export type StrapType = "bracelet" | "leather" | "rubber" | "fabric";
export type ConditionPref = "new" | "either" | "preowned";
export type StrapPref = "bracelet" | "any" | "strap";

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
  tryAgain: boolean;
}

export interface WatchModel {
  id: string;
  brand: string;
  name: string;
  heroImage: string;
  notes: string;
  reactionTags: string[];
  rank: number;
  variants: WatchVariant[];
}

export interface GlobalPrefs {
  condition: ConditionPref;
  strap: StrapPref;
}
