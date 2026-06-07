"use client";

import type { Watch, WatchTier, WatchVariant, VariantPreference } from "@/types/watch";
import {
  cn,
  TIER_COLORS,
  TIER_LABELS,
  getBrandGradient,
} from "@/lib/utils";
import { StickyNote, Trophy, Star, ExternalLink } from "lucide-react";

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

function VariantRow({
  variant,
  pref,
  onTogglePref,
}: {
  variant: WatchVariant;
  pref?: VariantPreference;
  onTogglePref: (p: VariantPreference) => void;
}) {
  const specs = [
    variant.dialColor && `${variant.dialColor} dial`,
    variant.bracelet,
    variant.movement,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 transition-colors",
        pref === "prefer"
          ? "border-emerald-800/50 bg-emerald-950/20"
          : pref === "pass"
          ? "border-red-900/40 bg-red-950/10"
          : "border-zinc-800 bg-zinc-950/30"
      )}
    >
      {/* Label + reference link + preference buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-medium text-zinc-200 flex-shrink-0">
            {variant.label}
          </span>
          {variant.url ? (
            <a
              href={variant.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-0.5 text-[10px] text-zinc-500 hover:text-[#b8973a] transition-colors truncate"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {variant.reference}
              <ExternalLink size={8} className="flex-shrink-0 ml-0.5" />
            </a>
          ) : (
            <span
              className="text-[10px] text-zinc-500 truncate"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {variant.reference}
            </span>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onTogglePref("prefer")}
            className={cn(
              "text-[9px] px-1.5 py-0.5 rounded-full border transition-all",
              pref === "prefer"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "border-zinc-700 text-zinc-600 hover:border-emerald-800/60 hover:text-emerald-500"
            )}
          >
            Prefer
          </button>
          <button
            onClick={() => onTogglePref("pass")}
            className={cn(
              "text-[9px] px-1.5 py-0.5 rounded-full border transition-all",
              pref === "pass"
                ? "bg-red-500/15 border-red-500/40 text-red-400"
                : "border-zinc-700 text-zinc-600 hover:border-red-900/60 hover:text-red-500"
            )}
          >
            Pass
          </button>
        </div>
      </div>

      {/* Specs */}
      {specs && (
        <p
          className="text-[10px] text-zinc-500 mt-1"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {specs}
        </p>
      )}

      {/* First notable point */}
      {variant.notable[0] && (
        <p className="text-[10px] text-zinc-600 mt-1 leading-snug">
          {variant.notable[0]}
        </p>
      )}
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

  function toggleVariantPref(variantId: string, pref: VariantPreference) {
    const current = watch.notes?.variantPreferences ?? {};
    const updated = { ...current };
    if (updated[variantId] === pref) {
      delete updated[variantId];
    } else {
      updated[variantId] = pref;
    }
    onUpdate({
      ...watch,
      notes: {
        ...(watch.notes ?? { fitScore: 0, dialScore: 0, overallNotes: "" }),
        variantPreferences: updated,
      },
    });
  }

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

        {isWristPhoto && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 text-[9px] tracking-widest text-white/70 uppercase">
            On wrist
          </div>
        )}

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
          {/* Only show flat reference for non-variant watches */}
          {!hasVariants && (
            <p
              className="text-[10px] text-zinc-500 mt-0.5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Ref. {watch.reference}
            </p>
          )}
        </div>

        {/* Variant list */}
        {hasVariants ? (
          <div className="space-y-1.5">
            {watch.variants!.map((v) => (
              <VariantRow
                key={v.id}
                variant={v}
                pref={watch.notes?.variantPreferences?.[v.id]}
                onTogglePref={(p) => toggleVariantPref(v.id, p)}
              />
            ))}
          </div>
        ) : (
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

        {/* Shared specs for variant watches */}
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

        {/* Scores */}
        {hasScores && (
          <div className="space-y-1.5 pt-1 border-t border-zinc-800">
            <ScorePip label="Fit" value={watch.notes?.fitScore ?? 0} />
            <ScorePip label="Dial" value={watch.notes?.dialScore ?? 0} />
          </div>
        )}

        {/* Tier selector + notes button */}
        <div className="flex items-center justify-between mt-auto pt-1 gap-2">
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
