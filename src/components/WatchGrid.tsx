"use client";

import type { Watch } from "@/types/watch";
import { WatchCard } from "@/components/WatchCard";

interface Props {
  watches: Watch[];
  onWatchClick: (watch: Watch) => void;
  onWatchUpdate: (watch: Watch) => void;
}

export function WatchGrid({ watches, onWatchClick, onWatchUpdate }: Props) {
  const sorted = [...watches].sort((a, b) => a.rank - b.rank);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-zinc-600 text-sm">No watches yet.</p>
        <p className="text-zinc-700 text-xs mt-1">Hit &quot;Add Watch&quot; to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sorted.map((watch) => (
        <WatchCard
          key={watch.id}
          watch={watch}
          onClick={() => onWatchClick(watch)}
          onUpdate={onWatchUpdate}
        />
      ))}
    </div>
  );
}
