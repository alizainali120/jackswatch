"use client";

import { useState, useEffect, useCallback } from "react";
import type { Watch } from "@/types/watch";
import { loadWatches, saveWatches } from "@/lib/storage";
import { WatchGrid } from "@/components/WatchGrid";
import { RankingView } from "@/components/RankingView";
import { NotesPanel } from "@/components/NotesPanel";
import { AddWatchModal } from "@/components/AddWatchModal";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Trophy,
  Plus,
  Watch as WatchIcon,
  Share2,
} from "lucide-react";
import Link from "next/link";

type MobileTab = "grid" | "rank";

export function AppClient() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>("grid");
  const [notesPanelWatch, setNotesPanelWatch] = useState<Watch | null>(null);
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
    setNotesPanelWatch((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const addWatch = useCallback((watch: Watch) => {
    setWatches((prev) => [...prev, watch]);
  }, []);

  const reorderWatches = useCallback((reordered: Watch[]) => {
    setWatches(reordered);
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0c0c0d]">
        <div className="flex items-center gap-3 text-zinc-600">
          <WatchIcon size={16} />
          <span className="text-xs tracking-widest uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-zinc-100">
      {/* ---- Header ---- */}
      <header className="no-print sticky top-0 z-30 bg-[#0c0c0d]/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#b8973a]/15 border border-[#b8973a]/30 flex items-center justify-center">
              <WatchIcon size={11} className="text-[#b8973a]" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold tracking-widest uppercase text-zinc-100">
                Jack&apos;s Watch Guide
              </span>
            </div>
            <div className="sm:hidden">
              <span className="text-xs font-semibold tracking-widest uppercase text-zinc-100">
                Jack&apos;s Watches
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/share"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-700"
            >
              <Share2 size={12} />
              Share
            </Link>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-xs font-medium hover:bg-[#b8973a]/20 transition-colors"
            >
              <Plus size={12} />
              <span className="hidden sm:inline">Add Watch</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---- Mobile tab bar ---- */}
      <div className="no-print lg:hidden px-4 pt-4 pb-0">
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setMobileTab("grid")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
              mobileTab === "grid"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <LayoutGrid size={12} />
            Grid
          </button>
          <button
            onClick={() => setMobileTab("rank")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
              mobileTab === "rank"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Trophy size={12} />
            Rankings
          </button>
        </div>
      </div>

      {/* ---- Main layout ---- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="lg:grid lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] lg:gap-6 lg:items-start">
          {/* Watch grid */}
          <div
            className={cn(
              mobileTab === "grid" ? "block" : "hidden",
              "lg:block"
            )}
          >
            <WatchGrid
              watches={watches}
              onNotesClick={setNotesPanelWatch}
              onUpdate={updateWatch}
            />
          </div>

          {/* Ranking sidebar */}
          <div
            className={cn(
              mobileTab === "rank" ? "block" : "hidden",
              "lg:block lg:sticky lg:top-20"
            )}
          >
            {/* Desktop share link inside sidebar */}
            <div className="hidden lg:flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                {watches.length} watches
              </span>
              <Link
                href="/share"
                className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-[#b8973a] transition-colors"
              >
                <Share2 size={10} />
                Share &amp; Print
              </Link>
            </div>

            <RankingView
              watches={watches}
              onReorder={reorderWatches}
              onNotesClick={setNotesPanelWatch}
            />

            {/* Mobile share link */}
            <div className="mt-4 lg:hidden">
              <Link
                href="/share"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-500 text-xs hover:border-zinc-700 hover:text-zinc-300 transition-all"
              >
                <Share2 size={12} />
                Share &amp; Print Rankings
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ---- Notes panel ---- */}
      {notesPanelWatch && (
        <NotesPanel
          watch={notesPanelWatch}
          onClose={() => setNotesPanelWatch(null)}
          onUpdate={updateWatch}
        />
      )}

      {/* ---- Add watch modal ---- */}
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
