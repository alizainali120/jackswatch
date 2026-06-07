"use client";

import { useState, useEffect } from "react";
import type { WatchModel } from "@/types/watch";
import { cn } from "@/lib/utils";
import { Printer, Loader2, Watch as WatchIcon } from "lucide-react";
import Link from "next/link";

function ModelSummaryRow({ model, rank }: { model: WatchModel; rank: number }) {
  const preferred = model.variants
    .filter((v) => v.reaction === "preferred")
    .sort((a, b) => {
      if (a.id === model.topPickVariantId) return -1;
      if (b.id === model.topPickVariantId) return 1;
      return 0;
    });

  return (
    <div className="py-3 border-b border-zinc-800/40 print:border-zinc-300 last:border-0 print:py-2">
      <div className="flex items-baseline gap-3">
        <div className="flex flex-col items-center flex-shrink-0 w-6">
          <span
            className="text-[11px] text-zinc-500 print:text-zinc-500 tabular-nums leading-none"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {rank}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1.5">
            <p
              className="text-[11px] text-[#FAF6EE] print:text-black leading-tight"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="text-zinc-400 print:text-zinc-500">{model.brand}</span>
              <span className="text-zinc-600 print:text-zinc-400 mx-1">-</span>
              {model.name}
            </p>
          </div>

          {preferred.length > 0 && (
            <div className="space-y-0.5">
              {preferred.map((v) => {
                const isTopPick = v.id === model.topPickVariantId;
                return (
                  <div key={v.id} className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "text-[11px] leading-relaxed",
                        isTopPick
                          ? "text-[#b8973a] print:text-black"
                          : "text-zinc-400 print:text-zinc-700"
                      )}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {v.reference}
                    </span>
                    {v.label && (
                      <span
                        className="text-[11px] text-zinc-600 print:text-zinc-500 leading-relaxed"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        · {v.label}
                      </span>
                    )}
                    {isTopPick && (
                      <span
                        className="text-[11px] text-[#b8973a] print:text-zinc-500 leading-relaxed"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        [top pick]
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SummaryClient() {
  const [models, setModels] = useState<WatchModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/watches")
      .then((r) => r.json())
      .then((data: WatchModel[]) => {
        const rated = data
          .filter((m) => m.variants.some((v) => v.reaction !== null))
          .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
        setModels(rated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 size={16} className="animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FAF6EE] print:bg-white print:text-black">
      <div className="max-w-xl mx-auto px-4 py-8 print:py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/50 print:border-zinc-300">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 bg-[#b8973a]/15 border border-[#b8973a]/30 flex items-center justify-center flex-shrink-0 print:hidden">
              <WatchIcon size={11} className="text-[#b8973a] print:text-black" />
            </div>
            <div>
              <span
                className="text-xs font-semibold tracking-widest uppercase text-zinc-100 print:text-black block"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Jack&apos;s Watch Guide
              </span>
              <span
                className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 print:text-zinc-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Preferred Picks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <Link
              href="/"
              className="border border-[#b8973a]/40 text-[#b8973a] text-[11px] tracking-widest uppercase px-3 py-1.5 hover:bg-[#b8973a]/10 transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              All Watches
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#b8973a] transition-colors"
            >
              <Printer size={13} />
              Print
            </button>
          </div>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">No watches rated yet.</p>
            <Link href="/" className="inline-block mt-4 text-xs text-[#b8973a] hover:underline">
              Go to collection →
            </Link>
          </div>
        ) : (
          <div>
            {models.map((model, i) => (
              <ModelSummaryRow key={model.id} model={model} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Footer — screen only */}
        {models.length > 0 && (
          <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-end print:hidden">
            <p
              className="text-[11px] text-zinc-600"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              alizainali.com/jackswatch
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
