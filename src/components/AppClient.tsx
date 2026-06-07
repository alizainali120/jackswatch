"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { WatchModel, WatchVariant, Reaction, GlobalPrefs } from "@/types/watch";
import { PreferencesBar } from "@/components/PreferencesBar";
import { ModelCard } from "@/components/ModelCard";
import { RatingModal } from "@/components/RatingModal";
import { Watch as WatchIcon, Trophy, Share2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const DEFAULT_PREFS: GlobalPrefs = { condition: "either", strap: "any" };
const PREFS_KEY = "jacks-watch-prefs";

export function AppClient() {
  const [models, setModels] = useState<WatchModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<GlobalPrefs>(DEFAULT_PREFS);
  const [activeModel, setActiveModel] = useState<WatchModel | null>(null);

  const variantTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const notesTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Load prefs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
  }, []);

  // Persist prefs
  const handlePrefsChange = useCallback((p: GlobalPrefs) => {
    setPrefs(p);
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/watches")
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<WatchModel[]>;
      })
      .then((data) => { setModels(data); setLoading(false); })
      .catch((err) => {
        console.error(err);
        setError("Couldn't reach the server. Check your connection.");
        setLoading(false);
      });
  }, []);

  // Optimistically update a variant reaction and debounce API save
  const handleUpdateVariant = useCallback(
    (modelId: string, variantId: string, reaction: Reaction | null, tryAgain: boolean) => {
      setModels((prev) =>
        prev.map((m) =>
          m.id !== modelId
            ? m
            : { ...m, variants: m.variants.map((v) => v.id === variantId ? { ...v, reaction, tryAgain } : v) }
        )
      );
      setActiveModel((prev) =>
        prev?.id !== modelId
          ? prev
          : { ...prev, variants: prev.variants.map((v) => v.id === variantId ? { ...v, reaction, tryAgain } : v) }
      );

      const existing = variantTimers.current.get(variantId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(async () => {
        variantTimers.current.delete(variantId);
        setSaving(true);
        try {
          await fetch(`/api/variants/${variantId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reaction, tryAgain }),
          });
        } catch (err) { console.error("Variant save failed:", err); }
        finally { setSaving(false); }
      }, 800);
      variantTimers.current.set(variantId, timer);
    },
    []
  );

  // Optimistically update notes and debounce API save
  const handleUpdateNotes = useCallback(
    (modelId: string, notes: string) => {
      setModels((prev) =>
        prev.map((m) => m.id === modelId ? { ...m, notes } : m)
      );
      setActiveModel((prev) =>
        prev?.id === modelId ? { ...prev, notes } : prev
      );

      const existing = notesTimers.current.get(modelId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(async () => {
        notesTimers.current.delete(modelId);
        setSaving(true);
        try {
          await fetch(`/api/watches/${modelId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes }),
          });
        } catch (err) { console.error("Notes save failed:", err); }
        finally { setSaving(false); }
      }, 1200);
      notesTimers.current.set(modelId, timer);
    },
    []
  );

  const openModel = useCallback((model: WatchModel) => {
    // Use latest version from state
    setActiveModel(model);
  }, []);

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

  // For the modal, always pull fresh from models state
  const activeModelFresh = activeModel
    ? models.find((m) => m.id === activeModel.id) ?? activeModel
    : null;

  return (
    <div className="min-h-screen bg-black text-[#FAF6EE]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#b8973a]/15 border border-[#b8973a]/30 flex items-center justify-center">
              <WatchIcon size={11} className="text-[#b8973a]" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-100">
              Jack&apos;s Watch Guide
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Loader2 size={10} className="animate-spin" />
                Saving
              </span>
            )}
            <Link
              href="/rank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-700"
            >
              <Trophy size={12} />
              <span className="hidden sm:inline">Ranking</span>
            </Link>
            <Link
              href="/summary"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-xs font-medium hover:bg-[#b8973a]/20 transition-colors"
            >
              <Share2 size={12} />
              <span className="hidden sm:inline">Summary</span>
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={13} />
            {error}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-center pt-10 pb-6 border-b border-[#b8973a]/10">
        <h1
          className="text-5xl sm:text-6xl font-light tracking-[0.25em] uppercase text-[#FAF6EE]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Collection
        </h1>
        <p
          className="mt-3 text-[10px] tracking-[0.25em] text-[#F5E6C8]/40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Tap a watch to rate it
        </p>
      </div>

      {/* Preferences bar */}
      <div className="max-w-2xl mx-auto px-4 py-4 border-b border-zinc-800/50">
        <PreferencesBar prefs={prefs} onChange={handlePrefsChange} />
      </div>

      {/* Grid */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {models.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">No watches yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                prefs={prefs}
                onClick={() => openModel(model)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Rating modal */}
      {activeModelFresh && (
        <RatingModal
          model={activeModelFresh}
          prefs={prefs}
          onClose={() => setActiveModel(null)}
          onUpdateVariant={(variantId: string, reaction: Reaction | null, tryAgain: boolean) =>
            handleUpdateVariant(activeModelFresh.id, variantId, reaction, tryAgain)
          }
          onUpdateNotes={(notes: string) => handleUpdateNotes(activeModelFresh.id, notes)}
        />
      )}
    </div>
  );
}
