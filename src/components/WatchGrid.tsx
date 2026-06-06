"use client";

import type { Watch } from "@/types/watch";
import { WatchCard } from "@/components/WatchCard";

interface Props {
  watches: Watch[];
  onNotesClick: (watch: Watch) => void;
  onUpdate: (watch: Watch) => void;
}

export function WatchGrid({ watches, onNotesClick, onUpdate }: Props) {
  const sorted = [...watches].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-zinc-600 text-sm">No watches yet.</p>
        <p className="text-zinc-700 text-xs mt-1">
          Hit &ldquo;Add Watch&rdquo; to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {sorted.map((watch) => (
        <WatchCard
          key={watch.id}
          watch={watch}
          onNotesClick={() => onNotesClick(watch)}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
