"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Watch } from "@/types/watch";
import { WatchGrid } from "@/components/WatchGrid";
import { RankingView } from "@/components/RankingView";
import { NotesPanel } from "@/components/NotesPanel";
import { AddWatchModal } from "@/components/AddWatchModal";
import { cn } from "@/lib/utils";
import { WATCH_VARIANTS } from "@/lib/watchData";
import {
  LayoutGrid,
  Trophy,
  Plus,
  Watch as WatchIcon,
  Share2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type MobileTab = "grid" | "rank";

export function AppClient() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>("grid");
  const [notesPanelWatch, setNotesPanelWatch] = useState<Watch | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Debounce timers per watch id — for notes saves
  const notesTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Load from API ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/watches")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<Watch[]>;
      })
      .then((data) => {
        const enriched = (data as Watch[]).map((w) => {
          const group = WATCH_VARIANTS[w.id];
          return group
            ? { ...w, name: group.name, variants: group.variants }
            : w;
        });
        setWatches(enriched);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Couldn't reach the server. Check your connection.");
        setLoading(false);
      });
  }, []);

  // ── Optimistic update + debounced API save ──────────────────────────────────
  const updateWatch = useCallback((updated: Watch) => {
    setWatches((prev) =>
      prev.map((w) => (w.id === updated.id ? updated : w))
    );
    setNotesPanelWatch((prev) =>
      prev?.id === updated.id ? updated : prev
    );

    // Debounce the API call 1.5 s after last change
    const existing = notesTimers.current.get(updated.id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      notesTimers.current.delete(updated.id);
      setSaving(true);
      try {
        await fetch(`/api/watches/${updated.id}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: updated.tier ?? "",
            fitScore: updated.notes?.fitScore ?? 0,
            dialScore: updated.notes?.dialScore ?? 0,
            overallNotes: updated.notes?.overallNotes ?? "",
            variantPrefs: updated.notes?.variantPreferences ?? null,
          }),
        });
      } catch (err) {
        console.error("Notes save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 1500);

    notesTimers.current.set(updated.id, timer);
  }, []);

  // ── Ranking reorder — immediate API save ────────────────────────────────────
  const reorderWatches = useCallback(async (reordered: Watch[]) => {
    setWatches(reordered);
    setSaving(true);
    try {
      await fetch("/api/watches/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered.map((w) => w.id) }),
      });
    } catch (err) {
      console.error("Rank save failed:", err);
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Add watch — persisted to sheet ─────────────────────────────────────────
  const addWatch = useCallback(async (watch: Watch) => {
    setWatches((prev) => [...prev, watch]);
    try {
      await fetch("/api/watches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(watch),
      });
    } catch (err) {
      console.error("Add watch failed:", err);
    }
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex items-center gap-3 text-zinc-600">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs tracking-widest uppercase">Loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FAF6EE]">
      {/* ── Header ── */}
      <header className="no-print sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#b8973a]/15 border border-[#b8973a]/30 flex items-center justify-center">
              <WatchIcon size={11} className="text-[#b8973a]" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-100">
              Jack&apos;s Watch Guide
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Saving indicator */}
            {saving && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-600">
                <Loader2 size={10} className="animate-spin" />
                Saving…
              </span>
            )}

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

      {/* ── Error banner ── */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={13} />
            {error}
          </div>
        </div>
      )}

      {/* ── Mobile tab bar ── */}
      <div className="no-print lg:hidden px-4 pt-4">
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

      {/* ── Hero ── */}
      <div className="text-center pt-10 pb-8 border-b border-[#b8973a]/10">
        <h1
          className="text-5xl sm:text-7xl font-light tracking-[0.25em] uppercase text-[#FAF6EE]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Collection
        </h1>
        <p
          className="mt-3 text-[10px] tracking-[0.25em] text-[#F5E6C8]/50"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          A curated selection.
        </p>
      </div>

      {/* ── Main layout ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="lg:grid lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] lg:gap-6 lg:items-start">
          {/* Grid */}
          <div className={cn(mobileTab === "grid" ? "block" : "hidden", "lg:block")}>
            <WatchGrid
              watches={watches}
              onNotesClick={setNotesPanelWatch}
              onUpdate={updateWatch}
            />
          </div>

          {/* Sidebar */}
          <div
            className={cn(
              mobileTab === "rank" ? "block" : "hidden",
              "lg:block lg:sticky lg:top-20"
            )}
          >
            <div className="hidden lg:flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">
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

      {/* ── Notes panel ── */}
      {notesPanelWatch && (
        <NotesPanel
          watch={notesPanelWatch}
          onClose={() => setNotesPanelWatch(null)}
          onUpdate={updateWatch}
        />
      )}

      {/* ── Add watch ── */}
      {addModalOpen && (
        <AddWatchModal
          onClose={() => setAddModalOpen(false)}
          onAdd={addWatch}
          nextRank={watches.length + 1}
        />
      )}

      {/* ── Floating final ranking button ── */}
      <Link
        href="/share"
        className="no-print fixed bottom-6 right-6 z-20 px-5 py-3 bg-[#F5E6C8] text-black text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#C9A84C] transition-colors duration-200"
      >
        Final Ranking
      </Link>
    </div>
  );
}
