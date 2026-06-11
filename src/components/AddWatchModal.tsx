"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WatchModel } from "@/types/watch";

type Mode = "new" | "variant";

interface VariantDraft {
  reference: string;
  label: string;
}

interface AddWatchModalProps {
  models: WatchModel[];
  onClose: () => void;
  onAdd: (brand: string, name: string, variants: VariantDraft[]) => Promise<void>;
  onAddVariant: (modelId: string, reference: string, label: string) => Promise<void>;
}

const emptyVariant = (): VariantDraft => ({ reference: "", label: "" });

export function AddWatchModal({ models, onClose, onAdd, onAddVariant }: AddWatchModalProps) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("new");
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function resetForm() {
    setBrand("");
    setName("");
    setSelectedModelId("");
    setVariants([emptyVariant()]);
    setError(null);
  }

  function switchMode(m: Mode) {
    setMode(m);
    resetForm();
  }

  function updateVariant(i: number, field: keyof VariantDraft, value: string) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "variant") {
      if (!selectedModelId) { setError("Select an existing watch."); return; }
      const filled = variants.filter((v) => v.reference.trim());
      if (filled.length === 0) { setError("At least one variant with a reference is required."); return; }
      setError(null);
      setSaving(true);
      try {
        for (const v of filled) {
          await onAddVariant(selectedModelId, v.reference.trim(), v.label.trim());
        }
        onClose();
      } catch {
        setError("Failed to add variant.");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!brand.trim() || !name.trim()) { setError("Brand and name are required."); return; }
    const filled = variants.filter((v) => v.reference.trim());
    if (filled.length === 0) { setError("At least one variant with a reference is required."); return; }
    setError(null);
    setSaving(true);
    try {
      await onAdd(brand.trim(), name.trim(), filled.map((v) => ({
        reference: v.reference.trim(),
        label: v.label.trim(),
      })));
    } finally {
      setSaving(false);
    }
  }

  const sortedModels = [...models].sort((a, b) =>
    `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`)
  );

  const inputCls = "w-full bg-zinc-950 border border-zinc-800 focus:border-[#b8973a]/50 px-3 py-2 text-base sm:text-sm text-[#FAF6EE] placeholder-zinc-600 focus:outline-none transition-colors";
  const tabCls = (active: boolean) => cn(
    "flex-1 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-colors border-b-2",
    active
      ? "text-[#b8973a] border-[#b8973a]"
      : "text-zinc-600 border-transparent hover:text-zinc-400"
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        className={cn(
          "fixed z-50 flex flex-col bg-black",
          "bottom-0 inset-x-0 max-h-[80dvh]",
          "md:inset-x-auto md:left-1/2 md:bottom-auto md:top-1/2",
          "md:w-full md:max-w-lg md:max-h-[85vh]",
          "md:-translate-x-1/2",
          "border-t border-[#b8973a]/20 md:border md:border-[#b8973a]/20",
          "transition-all duration-300 ease-out",
          visible
            ? "translate-y-0 opacity-100 md:-translate-y-1/2"
            : "translate-y-full opacity-0 md:translate-y-[-40%]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#b8973a]/15 flex-shrink-0">
          <p className="text-sm uppercase tracking-[0.25em] text-[#b8973a]" style={{ fontFamily: "var(--font-mono)" }}>
            Add Watch
          </p>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex px-5 pt-3 gap-4" style={{ fontFamily: "var(--font-mono)" }}>
          <button type="button" onClick={() => switchMode("new")} className={tabCls(mode === "new")}>
            New Watch
          </button>
          <button type="button" onClick={() => switchMode("variant")} className={tabCls(mode === "variant")}>
            Add Variant
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {mode === "new" && (
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 pb-2 border-b border-zinc-800" style={{ fontFamily: "var(--font-mono)" }}>
                Model
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 block" style={{ fontFamily: "var(--font-mono)" }}>Brand</label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Rolex"
                    className={inputCls}
                    style={{ fontFamily: "var(--font-sans)" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 block" style={{ fontFamily: "var(--font-mono)" }}>Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Submariner"
                    className={inputCls}
                    style={{ fontFamily: "var(--font-sans)" }}
                  />
                </div>
              </div>
            </section>
          )}

          {mode === "variant" && (
            <section className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 pb-2 border-b border-zinc-800" style={{ fontFamily: "var(--font-mono)" }}>
                Select Watch
              </p>
              <div className="relative">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 block" style={{ fontFamily: "var(--font-mono)" }}>Watch</label>
                <div className="relative">
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className={cn(inputCls, "appearance-none cursor-pointer pr-5")}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    <option value="" className="bg-black text-zinc-500">Select a watch…</option>
                    {sortedModels.map((m) => (
                      <option key={m.id} value={m.id} className="bg-black text-[#FAF6EE]">
                        {m.brand} {m.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                </div>
              </div>
            </section>
          )}

          {/* Variants */}
          <section className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 pb-2 border-b border-zinc-800" style={{ fontFamily: "var(--font-mono)" }}>
              {mode === "variant" ? "New Variants" : "Variants"}
            </p>
            <div className="space-y-5">
              {variants.map((v, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                      Variant {i + 1}
                    </span>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(i)} className="text-zinc-700 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 block" style={{ fontFamily: "var(--font-mono)" }}>Reference</label>
                      <input
                        value={v.reference}
                        onChange={(e) => updateVariant(i, "reference", e.target.value)}
                        placeholder="124060"
                        className={cn(inputCls, "font-mono")}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5 block" style={{ fontFamily: "var(--font-mono)" }}>Label</label>
                      <input
                        value={v.label}
                        onChange={(e) => updateVariant(i, "label", e.target.value)}
                        placeholder="41mm · Black Dial · Bracelet"
                        className={inputCls}
                        style={{ fontFamily: "var(--font-sans)" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Plus size={12} />
              Add variant
            </button>
          </section>

          {error && (
            <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2" style={{ fontFamily: "var(--font-mono)" }}>{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-[#b8973a]/15 flex-shrink-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#F5E6C8] text-black px-6 py-2.5 text-[11px] font-medium tracking-widest uppercase hover:bg-[#FAF6EE] transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {saving ? "Adding…" : mode === "variant" ? "Add Variant" : "Add Watch"}
          </button>
        </div>
      </div>
    </>
  );
}
