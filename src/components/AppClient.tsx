"use client";

import { useState, useEffect, useCallback } from "react";
import type { WatchModel, Reaction } from "@/types/watch";
import { WatchRow } from "@/components/WatchRow";
import { RatingModal } from "@/components/RatingModal";
import { AddWatchModal } from "@/components/AddWatchModal";
import { Watch as WatchIcon, Loader2, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";

const ONBOARDING_KEY = "jacks-watch-onboarding-dismissed";

function OnboardingCard() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(ONBOARDING_KEY) === "true");
  }, []);

  function handleDismiss() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setDismissed(true);
  }

  if (dismissed !== false) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-6">
      <div className="border border-zinc-800 bg-zinc-950 rounded-sm px-5 py-5">
        <p
          className="text-[10px] uppercase tracking-[0.3em] text-[#b8973a] mb-3"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Jack&apos;s Watch Picks
        </p>

        <div className="space-y-3 mb-5">
          <p className="text-[12px] text-zinc-300 leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
            Rate each watch based purely on what you like - the color, dial, brand, or just what feels right. Ignore price entirely; this is a style guide, not a shopping list. I may end up getting a used piece or a similar style from a different brand.
          </p>
          <ul className="space-y-2">
            <li className="text-[11px] text-zinc-400 leading-snug" style={{ fontFamily: "var(--font-mono)" }}>
              <span className="text-zinc-600 mr-1.5">01</span>
              Mark each variant <span className="text-emerald-400">Preferred</span> or <span className="text-zinc-400">Pass</span>. Any watch with a Preferred variant moves into your Ranked list.
            </li>
            <li className="text-[11px] text-zinc-400 leading-snug" style={{ fontFamily: "var(--font-mono)" }}>
              <span className="text-zinc-600 mr-1.5">02</span>
              In Ranked, drag watches into order from most to least favorite. If you marked more than one variant Preferred, pin your single top pick.
            </li>
            <li className="text-[11px] text-zinc-400 leading-snug" style={{ fontFamily: "var(--font-mono)" }}>
              <span className="text-zinc-600 mr-1.5">03</span>
              Add notes whenever something stands out — love the dial, hate the bracelet, size feels off. The more detail, the better I can match your style.
            </li>
          </ul>
        </div>

        <button
          onClick={handleDismiss}
          className="border border-[#b8973a] text-[#b8973a] text-[10px] tracking-widest uppercase px-4 py-1.5 hover:bg-[#b8973a]/10 transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

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

  const preferredModels = models
    .filter((m) => m.variants.some((v) => v.reaction === "preferred"))
    .sort((a, b) => {
      if (a.rank !== null && b.rank !== null) return a.rank - b.rank;
      if (a.rank !== null) return -1;
      if (b.rank !== null) return 1;
      return 0;
    });
  const passed = models.filter(
    (m) =>
      m.variants.length > 0 &&
      m.variants.every((v) => v.reaction !== null) &&
      !m.variants.some((v) => v.reaction === "preferred")
  );
  const unranked = models.filter(
    (m) =>
      !m.variants.some((v) => v.reaction === "preferred") &&
      !(m.variants.length > 0 && m.variants.every((v) => v.reaction !== null))
  );
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
    setModels((prev) => {
      const updatedModels = prev.map((m) => {
        if (m.id !== modelId) return m;
        const updatedVariants = m.variants.map((v) => v.id === variantId ? { ...v, reaction } : v);
        const preferredCount = updatedVariants.filter((v) => v.reaction === "preferred").length;
        const shouldClearTopPick = m.topPickVariantId !== null && (
          (reaction !== "preferred" && m.topPickVariantId === variantId) ||
          preferredCount <= 1
        );
        if (shouldClearTopPick) {
          fetch(`/api/watches/${modelId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topPickVariantId: null }),
          }).catch(console.error);
        }
        return {
          ...m,
          variants: updatedVariants,
          topPickVariantId: shouldClearTopPick ? null : m.topPickVariantId,
        };
      });

      if (reaction === "preferred") {
        const hadPreferred = prev.find((m) => m.id === modelId)?.variants.some((v) => v.reaction === "preferred") ?? false;
        if (!hadPreferred) {
          const rankedOthers = updatedModels.filter((m) => m.id !== modelId && m.rank !== null);
          const maxRank = rankedOthers.length > 0 ? Math.max(...rankedOthers.map((m) => m.rank!)) : 0;
          const newRank = maxRank + 1;
          setSaving(true);
          fetch(`/api/watches/${modelId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rank: newRank }),
          }).catch(console.error).finally(() => setSaving(false));
          return updatedModels.map((m) => m.id === modelId ? { ...m, rank: newRank } : m);
        }
      }

      return updatedModels;
    });
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

const handleAddVariant = useCallback(async (modelId: string, reference: string, label: string, link?: string) => {
    const res = await fetch(`/api/watches/${modelId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, label, link }),
    });
    if (!res.ok) throw new Error("Failed to add variant");
    const newVariant = await res.json();
    setModels((prev) => prev.map((m) => m.id === modelId ? { ...m, variants: [...m.variants, newVariant] } : m));
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
    setActiveModelId(null);
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

      {/* Onboarding card */}
      <div className="pt-8">
        <OnboardingCard />
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

          {preferredModels.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-zinc-600" style={{ fontFamily: "var(--font-mono)" }}>
                Mark a variant Preferred to move a watch here.
              </p>
            </div>
          ) : (
            preferredModels.map((model, i) => (
              <WatchRow
                key={model.id}
                model={model}
                rank={i + 1}
                onRate={() => setActiveModelId(model.id)}
                onMoveUp={i > 0 ? () => handleMoveUp(model.id) : undefined}
                onMoveDown={i < preferredModels.length - 1 ? () => handleMoveDown(model.id) : undefined}
              />
            ))
          )}
        </section>

        {/* UNRANKED section */}
        {unranked.length > 0 && (
          <section className="mb-8">
            <div className="px-4 pb-3 border-b border-[#b8973a]/20">
              <span
                className="text-[9px] tracking-[0.3em] uppercase text-[#b8973a]"
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
              />
            ))}
          </section>
        )}

        {/* PASSED section */}
        {passed.length > 0 && (
          <section>
            <div className="px-4 pb-3 border-b border-[#b8973a]/20">
              <span
                className="text-[9px] tracking-[0.3em] uppercase text-[#b8973a]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Passed
              </span>
            </div>
            {passed.map((model) => (
              <WatchRow
                key={model.id}
                model={model}
                rank={null}
                onRate={() => setActiveModelId(model.id)}
              />
            ))}
          </section>
        )}
      </main>

      {/* Add watch modal */}
      {addingWatch && (
        <AddWatchModal
          models={models}
          onClose={() => setAddingWatch(false)}
          onAdd={handleAddWatch}
          onAddVariant={handleAddVariant}
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
          onAddVariant={(ref, label, link) => handleAddVariant(activeModel.id, ref, label, link)}
        />
      )}
    </div>
  );
}
