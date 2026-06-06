import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WatchStyle, WatchTier } from "@/types/watch";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

export const STYLE_LABELS: Record<WatchStyle, string> = {
  diver: "Diver",
  sport: "Sport",
  dress: "Dress",
  pilot: "Pilot",
  casual: "Casual",
  field: "Field",
};

export const STYLE_COLORS: Record<WatchStyle, string> = {
  diver: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  sport: "bg-green-500/15 text-green-400 border-green-500/25",
  dress: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  pilot: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  casual: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  field: "bg-lime-500/15 text-lime-400 border-lime-500/25",
};

export const TIER_LABELS: Record<WatchTier, string> = {
  "must-have": "Must Have",
  consider: "Strong Consider",
  maybe: "Maybe",
  pass: "Pass",
};

export const TIER_COLORS: Record<WatchTier, string> = {
  "must-have": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  consider: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  maybe: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  pass: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const BRAND_GRADIENTS: Record<string, string> = {
  Rolex: "from-[#1a3a1a] to-[#0d1f0d]",
  Omega: "from-[#1a2a4a] to-[#0d1520]",
  Tudor: "from-[#3a1a1a] to-[#1f0d0d]",
  IWC: "from-[#1a1a3a] to-[#0d0d1f]",
  Cartier: "from-[#3a2a1a] to-[#1f150d]",
  "Patek Philippe": "from-[#2a2a1a] to-[#15150d]",
  "Audemars Piguet": "from-[#1a2a2a] to-[#0d1515]",
  default: "from-zinc-800 to-zinc-900",
};

export function getBrandGradient(brand: string): string {
  return BRAND_GRADIENTS[brand] ?? BRAND_GRADIENTS.default;
}

export function generateId(): string {
  return `watch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
