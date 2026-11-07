import type { WatchModel } from "@/types/watch";

/** Watches with at least one Preferred variant, in ranked order. Shared by the main page and Summary. */
export function getRankedModels(models: WatchModel[]): WatchModel[] {
  return models
    .filter((m) => m.variants.some((v) => v.reaction === "preferred"))
    .sort((a, b) => {
      if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
      if (a.rank !== null) return -1;
      if (b.rank !== null) return 1;
      return 0;
    });
}
