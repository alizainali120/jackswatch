"use client";

import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import type { WatchModel, WatchVariant } from "@/types/watch";
import { cn, getBrandGradient } from "@/lib/utils";

function VariantLine({ variant, isTopPick }: { variant: WatchVariant; isTopPick: boolean }) {
  const isPassed = variant.reaction === "pass";
  const isPreferred = variant.reaction === "preferred";
  const specs = variant.label || "";

  return (
    <div className={cn("transition-opacity", isPassed && "opacity-35")}>
      {/* Single line: ref (linked) · specs */}
      <p className="text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
        {variant.link ? (
          <a
            href={variant.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
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
        {isPreferred && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1.5 align-middle flex-shrink-0" />}
        {isTopPick && (
          <span
            className="inline-block ml-1.5 px-1 py-px text-[8px] uppercase tracking-widest border border-[#b8973a]/60 text-[#b8973a] align-middle leading-none"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Top Pick
          </span>
        )}
      </p>
    </div>
  );
}

interface WatchRowProps {
  model: WatchModel;
  rank: number | null;
  onRate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function WatchRow({ model, rank, onRate, onMoveUp, onMoveDown }: WatchRowProps) {

  const gradient = getBrandGradient(model.brand);

  return (
    <div className="border-b border-[#b8973a]/10 bg-black">
      <div className="flex flex-col sm:flex-row">

        {/* ── Image ──────────────────────────────────────────────────────── */}
        <div className="relative flex-shrink-0 self-stretch">
          {/* Mobile: full-width banner, 180px tall */}
          {/* Desktop: 96×128 portrait, left-anchored */}
          <div
            className={cn(
              "overflow-hidden bg-gradient-to-b",
              gradient,
              "h-[180px] w-full sm:h-full sm:w-24"
            )}
          >
            {model.heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={model.heroImage}
                alt=""
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="text-white/15 font-light"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
                >
                  {model.brand[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col gap-1.5">

          {/* Header: brand + name + reorder widget + action buttons */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {model.brand}
              </p>
              <p
                className="text-lg font-light text-[#FAF6EE] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {model.name}
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {/* Rank reorder widget: ▲ rank# ▼ — always shown for ranked watches */}
              {rank !== null && (
                <div className="flex flex-col items-center border border-zinc-800 flex-shrink-0">
                  <button
                    onClick={onMoveUp}
                    disabled={!onMoveUp}
                    title="Move up"
                    className="px-2.5 py-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={11} strokeWidth={1.5} />
                  </button>
                  <span
                    className="text-[10px] text-zinc-500 tabular-nums border-t border-b border-zinc-800 px-2 py-0.5 w-full text-center"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {rank}
                  </span>
                  <button
                    onClick={onMoveDown}
                    disabled={!onMoveDown}
                    title="Move down"
                    className="px-2.5 py-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={11} strokeWidth={1.5} />
                  </button>
                </div>
              )}
              <button
                onClick={onRate}
                className="border border-[#b8973a] text-[#b8973a] px-2.5 py-1.5 text-[10px] tracking-widest uppercase hover:bg-[#b8973a]/10 transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Rate →
              </button>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-[#b8973a]/10 mt-0.5" />

          {/* Variant lines */}
          <div className="space-y-2">
            {[...model.variants]
              .sort((a, b) => {
                const order = (v: WatchVariant) => {
                  if (v.id === model.topPickVariantId) return 0;
                  if (v.reaction === "preferred") return 1;
                  if (v.reaction === null) return 2;
                  return 3;
                };
                return order(a) - order(b);
              })
              .map((v) => (
                <VariantLine key={v.id} variant={v} isTopPick={model.topPickVariantId === v.id} />
              ))}
          </div>

          {/* Footer: notes snippet */}
          {model.notes && (
            <>
              <div className="h-px bg-[#b8973a]/10" />
              <p className="text-[11px] text-[#FAF6EE]/45 italic leading-snug">
                {model.notes}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
