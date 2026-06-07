"use client";

import { useState, useEffect, CSSProperties } from "react";
import type { WatchModel, WatchVariant, Reaction } from "@/types/watch";
import { cn, getBrandGradient, STRAP_LABELS } from "@/lib/utils";
import { GripVertical, ExternalLink, ChevronDown, ChevronUp, Star } from "lucide-react";

const QUICK_TAGS = [
  "Sporty", "Dressy", "Versatile", "Everyday", "Bold", "Understated",
  "Comfortable", "Heavy", "Wears large", "Wears small", "Clean dial", "Statement",
];

interface VariantRowProps {
  variant: WatchVariant;
  isTopPick: boolean;
  hasTopPickInModel: boolean;
  onReact: (reaction: Reaction | null) => void;
  onSetTopPick: () => void;
}

function VariantRow({ variant, isTopPick, hasTopPickInModel, onReact, onSetTopPick }: VariantRowProps) {
  const isPreferred = variant.reaction === "preferred";
  const isPassed = variant.reaction === "pass";

  const specParts = [
    variant.size,
    `${variant.dialColor} Dial`,
    STRAP_LABELS[variant.strapType],
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "px-4 py-2.5 border-t border-zinc-800/60 transition-colors",
        isPreferred && "bg-[#F5E6C8]/[0.04]",
        isPassed && "opacity-40"
      )}
    >
      {/* Line 1: reference + link + condition badge + price */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="text-[10px] text-zinc-400 truncate"
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
              className="flex-shrink-0 text-zinc-600 hover:text-[#b8973a] transition-colors"
            >
              <ExternalLink size={9} />
            </a>
          )}
          <span
            className={cn(
              "flex-shrink-0 text-[8px] px-1.5 py-0.5 rounded font-semibold tracking-wide uppercase",
              variant.condition === "new"
                ? "bg-zinc-800 text-zinc-500"
                : "bg-amber-950/50 text-amber-600"
            )}
          >
            {variant.condition === "new" ? "New" : "Pre-own"}
          </span>
        </div>
        {variant.priceRange && (
          <span
            className="text-[10px] text-zinc-500 flex-shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {variant.priceRange}
          </span>
        )}
      </div>

      {/* Line 2: label + specs */}
      <p
        className={cn(
          "text-[11px] text-zinc-300 mb-2",
          isPassed && "line-through text-zinc-600"
        )}
      >
        {variant.label}
        {specParts.length > 0 && (
          <span className="text-zinc-600"> · {specParts.join(" · ")}</span>
        )}
      </p>

      {/* Line 3: reaction buttons + star */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onReact(isPreferred ? null : "preferred")}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all",
              isPreferred
                ? "bg-[#F5E6C8]/10 border-[#F5E6C8]/30 text-[#F5E6C8]"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300"
            )}
          >
            ✓ Preferred
          </button>
          <button
            onClick={() => onReact(null)}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[10px] transition-all",
              !variant.reaction
                ? "border-zinc-700 text-zinc-400"
                : "border-zinc-800 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500"
            )}
          >
            · Neutral
          </button>
          <button
            onClick={() => onReact(isPassed ? null : "pass")}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all",
              isPassed
                ? "bg-zinc-800 border-zinc-700 text-zinc-400"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-300"
            )}
          >
            ✕ Pass
          </button>
        </div>

        {/* Star — only visible when preferred */}
        {isPreferred && (
          <button
            onClick={onSetTopPick}
            title={isTopPick ? "Remove top pick" : "Set as top pick"}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] transition-all",
              isTopPick
                ? "bg-[#b8973a]/15 border-[#b8973a]/40 text-[#b8973a]"
                : "border-zinc-800 text-zinc-700 hover:border-[#b8973a]/30 hover:text-[#b8973a]/60"
            )}
          >
            <Star size={10} className={isTopPick ? "fill-[#b8973a]" : ""} />
            <span>{isTopPick ? "Top pick" : "★ Top"}</span>
          </button>
        )}

        {/* If not preferred but model has a top pick — ghost placeholder for alignment */}
        {!isPreferred && hasTopPickInModel && <div className="w-16" />}
      </div>
    </div>
  );
}

interface WatchRowProps {
  model: WatchModel;
  isReordering: boolean;
  isDragging?: boolean;
  dragRef?: (el: HTMLDivElement | null) => void;
  dragStyle?: CSSProperties;
  dragHandleProps?: Record<string, unknown>;
  onUpdateVariant: (variantId: string, reaction: Reaction | null) => void;
  onSetTopPick: (variantId: string | null) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateReactionTags: (tags: string[]) => void;
}

