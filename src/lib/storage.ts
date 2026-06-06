import type { Watch } from "@/types/watch";
import { DEFAULT_WATCHES } from "./watchData";

const STORAGE_KEY = "jackswatch_v1";

export function loadWatches(): Watch[] {
  if (typeof window === "undefined") return DEFAULT_WATCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHES;
    const parsed = JSON.parse(raw) as Watch[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_WATCHES;
    return parsed;
  } catch {
    return DEFAULT_WATCHES;
  }
}

export function saveWatches(watches: Watch[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watches));
  } catch (e) {
    console.warn("localStorage quota exceeded. Try removing some wrist photos.", e);
  }
}

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas unavailable")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
