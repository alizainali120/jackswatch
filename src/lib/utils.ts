import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}


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

export const STRAP_LABELS: Record<string, string> = {
  bracelet: "Bracelet",
  leather: "Leather",
  rubber: "Rubber",
  fabric: "Fabric",
};
