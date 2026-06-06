"use client";

import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number; // 0–10
  onChange: (v: number) => void;
  description?: string;
}

export function ScoreSlider({ label, value, onChange, description }: Props) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
            {label}
          </p>
          {description && (
            <p className="text-[10px] text-zinc-700 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-bold text-[#b8973a] tabular-nums leading-none">
            {value}
          </span>
          <span className="text-sm text-zinc-600 mb-0.5">/10</span>
        </div>
      </div>

      {/* Segmented bar + invisible native slider overlaid */}
      <div className="relative h-5 flex items-center">
        {/* Visual segments */}
        <div className="flex gap-1 w-full h-2 pointer-events-none">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-full transition-all duration-75",
                i < value
                  ? "bg-[#b8973a]"
                  : "bg-zinc-800"
              )}
            />
          ))}
        </div>
        {/* Native input overlaid (transparent) */}
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="score-slider absolute inset-0 w-full"
          aria-label={label}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-zinc-700">
        <span>Didn&apos;t work</span>
        <span>Perfect</span>
      </div>
    </div>
  );
}
