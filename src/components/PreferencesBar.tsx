"use client";

import { cn } from "@/lib/utils";
import type { ConditionPref, StrapPref, GlobalPrefs } from "@/types/watch";

interface Props {
  prefs: GlobalPrefs;
  onChange: (prefs: GlobalPrefs) => void;
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-[10px] font-medium tracking-wide rounded-lg transition-all",
        active
          ? "bg-[#b8973a]/20 border border-[#b8973a]/40 text-[#b8973a]"
          : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      {children}
    </button>
  );
}

export function PreferencesBar({ prefs, onChange }: Props) {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* Condition */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest text-zinc-600">Condition</span>
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 gap-0.5">
          {(["new", "either", "preowned"] as ConditionPref[]).map((c) => (
            <SegmentButton
              key={c}
              active={prefs.condition === c}
              onClick={() => onChange({ ...prefs, condition: c })}
            >
              {c === "new" ? "New" : c === "either" ? "Either" : "Pre-owned"}
            </SegmentButton>
          ))}
        </div>
      </div>

      {/* Strap */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest text-zinc-600">Strap</span>
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 gap-0.5">
          {(["bracelet", "any", "strap"] as StrapPref[]).map((s) => (
            <SegmentButton
              key={s}
              active={prefs.strap === s}
              onClick={() => onChange({ ...prefs, strap: s })}
            >
              {s === "bracelet" ? "Bracelet" : s === "any" ? "Any" : "Strap"}
            </SegmentButton>
          ))}
        </div>
      </div>
    </div>
  );
}
