"use client";

import { useState, useEffect, useCallback } from "react";
import type { WatchModel, Reaction } from "@/types/watch";
import { WatchRow } from "@/components/WatchRow";
import { RatingModal } from "@/components/RatingModal";
import { AddWatchModal } from "@/components/AddWatchModal";
import { Watch as WatchIcon, Loader2, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";

export function AppClient() {
  const [models, setModels] = useState<WatchModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [addingWatch, setAddingWatch] = useState(false);

  useEffect(() => {
    fetch("/api/watches")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<WatchModel[]>;
      })
      .then((data) => { setModels(data); setLoading(false); })
      .catch(() => { setError("Couldn't reach the server."); setLoading(false); });
  }, []);

  const ranked = models
    .filter((m) => m.rank !== null)
    .sort((a, b) => a.rank! - b.rank!);
  const unranked = models.filter((m) => m.rank === null);
  const activeModel = models.find((m) => m.id === activeModelId) ?? null;

  // ── Rank reordering ───────────────────────────────────────────────────────

  const handleMoveUp = useCallback((modelId: string) => {
    setModels((prev) => {
      const sorted = prev.filter((m) => m.rank !== null).sort((a, b) => a.rank! - b.rank!);
      const idx = sorted.findIndex((m) => m.id === modelId);
      if (idx <= 0) return prev;
      const reordered = [...sorted];
      [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
      const withNewRanks = reordered.map((m, i) => ({ ...m, rank: i + 1 }));
      setSaving(true);
      fetch("/api/watches/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: withNewRanks.map((m) => m.id) }),
      }).catch(console.error).finally(() => setSaving(false));
      return prev.map((m) => withNewRanks.find((r) => r.id === m.id) ?? m);
    });
  }, []);

  const handleMoveDown = useCallback((modelId: string) => {
    setModels((prev) => {
      const sorted = prev.filter((m) => m.rank !== null).sort((a, b) => a.rank! - b.rank!);
      const idx = sorted.findIndex((m) => m.id === modelId);
      if (idx < 0 || idx >= sorted.length - 1) return prev;
      const reordered = [...sorted];
      [reordered[idx + 1], reordered[idx]] = [reordered[idx], reordered[idx + 1]];
      const withNewRanks = reordered.map((m, i) => ({ ...m, rank: i + 1 }));
      setSaving(true);
      fetch("/api/watches/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: withNewRanks.map((m) => m.id) }),
      }).catch(console.error).finally(() => setSaving(false));
      return prev.map((m) => withNewRanks.find((r) => r.id === m.id) ?? m);
    });
  }, []);

  // ── Modal callbacks ───────────────────────────────────────────────────────

  const handleUpdateVariant = useCallback((modelId: string, variantId: string, reaction: Reaction | null) => {
    setModels((prev) =>
      prev.map((m) =>
        m.id !== modelId ? m : {
          ...m,
          variants: m.variants.map((v) => v.id === variantId ? { ...v, reaction } : v),
          topPickVariantId:
            reaction !== "preferred" && m.topPickVariantId === variantId
              ? null
              : m.topPickVariantId,
        }
      )
    );
    setSaving(true);
    fetch(`/api/variants/${variantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction }),
    }).catch(console.error).finally(() => setSaving(false));
  }, []);

  const handleSetTopPick = useCallback((modelId: string, variantId: string | null) => {
    setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, topPickVariantId: variantId } : m));
    setSaving(true);
    fetch(`/api/watches/${modelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topPickVariantId: variantId }),
    }).catch(console.error).finally(() => setSaving(false));
  }, []);

  const handleUpdateNotes = useCallback((modelId: string, notes: string) => {
    setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, notes } : m));
    setSaving(true);
    fetch(`/api/watches/${modelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    }).catch(console.error).finally(() => setSaving(false));
  }, []);

  const handleModalClose = useCallback(() => {
    if (!activeModelId) { setActiveModelId(null); return; }
    const model = models.find((m) => m.id === activeModelId);
    if (model && model.rank === null) {
      const hasPreferred = model.variants.some((v) => v.reaction === "preferred");
      if (hasPreferred) {
        const maxRank = Math.max(0, ...models.filter((m) => m.rank !== null).map((m) => m.rank!));
        const newRank = maxRank + 1;
        setModels((prev) => prev.map((m) => m.id === activeModelId ? { ...m, rank: newRank } : m));
        setSaving(true);
        fetch(`/api/watches/${activeModelId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rank: newRank }),
        }).catch(console.error).finally(() => setSaving(false));
      }
    }
    setActiveModelId(null);
  }, [activeModelId, models]);

  const handleRank = useCallback((modelId: string) => {
    setModels((prev) => {
      const maxRank = Math.max(0, ...prev.filter((m) => m.rank !== null).map((m) => m.rank!));
      const newRank = maxRank + 1;
      setSaving(true);
      fetch(`/api/watches/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rank: newRank }),
      }).catch(console.error).finally(() => setSaving(false));
      return prev.map((m) => m.id === modelId ? { ...m, rank: newRank } : m);
    });
  }, []);

  const handleUnrank = useCallback((modelId: string) => {
    setModels((prev) => {
      setSaving(true);
      fetch(`/api/watches/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rank: null }),
      }).catch(console.error).finally(() => setSaving(false));
      // Renumber the remaining ranked watches
      const remaining = prev
        .filter((m) => m.rank !== null && m.id !== modelId)
        .sort((a, b) => a.rank! - b.rank!)
        .map((m, i) => ({ ...m, rank: i + 1 }));
      fetch("/api/watches/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: remaining.map((m) => m.id) }),
      }).catch(console.error);
      return prev.map((m) => {
        if (m.id === modelId) return { ...m, rank: null };
        const updated = remaining.find((r) => r.id === m.id);
        return updated ?? m;
      });
    });
  }, []);

  const handleAddWatch = useCallback(async (
    brand: string,
    name: string,
    variants: { reference: string; label: string; link?: string }[]
  ) => {
    const res = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, name, variants }),
    });
    if (!res.ok) throw new Error("Failed to add watch");
    const newModel = await res.json();
    setModels((prev) => [...prev, newModel]);
    setAddingWatch(false);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex items-center gap-3 text-zinc-600">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Loading
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FAF6EE]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#b8973a]/15 border border-[#b8973a]/30 flex items-center justify-center flex-shrink-0">
              <WatchIcon size={11} className="text-[#b8973a]" />
            </div>
            <span
              className="text-xs font-semibold tracking-widest uppercase text-zinc-100"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Jack&apos;s Watch Guide
            </span>
          </div>

          <div className="flex items-center gap-3">
            {saving && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-600" style={{ fontFamily: "var(--font-mono)" }}>
                <Loader2 size={10} className="animate-spin" />
                Saving
              </span>
            )}
            <button
              onClick={() => setAddingWatch(true)}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Add watch"
            >
              <Plus size={16} />
            </button>
            <Link
              href="/summary"
              className="border border-[#b8973a]/40 text-[#b8973a] text-[10px] tracking-widest uppercase px-3 py-1.5 hover:bg-[#b8973a]/10 transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Summary →
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={13} />
            {error}
          </div>
        </div>
      )}

      {/* Page title */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1
          className="text-4xl font-light tracking-[0.25em] uppercase text-[#FAF6EE]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Collection
        </h1>
      </div>

      <main className="max-w-2xl mx-auto pb-16">

        {/* RANKED section */}
        <section className="mb-8">
          <div className="px-4 pb-3 border-b border-[#b8973a]/20">
            <span
              className="text-[9px] tracking-[0.3em] uppercase text-[#b8973a]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Ranked
            </span>
          </div>

          {ranked.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-zinc-600" style={{ fontFamily: "var(--font-mono)" }}>
                Rate a watch to move it here.
              </p>
            </div>
          ) : (
            ranked.map((model, i) => (
              <WatchRow
                key={model.id}
                model={model}
                rank={i + 1}
                onRate={() => setActiveModelId(model.id)}
                onMoveUp={i > 0 ? () => handleMoveUp(model.id) : undefined}
                onMoveDown={i < ranked.length - 1 ? () => handleMoveDown(model.id) : undefined}
                onUnrank={() => handleUnrank(model.id)}
              />
            ))
          )}
        </section>

        {/* UNRANKED section */}
        {unranked.length > 0 && (
          <section>
            <div className="px-4 pb-3 border-b border-zinc-800">
              <span
                className="text-[9px] tracking-[0.3em] uppercase text-[#444444]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Unranked
              </span>
            </div>
            {unranked.map((model) => (
              <WatchRow
                key={model.id}
                model={model}
                rank={null}
                onRate={() => setActiveModelId(model.id)}
                onRank={() => handleRank(model.id)}
              />
            ))}
          </section>
        )}
      </main>

      {/* Add watch modal */}
      {addingWatch && (
        <AddWatchModal
          onClose={() => setAddingWatch(false)}
          onAdd={handleAddWatch}
        />
      )}

      {/* Rating modal */}
      {activeModel && (
        <RatingModal
          model={activeModel}
          onClose={handleModalClose}
          onUpdateVariant={(variantId, reaction) =>
            handleUpdateVariant(activeModel.id, variantId, reaction)
          }
          onSetTopPick={(variantId) => handleSetTopPick(activeModel.id, variantId)}
          onUpdateNotes={(notes) => handleUpdateNotes(activeModel.id, notes)}
        />
      )}
    </div>
  );
}