export function WatchRow({
  model,
  isReordering,
  isDragging,
  dragRef,
  dragStyle,
  dragHandleProps,
  onUpdateVariant,
  onSetTopPick,
  onUpdateNotes,
  onUpdateReactionTags,
}: WatchRowProps) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(model.notes);

  useEffect(() => { setLocalNotes(model.notes); }, [model.notes]);

  const preferred = model.variants.filter((v) => v.reaction === "preferred");
  const passed = model.variants.filter((v) => v.reaction === "pass");
  const neutral = model.variants.filter((v) => v.reaction === null);
  const topPickVariant = model.variants.find((v) => v.id === model.topPickVariantId);
  const hasTopPickInModel = model.topPickVariantId !== null;

  const footerParts: string[] = [];
  if (preferred.length) footerParts.push(`${preferred.length} preferred`);
  if (neutral.length && (preferred.length || passed.length)) footerParts.push(`${neutral.length} neutral`);
  if (passed.length) footerParts.push(`${passed.length} passed`);

  return (
    <div
      ref={dragRef}
      style={dragStyle}
      className={cn(
        "border-b border-[#b8973a]/10 bg-black transition-opacity",
        isDragging && "opacity-40"
      )}
    >
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* Hero thumbnail */}
        <div
          className={cn(
            "w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br",
            getBrandGradient(model.brand)
          )}
        >
          {model.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={model.heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/15 text-2xl font-thin">{model.brand[0]}</span>
            </div>
          )}
        </div>

        {/* Brand + name */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
            {model.brand}
          </p>
          <p
            className="text-xl font-light text-[#FAF6EE] leading-tight mt-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {model.name}
          </p>
        </div>

        {/* Drag handle — only in reorder mode */}
        {isReordering && (
          <button
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...(dragHandleProps as any)}
            className="flex-shrink-0 p-2 text-zinc-600 hover:text-zinc-400 touch-none cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </button>
        )}
      </div>

      {/* Variant rows */}
      {model.variants.map((v) => (
        <VariantRow
          key={v.id}
          variant={v}
          isTopPick={model.topPickVariantId === v.id}
          hasTopPickInModel={hasTopPickInModel}
          onReact={(reaction) => {
            // If clearing preferred and this was the top pick, clear top pick too
            if (v.reaction === "preferred" && reaction !== "preferred" && model.topPickVariantId === v.id) {
              onSetTopPick(null);
            }
            onUpdateVariant(v.id, reaction);
          }}
          onSetTopPick={() => onSetTopPick(model.topPickVariantId === v.id ? null : v.id)}
        />
      ))}

      {/* Quick tags */}
      <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
        {QUICK_TAGS.map((tag) => {
          const active = (model.reactionTags ?? []).includes(tag);
          return (
            <button
              key={tag}
              onClick={() => {
                const current = model.reactionTags ?? [];
                onUpdateReactionTags(
                  active ? current.filter((t) => t !== tag) : [...current, tag]
                );
              }}
              className={cn(
                "px-2.5 py-1 rounded-xl border text-[10px] font-medium transition-all",
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

      {/* Notes — collapsible */}
      <div className="px-4 pb-3">
        {notesExpanded ? (
          <div>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={(e) => onUpdateNotes(e.target.value)}
              placeholder="Add context, heritage, or your thoughts..."
              className="w-full bg-transparent border-0 border-b border-[#b8973a]/20 px-0 py-1.5 text-sm text-[#FAF6EE] placeholder-zinc-700 focus:outline-none focus:border-[#b8973a]/40 transition-colors leading-relaxed resize-none"
              rows={3}
              autoFocus
            />
            <button
              onClick={() => setNotesExpanded(false)}
              className="flex items-center gap-1 mt-1.5 text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors"
            >
              <ChevronUp size={10} />
              Show less
            </button>
          </div>
        ) : (
          <button
            onClick={() => setNotesExpanded(true)}
            className="text-left w-full group"
          >
            {localNotes.trim() ? (
              <div>
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{localNotes}</p>
                <span className="flex items-center gap-1 mt-1 text-[10px] text-zinc-700 group-hover:text-zinc-500 transition-colors">
                  <ChevronDown size={10} />
                  Show more
                </span>
              </div>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors">
                <ChevronDown size={10} />
                Notes
              </span>
            )}
          </button>
        )}
      </div>

      {/* Row footer */}
      {(footerParts.length > 0 || topPickVariant) && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-900">
          <p className="text-[10px] text-zinc-600">
            {footerParts.join(" · ")}
          </p>
          {topPickVariant && (
            <p className="text-[10px] text-[#b8973a] flex items-center gap-1">
              <Star size={9} className="fill-[#b8973a]" />
              {topPickVariant.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
