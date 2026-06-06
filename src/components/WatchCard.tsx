"use client";

import { useState } from "react";
import type { Watch, WatchTier, WatchVariant } from "@/types/watch";
import {
  cn,
  TIER_COLORS,
  TIER_LABELS,
  getBrandGradient,
} from "@/lib/utils";
import { StickyNote, Trophy, Star, ExternalLink } from "lucide-react";
import { WATCH_VARIANTS } from "@/lib/watchData";

interface Props {
  watch: Watch;
  onNotesClick: () => void;
  onUpdate: (watch: Watch) => void;
}

const TIERS: WatchTier[] = ["must-have", "consider", "maybe", "pass"];

function ScorePip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              i < Math.round(value / 2) ? "bg-[#b8973a]" : "bg-zinc-800"
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-zinc-400">{label}</span>
      <span className="text-[10px] text-[#b8973a] font-semibold tabular-nums ml-auto">
        {value}/10
      </span>
    </div>
  );
}

function VariantSection({ variants, watchId }: { variants: WatchVariant[]; watchId: string }) {
  const group = WATCH_VARIANTS[watchId];
  const defaultId = group?.defaultVariantId ?? variants[0].id;
  const [activeId, setActiveId] = useState(defaultId);
  const active = variants.find((v) => v.id === activeId) ?? variants[0];

  return (
    <div className="space-y-2.5">
      {/* Variant tab pills */}
      <div className="flex gap-1.5">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveId(v.id)}
            className={cn(
              "text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium",
              activeId === v.id
                ? "bg-[#b8973a]/15 border-[#b8973a]/40 text-[#b8973a]"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Selected variant details */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 space-y-2">
        {/* Reference + link */}
        <div className="flex items-center justify-between">
          <p
            className="text-[10px] text-zinc-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Ref. {active.reference}
          </p>
          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] text-zinc-600 hover:text-[#b8973a] transition-colors"
          >
            View on Rolex
            <ExternalLink size={9} />
          </a>
        </div>

        {/* Dial · Bracelet · Movement */}
        <div
          className="flex items-center gap-0 text-[10px] text-zinc-400"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span>{active.dialColor} dial</span>
          <span className="mx-1.5 text-zinc-700">·</span>
          <span>{active.bracelet}</span>
          <span className="mx-1.5 text-zinc-700">·</span>
          <span>{active.movement}</span>
        </div>

        {/* Notable bullet points */}
        <ul className="space-y-1">
          {active.notable.map((point, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-[#b8973a]/60 text-[8px] mt-[3px] flex-shrink-0">▸</span>
              <span className="text-[10px] text-zinc-400 leading-snug">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function WatchCard({ watch, onNotesClick, onUpdate }: Props) {
  const displayPhoto =
    watch.notes?.wristPhoto || (watch.image ? watch.image : null);
  const isWristPhoto = !!watch.notes?.wristPhoto;
  const hasScores =
    (watch.notes?.fitScore ?? 0) > 0 || (watch.notes?.dialScore ?? 0) > 0;
  const isRanked = (watch.rank ?? 0) > 0;
  const hasVariants = watch.variants && watch.variants.length > 0;

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#F5E6C8]/20 transition-colors duration-200 group">
      {/* ---- Photo ---- */}
      <div
        className={cn(
          "relative h-56 bg-gradient-to-br",
          getBrandGradient(watch.brand)
        )}
      >
        {displayPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPhoto}
            alt={`${watch.brand} ${watch.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center select-none">
            <span className="text-[56px] font-thin text-white/10 leading-none">
              {watch.brand[0]}
            </span>
            <span className="text-[10px] tracking-[0.3em] text-white/15 uppercase mt-1">
              {watch.brand}
            </span>
          </div>
        )}

        {/* Photo label */}
        {isWristPhoto && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-[9px] tracking-widest text-white/70 uppercase">
            On wrist
          </div>
        )}

        {/* Rank badge */}
        {isRanked && (
          <div className="absolute top-2.5 left-2.5">
            {watch.rank === 1 ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#b8973a]/20 border border-[#b8973a]/40">
                <Trophy size={10} className="text-[#b8973a]" />
                <span className="text-[10px] font-bold text-[#b8973a]">#1</span>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-zinc-300">
                  {watch.rank}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tier badge */}
        {watch.tier && (
          <div
            className={cn(
              "absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-medium border",
              TIER_COLORS[watch.tier]
            )}
          >
            {TIER_LABELS[watch.tier]}
          </div>
        )}
      </div>

      {/* ---- Info ---- */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Brand + name */}
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-zinc-500 mb-0.5 font-medium">
            {watch.brand}
          </p>
          <h3
            className="text-base font-light tracking-wide text-[#FAF6EE] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {watch.name}
          </h3>
          {/* Only show flat reference if no variants */}
          {!hasVariants && (
            <p
              className="text-[10px] text-zinc-500 mt-0.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Ref. {watch.reference}
            </p>
          )}
        </div>

        {/* Variant picker — replaces the flat ref + specs row */}
        {hasVariants ? (
          <VariantSection variants={watch.variants!} watchId={watch.id} />
        ) : (
          /* Flat specs row for non-variant watches */
          <div
            className="flex items-center gap-0 text-[10px] text-zinc-400"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>{watch.caseSize}</span>
            <span className="mx-1.5 text-zinc-700">·</span>
            <span>{watch.movement}</span>
            <span className="mx-1.5 text-zinc-700">·</span>
            <span>{watch.powerReserve}</span>
          </div>
        )}

        {/* Shared case size + power reserve for variant watches */}
        {hasVariants && (
          <div
            className="flex items-center gap-0 text-[10px] text-zinc-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>{watch.caseSize}</span>
            <span className="mx-1.5 text-zinc-700">·</span>
            <span>{watch.powerReserve} power reserve</span>
          </div>
        )}

        {/* Ali's recommendation */}
        {watch.recommendation && (
          <p className="text-[11px] text-zinc-400 italic leading-relaxed border-l-2 border-[#b8973a]/30 pl-2.5">
            {watch.recommendation}
          </p>
        )}

        {/* Scores */}
        {hasScores && (
          <div className="space-y-1.5 pt-1 border-t border-zinc-800">
            <ScorePip
              label="Fit"
              value={watch.notes?.fitScore ?? 0}
            />
            <ScorePip
              label="Dial"
              value={watch.notes?.dialScore ?? 0}
            />
          </div>
        )}

        {/* Tier selector + notes button */}
        <div className="flex items-center justify-between mt-auto pt-1 gap-2">
          {/* Tier picker */}
          <div className="flex flex-wrap gap-1">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() =>
                  onUpdate({ ...watch, tier: watch.tier === t ? undefined : t })
                }
                className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full border transition-all",
                  watch.tier === t
                    ? TIER_COLORS[t]
                    : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                )}
              >
                {TIER_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Notes button */}
          <button
            onClick={onNotesClick}
            className={cn(
              "flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all",
              watch.notes?.overallNotes || hasScores
                ? "border-[#b8973a]/30 bg-[#b8973a]/10 text-[#b8973a] hover:bg-[#b8973a]/20"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            <Star size={11} />
            Rate
          </button>
        </div>

        {/* Notes snippet */}
        {watch.notes?.overallNotes && (
          <div className="flex items-start gap-1.5 pt-2 border-t border-zinc-800">
            <StickyNote size={11} className="text-zinc-700 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
              {watch.notes.overallNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
