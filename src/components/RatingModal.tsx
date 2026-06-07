"use client";

import { useState } from "react";
import type { WatchModel, WatchVariant, Reaction } from "@/types/watch";
import { cn, getBrandGradient, STRAP_LABELS } from "@/lib/utils";
import { X, ExternalLink, RotateCcw } from "lucide-react";

interface Props {
  model: WatchModel;
  onClose: () => void;
  onUpdateVariant: (variantId: string, reaction: Reaction | null, tryAgain: boolean) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateReactionTags: (tags: string[]) => void;
}

const REACTIONS: { value: Reaction; emoji: string; label: string }[] = [
  { value: "love",     emoji: "❤️",  label: "Love it"  },
  { value: "consider", emoji: "👍",  label: "Consider" },
  { value: "pass",     emoji: "✕",   label: "Pass"     },
];

const QUICK_TAGS = [
  "Sporty", "Dressy", "Versatile", "Everyday", "Bold", "Understated",
  "Comfortable", "Heavy", "Wears large", "Wears small", "Clean dial", "Statement",
];

function hasMultipleSizes(model: WatchModel): boolean {
  const sizes = new Set(model.variants.map((v) => v.size).filter(Boolean));
  return sizes.size > 1;
}

function VariantRow({
  variant,
  showSize,
  onReact,
  onToggleTryAgain,
}: {
  variant: WatchVariant;
  showSize: boolean;
  onReact: (r: Reaction | null) => void;
  onToggleTryAgain: () => void;
}) {
  const specParts = [
    variant.dialColor && `${variant.dialColor} dial`,
    STRAP_LABELS[variant.strapType],
    variant.strapColor !== variant.strapType ? variant.strapColor : null,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3 transition-colors",
        variant.reaction === "love"
          ? "border-rose-800/50 bg-rose-950/20"
          : variant.reaction === "consider"
          ? "border-amber-800/40 bg-amber-950/15"
          : variant.reaction === "pass"
          ? "border-zinc-800 bg-zinc-950/40 opacity-60"
          : "border-zinc-800 bg-zinc-950/30"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-zinc-100">
              {variant.label}
            </span>
            {showSize && variant.size && (
              <span className="text-[10px] text-zinc-500 font-mono">{variant.size}</span>
            )}
            <span
              className={cn(
                "text-[9px] px-1.5 py-0.5 rounded font-medium tracking-wide",
                variant.condition === "new"
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-amber-950/40 text-amber-500/80"
              )}
            >
              {variant.condition === "new" ? "NEW" : "PRE-OWNED"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] text-zinc-500"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {variant.reference}
            </span>
            {variant.link && (
              <a
                href={variant.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-zinc-600 hover:text-[#b8973a] transition-colors"
              >
                <ExternalLink size={10} />
              </a>
            )}
            {variant.priceRange && (
              <span className="text-[10px] text-zinc-600">{variant.priceRange}</span>
            )}
          </div>

          {specParts.length > 0 && (
            <p
              className="text-[10px] text-zinc-600 mt-0.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {specParts.join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {REACTIONS.map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => onReact(variant.reaction === value ? null : value)}
              title={label}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all",
                variant.reaction === value
                  ? value === "love"
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                    : value === "consider"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-zinc-700/50 border-zinc-600 text-zinc-300"
                  : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300"
              )}
            >
              <span>{emoji}</span>
              <span className="hidden sm:inline text-[10px]">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onToggleTryAgain}
          title="Try again"
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded-xl border text-[10px] transition-all",
            variant.tryAgain
              ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
              : "border-zinc-800 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500"
          )}
        >
          <RotateCcw size={10} />
          <span className="hidden sm:inline">Try again</span>
        </button>
      </div>
    </div>
  );
}

export function RatingModal({ model, onClose, onUpdateVariant, onUpdateNotes, onUpdateReactionTags }: Props) {
  const [notes, setNotes] = useState(model.notes);
  const showSize = hasMultipleSizes(model);

  const loved = model.variants.filter((v) => v.reaction === "love").length;
  const considering = model.variants.filter((v) => v.reaction === "consider").length;
  const passed = model.variants.filter((v) => v.reaction === "pass").length;
  const rated = loved + considering + passed;

  const summaryParts = [
    loved > 0 && `${loved} loved`,
    considering > 0 && `${considering} considering`,
    passed > 0 && `${passed} passed`,
  ].filter(Boolean);

  function toggleTag(tag: string) {
    const current = model.reactionTags ?? [];
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onUpdateReactionTags(next);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed z-50 inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-6">
        <div className="relative w-full sm:max-w-xl bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

          {/* Drag pill mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800 flex-shrink-0">
            <div
              className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 overflow-hidden",
                getBrandGradient(model.brand)
              )}
            >
              {model.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={model.heroImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/30 text-base font-thin">{model.brand[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500">{model.brand}</p>
              <p
                className="text-base font-light text-[#FAF6EE] leading-tight truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {model.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-5 space-y-6">

              {/* Variants */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">
                  {model.variants.length} Variant{model.variants.length !== 1 ? "s" : ""}
                </p>
                {model.variants.map((v) => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    showSize={showSize}
                    onReact={(r) => onUpdateVariant(v.id, r, v.tryAgain)}
                    onToggleTryAgain={() => onUpdateVariant(v.id, v.reaction, !v.tryAgain)}
                  />
                ))}
              </div>

              {/* Quick-tap reaction tags */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2.5">Quick tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => {
                    const active = (model.reactionTags ?? []).includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-2.5 py-1 rounded-xl border text-[11px] font-medium transition-all",
                          active
                            ? "bg-[#b8973a]/15 border-[#b8973a]/40 text-[#b8973a]"
                            : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Notes</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={(e) => onUpdateNotes(e.target.value)}
                  placeholder="Add context, heritage, or your thoughts..."
                  className="w-full bg-transparent border-0 border-b border-[#b8973a]/20 px-0 py-2 text-sm text-[#FAF6EE] placeholder-zinc-700 focus:outline-none focus:border-[#b8973a]/50 transition-colors leading-relaxed resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
            <p className="text-[11px] text-zinc-600">
              {rated > 0
                ? summaryParts.join("  ·  ")
                : "Rate each variant above"}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-xs font-semibold tracking-wider hover:bg-[#b8973a]/20 transition-all uppercase"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
