"use client";

import { ExternalLink, ChevronUp, ChevronDown, Star } from "lucide-react";
import type { WatchModel, WatchVariant } from "@/types/watch";
import { cn, getBrandGradient } from "@/lib/utils";

function VariantLine({ variant, isTopPick }: { variant: WatchVariant; isTopPick: boolean }) {
  const isPassed = variant.reaction === "pass";
  const isPreferred = variant.reaction === "preferred";

  const specs = variant.label || "";

  return (
    <div className={cn("transition-opacity", isPassed && "opacity-35", isPreferred && "bg-[#F5E6C8]/5")}>
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
        {isTopPick && <Star size={9} className="text-[#b8973a] fill-[#b8973a] flex-shrink-0 inline ml-1 align-middle" />}
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
  const preferredCount = model.variants.filter((v) => v.reaction === "preferred").length;
  const passedCount = model.variants.filter((v) => v.reaction === "pass").length;
  const topPickVariant = model.variants.find((v) => v.id === model.topPickVariantId);
  const isRated = model.variants.some((v) => v.reaction !== null);

  const tally: string[] = [];
  if (preferredCount > 0) tally.push(`${preferredCount} preferred`);
  if (passedCount > 0) tally.push(`${passedCount} passed`);

  const gradient = getBrandGradient(model.brand);

  return (
    <div className="border-b border-[#b8973a]/10 bg-black">
      <div className="flex flex-col sm:flex-row">

        {/* ── Rank arrows — left of image, desktop only ───────────────────── */}
        {rank !== null && (
          <div className="hidden sm:flex flex-col items-center justify-center gap-1 px-2 bg-zinc-950">
            <button
              onClick={onMoveUp}
              disabled={!onMoveUp}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-[#b8973a] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!onMoveDown}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-[#b8973a] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        )}

        {/* ── Image ──────────────────────────────────────────────────────── */}
        <div className="relative flex-shrink-0">
          {/* Mobile: full-width banner, 180px tall */}
          {/* Desktop: 96×128 portrait, left-anchored */}
          <div
            className={cn(
              "overflow-hidden bg-gradient-to-b",
              gradient,
              "h-[180px] w-full sm:h-32 sm:w-24"
            )}
          >
            {model.heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={model.heroImage}
                alt=""
                className="w-full h-full object-cover object-top"
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

          {/* Rank badge — overlaid top-left corner */}
          {rank !== null && (
            <div className="absolute top-2 left-2 min-w-[22px] h-[22px] bg-black/75 px-1 flex items-center justify-center">
              {rank === 1 ? (
                <span className="text-[11px] leading-none">🏆</span>
              ) : (
                <span
                  className="text-[10px] text-zinc-300 leading-none"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {rank}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col gap-2">

          {/* Header: brand + name + Rate + ↑↓ */}
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

            <button
              onClick={onRate}
              className="border border-[#b8973a] text-[#b8973a] px-2.5 py-1.5 text-[10px] tracking-widest uppercase hover:bg-[#b8973a]/10 transition-colors flex-shrink-0 mt-0.5"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Rate →
            </button>
          </div>

          {/* Separator */}
          <div className="h-px bg-[#b8973a]/10" />

          {/* Variant lines */}
          <div className="space-y-2">
            {model.variants.map((v) => (
              <VariantLine key={v.id} variant={v} isTopPick={model.topPickVariantId === v.id} />
            ))}
          </div>

          {/* Footer: separator + rating summary + notes snippet */}
          {(isRated || model.notes) && (
            <>
              <div className="h-px bg-[#b8973a]/10" />
              <div className="space-y-0.5">
                {isRated && (
                  <p className="text-[10px] text-[#FAF6EE]" style={{ fontFamily: "var(--font-mono)" }}>
                    {topPickVariant && (
                      <span className="text-[#b8973a]">★ {topPickVariant.label} · </span>
                    )}
                    {tally.join(" · ")}
                  </p>
                )}
                {model.notes && (
                  <p className="text-[11px] text-[#FAF6EE]/45 italic leading-snug line-clamp-1">
                    {model.notes}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
