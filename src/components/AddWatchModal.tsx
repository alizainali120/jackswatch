"use client";

import { useState } from "react";
import type { Watch, WatchVariant } from "@/types/watch";
import { generateId } from "@/lib/utils";
import { X, Plus, Trash2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdd: (watch: Watch) => void;
  nextRank: number;
}

interface VariantDraft {
  _key: string;
  label: string;
  reference: string;
  url: string;
  dialColor: string;
  bracelet: string;
  movement: string;
  keyDiff: string;
}

function emptyVariant(): VariantDraft {
  return { _key: generateId(), label: "", reference: "", url: "", dialColor: "", bracelet: "", movement: "", keyDiff: "" };
}

export function AddWatchModal({ onClose, onAdd, nextRank }: Props) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [caseSize, setCaseSize] = useState("");
  const [powerReserve, setPowerReserve] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // Single-option fields (hidden when hasVariants is true)
  const [reference, setReference] = useState("");
  const [movement, setMovement] = useState("");

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant(), emptyVariant()]);

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v) => (v._key === key ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(key: string) {
    setVariants((prev) => prev.filter((v) => v._key !== key));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || !name.trim()) return;

    const builtVariants: WatchVariant[] = hasVariants
      ? variants
          .filter((v) => v.label.trim() && v.reference.trim())
          .map((v) => ({
            id: v.reference.trim(),
            label: v.label.trim(),
            reference: v.reference.trim(),
            url: v.url.trim(),
            dialColor: v.dialColor.trim(),
            bracelet: v.bracelet.trim(),
            movement: v.movement.trim(),
            notable: v.keyDiff.trim() ? [v.keyDiff.trim()] : [],
          }))
      : [];

    const watch: Watch = {
      id: generateId(),
      brand: brand.trim(),
      name: name.trim(),
      reference: hasVariants
        ? builtVariants.map((v) => v.reference).join(" / ")
        : reference.trim(),
      caseSize: caseSize.trim(),
      movement: hasVariants ? "" : movement.trim(),
      powerReserve: powerReserve.trim(),
      image: "",
      recommendation: recommendation.trim(),
      rank: nextRank,
      variants: builtVariants.length > 0 ? builtVariants : undefined,
    };

    onAdd(watch);
    onClose();
  }

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors";
  const smallInputClass =
    "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">Add Watch</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Brand + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Brand *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Rolex"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Model *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Submariner"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Case Size + Power Reserve */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Case Size
              </label>
              <input
                type="text"
                value={caseSize}
                onChange={(e) => setCaseSize(e.target.value)}
                placeholder="41mm"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Power Reserve
              </label>
              <input
                type="text"
                value={powerReserve}
                onChange={(e) => setPowerReserve(e.target.value)}
                placeholder="70 hours"
                className={inputClass}
              />
            </div>
          </div>

          {/* Single-option fields — hidden when variants mode is on */}
          {!hasVariants && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                  Reference
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="126610LN"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                  Movement
                </label>
                <input
                  type="text"
                  value={movement}
                  onChange={(e) => setMovement(e.target.value)}
                  placeholder="Cal. 3235"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
              Recommendation
            </label>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Why is this worth considering?"
              className={inputClass}
              rows={2}
            />
          </div>

          {/* Variants toggle */}
          <div className="border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={() => setHasVariants((v) => !v)}
              className="flex items-center gap-2 w-full text-left group"
            >
              <div
                className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${
                  hasVariants ? "bg-[#b8973a]" : "bg-zinc-700"
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                    hasVariants ? "left-4" : "left-0.5"
                  }`}
                />
              </div>
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors">
                This watch has multiple options (variants)
              </span>
            </button>

            {/* Variant inputs */}
            {hasVariants && (
              <div className="mt-4 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                  Options — add one row per variant
                </p>

                {variants.map((v, i) => (
                  <div
                    key={v._key}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                        Option {i + 1}
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(v._key)}
                          className="text-zinc-700 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Label + Reference */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          value={v.label}
                          onChange={(e) => updateVariant(v._key, { label: e.target.value })}
                          placeholder="No-Date"
                          className={smallInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                          Reference *
                        </label>
                        <input
                          type="text"
                          value={v.reference}
                          onChange={(e) => updateVariant(v._key, { reference: e.target.value })}
                          placeholder="124060"
                          className={smallInputClass}
                        />
                      </div>
                    </div>

                    {/* URL */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        Product URL
                      </label>
                      <input
                        type="url"
                        value={v.url}
                        onChange={(e) => updateVariant(v._key, { url: e.target.value })}
                        placeholder="https://rolex.com/…"
                        className={smallInputClass}
                      />
                    </div>

                    {/* Dial · Bracelet · Movement */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                          Dial
                        </label>
                        <input
                          type="text"
                          value={v.dialColor}
                          onChange={(e) => updateVariant(v._key, { dialColor: e.target.value })}
                          placeholder="Black"
                          className={smallInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                          Bracelet
                        </label>
                        <input
                          type="text"
                          value={v.bracelet}
                          onChange={(e) => updateVariant(v._key, { bracelet: e.target.value })}
                          placeholder="Oyster"
                          className={smallInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                          Movement
                        </label>
                        <input
                          type="text"
                          value={v.movement}
                          onChange={(e) => updateVariant(v._key, { movement: e.target.value })}
                          placeholder="Cal. 3235"
                          className={smallInputClass}
                        />
                      </div>
                    </div>

                    {/* Key difference */}
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-1">
                        Key difference
                      </label>
                      <input
                        type="text"
                        value={v.keyDiff}
                        onChange={(e) => updateVariant(v._key, { keyDiff: e.target.value })}
                        placeholder="No date complication — cleaner dial"
                        className={smallInputClass}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mt-1"
                >
                  <Plus size={12} />
                  Add another option
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-zinc-300 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-sm font-medium px-5 py-2 rounded-xl bg-[#b8973a]/15 border border-[#b8973a]/30 text-[#b8973a] hover:bg-[#b8973a]/25 transition-all"
          >
            Add Watch
          </button>
        </div>
      </form>
    </div>
  );
}
