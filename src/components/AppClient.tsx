"use client";

import { useState, useEffect, useCallback } from "react";
import type { Watch } from "@/types/watch";
import { loadWatches, saveWatches } from "@/lib/storage";
import { WatchGrid } from "@/components/WatchGrid";
import { RankingView } from "@/components/RankingView";
import { WatchModal } from "@/components/WatchModal";
import { AddWatchModal } from "@/components/AddWatchModal";
import { LayoutGrid, Trophy, Plus, Watch as WatchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "grid" | "rank";

export function AppClient() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [view, setView] = useState<View>("grid");
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setWatches(loadWatches());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveWatches(watches);
  }, [watches, loaded]);

  const updateWatch = useCallback((updated: Watch) => {
    setWatches((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setSelectedWatch((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const addWatch = useCallback((watch: Watch) => {
    setWatches((prev) => [...prev, watch]);
  }, []);

  const deleteWatch = useCallback((id: string) => {
    setWatches((prev) => {
      const filtered = prev.filter((w) => w.id !== id);
      return filtered.map((w, i) => ({ ...w, rank: i + 1 }));
    });
    setSelectedWatch(null);
  }, []);

  const reorderWatches = useCallback((reordered: Watch[]) => {
    setWatches(reordered);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0c0c0d]">
        <div className="flex items-center gap-3 text-zinc-500">
          <WatchIcon size={18} />
          <span className="text-sm tracking-widest uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0c0c0d]/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#b8973a]/15 border border-[#b8973a]/30 flex items-center justify-center">
              <WatchIcon size={13} className="text-[#b8973a]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-widest uppercase text-zinc-100">
                Jack&apos;s Watch Guide
              </h1>
              <p className="text-[10px] text-zinc-600 tracking-wider uppercase hidden sm:block">
                {watches.length} watches curated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  view === "grid"
                    ? "bg-zinc-700 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setView("rank")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  view === "rank"
                    ? "bg-zinc-700 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Trophy size={13} />
                <span className="hidden sm:inline">Rank</span>
              </button>
            </div>

            {/* Add watch */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-xs font-medium hover:bg-[#b8973a]/20 transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Add Watch</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "grid" ? (
          <WatchGrid
            watches={watches}
            onWatchClick={setSelectedWatch}
            onWatchUpdate={updateWatch}
          />
        ) : (
          <RankingView
            watches={watches}
            onReorder={reorderWatches}
            onWatchClick={setSelectedWatch}
            onWatchUpdate={updateWatch}
          />
        )}
      </main>

      {/* Modals */}
      {selectedWatch && (
        <WatchModal
          watch={selectedWatch}
          onClose={() => setSelectedWatch(null)}
          onUpdate={updateWatch}
          onDelete={deleteWatch}
        />
      )}
      {addModalOpen && (
        <AddWatchModal
          onClose={() => setAddModalOpen(false)}
          onAdd={addWatch}
          nextRank={watches.length + 1}
        />
      )}
    </div>
  );
}
