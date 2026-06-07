"use client";

import type { WatchModel } from "@/types/watch";
import { cn, getBrandGradient, likenessScore, ratingLabel } from "@/lib/utils";

interface Props {
  model: WatchModel;
  onClick: () => void;
}

export function ModelCard({ model, onClick }: Props) {
  const score = likenessScore(model);
  const loved = model.variants.filter((v) => v.reaction === "love").length;
  const totalRated = model.variants.filter((v) => v.reaction !== null).length;
  const hasRatings = totalRated > 0;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#F5E6C8]/20 transition-colors duration-200 text-left w-full"
    >
      {/* Hero */}
      <div className={cn("relative h-52 bg-gradient-to-br", getBrandGradient(model.brand))}>
        {model.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={model.heroImage}
            alt={`${model.brand} ${model.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center select-none">
            <span className="text-[72px] font-thin text-white/8 leading-none">
              {model.brand[0]}
            </span>
            <span className="text-[10px] tracking-[0.35em] text-white/12 uppercase mt-2">
              {model.brand}
            </span>
          </div>
        )}

        {/* Likeness score badge */}
        {score !== null && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-[#b8973a]">{score}%</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 px-4 py-3.5 gap-2">
        <div>
          <p className="text-[9px] tracking-[0.25em] uppercase text-zinc-500 font-medium">
            {model.brand}
          </p>
          <h3
            className="text-base font-light tracking-wide text-[#FAF6EE] leading-tight mt-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {model.name}
          </h3>
        </div>

        {/* Rating summary or variant count */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-zinc-500">
            {hasRatings ? ratingLabel(model) : `${model.variants.length} variant${model.variants.length !== 1 ? "s" : ""}`}
          </p>
          {loved > 0 && (
            <span className="text-[10px] text-zinc-600">
              {totalRated}/{model.variants.length} rated
            </span>
          )}
        </div>

        {/* Likeness progress bar */}
        {score !== null && (
          <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#b8973a] rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}
