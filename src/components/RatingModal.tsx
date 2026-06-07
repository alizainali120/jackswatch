"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Star } from "lucide-react";
import type { WatchModel, WatchVariant, Reaction } from "@/types/watch";
import { cn } from "@/lib/utils";


interface VariantBlockProps {
  variant: WatchVariant;
  isTopPick: boolean;
  onReact: (reaction: Reaction | null) => void;
  onSetTopPick: () => void;
}

function VariantBlock({ variant, isTopPick, onReact, onSetTopPick }: VariantBlockProps) {
  const isPreferred = variant.reaction === "preferred";
  const isPassed = variant.reaction === "pass";

  const specs = variant.label || "";

  return (
    <div
      className={cn(
        "py-3 border-b border-zinc-900 transition-all",
        isPreferred && "bg-[#F5E6C8]/5",
        isPassed && "opacity-35"
      )}
    >
      {/* Single line: ref (linked) · specs */}
      <p className="text-[10px] mb-3" style={{ fontFamily: "var(--font-mono)" }}>
        {variant.link ? (
          <a
            href={variant.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1 text-zinc-400 hover:text-[#b8973a] transition-colors underline underline-offset-2 decoration-zinc-700",
              isPassed && "line-through"
            )}
          >
            {variant.reference}
            <ExternalLink size={8} />
          </a>
        ) : (
          <span className={cn("text-zinc-400", isPassed && "line-through")}>
            {variant.reference}
          </span>
        )}
        {specs && <span className="text-zinc-600"> · {specs}</span>}
      </p>

      {/* Line 3: reaction buttons + top pick */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onReact(isPreferred ? null : "preferred")}
          className={cn(
            "px-3 py-1.5 border text-[10px] font-medium tracking-wide transition-all",
            isPreferred
              ? "bg-[#F5E6C8] border-[#F5E6C8] text-black"
              : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
          )}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ✓ Preferred
        </button>
        <button
          onClick={() => onReact(isPassed ? null : "pass")}
          className={cn(
            "px-3 py-1.5 border text-[10px] font-medium tracking-wide transition-all",
            isPassed
              ? "border-[#444444] text-[#444444]"
              : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
          )}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ✕ Pass
        </button>

        {isPreferred && (
          <button
            onClick={onSetTopPick}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 border text-[10px] transition-all ml-auto",
              isTopPick
                ? "bg-[#b8973a]/15 border-[#b8973a]/50 text-[#b8973a]"
                : "border-zinc-800 text-zinc-600 hover:border-[#b8973a]/30 hover:text-[#b8973a]/60"
            )}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Star
              size={10}
              className={isTopPick ? "fill-[#b8973a] text-[#b8973a]" : "text-zinc-600"}
            />
            Top Pick
          </button>
        )}
      </div>
    </div>
  );
}

interface RatingModalProps {
  model: WatchModel;
  onClose: () => void;
  onUpdateVariant: (variantId: string, reaction: Reaction | null) => void;
  onSetTopPick: (variantId: string | null) => void;
  onUpdateNotes: (notes: string) => void;
}

export function RatingModal({
  model,
  onClose,
  onUpdateVariant,
  onSetTopPick,
  onUpdateNotes,
}: RatingModalProps) {
  const [visible, setVisible] = useState(false);
  const [localNotes, setLocalNotes] = useState(model.notes);

  useEffect(() => {
    setLocalNotes(model.notes);
  }, [model.notes]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleNotesBlur() {
    if (localNotes !== model.notes) {
      onUpdateNotes(localNotes);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />

      {/* Modal panel */}
      <div
        className={cn(
          "fixed z-50 flex flex-col bg-black",
          "bottom-0 inset-x-0 max-h-[88vh]",
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
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[#b8973a]/15 flex-shrink-0">
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.2em] text-zinc-500"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {model.brand}
            </p>
            <p
              className="text-xl font-light text-[#FAF6EE] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {model.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* VARIANTS */}
          <section>
            <p
              className="text-[9px] uppercase tracking-[0.25em] text-[#b8973a] mb-2 pb-2 border-b border-[#b8973a]/20"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Variants
            </p>
            <div>
              {model.variants.map((v) => (
                <VariantBlock
                  key={v.id}
                  variant={v}
                  isTopPick={model.topPickVariantId === v.id}
                  onReact={(reaction) => {
                    if (v.reaction === "preferred" && reaction !== "preferred" && model.topPickVariantId === v.id) {
                      onSetTopPick(null);
                    }
                    onUpdateVariant(v.id, reaction);
                  }}
                  onSetTopPick={() =>
                    onSetTopPick(model.topPickVariantId === v.id ? null : v.id)
                  }
                />
              ))}
            </div>
          </section>

          {/* NOTES */}
          <section>
            <p
              className="text-[9px] uppercase tracking-[0.25em] text-[#b8973a] mb-3 pb-2 border-b border-[#b8973a]/20"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Notes
            </p>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add context, heritage, or your thoughts..."
              rows={4}
              className="w-full bg-transparent border-0 border-b border-[#b8973a]/20 px-0 py-1.5 text-sm text-[#FAF6EE] placeholder-zinc-700 focus:outline-none focus:border-[#b8973a]/50 transition-colors leading-relaxed resize-none"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-[#b8973a]/15 flex-shrink-0">
          <button
            onClick={onClose}
            className="bg-[#F5E6C8] text-black px-6 py-2 text-[11px] font-medium tracking-widest uppercase hover:bg-[#FAF6EE] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
