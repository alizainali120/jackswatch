"use client";

import { useState, useEffect } from "react";
import type { WatchModel } from "@/types/watch";
import { cn } from "@/lib/utils";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

function ModelSummaryRow({ model, rank }: { model: WatchModel; rank: number }) {
  const preferred = model.variants.filter((v) => v.reaction === "preferred");

  return (
    <div className="py-5 border-b border-zinc-800/60 print:border-zinc-200 last:border-0">
      {/* Rank + brand + name */}
      <div className="flex items-baseline gap-3 mb-2">
        <span
          className="text-[11px] text-zinc-600 print:text-zinc-400 tabular-nums w-4 flex-shrink-0"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {rank}
        </span>
        <div>
          <span
            className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 print:text-zinc-400 mr-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {model.brand}
          </span>
          <span
            className="text-base font-light text-[#FAF6EE] print:text-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {model.name}
          </span>
        </div>
      </div>

      {/* Variants — one per line, indented */}
      {preferred.length > 0 && (
        <div className="ml-7 space-y-1">
          {preferred.map((v) => {
            const isTopPick = v.id === model.topPickVariantId;
            return (
              <div key={v.id} className="flex items-baseline gap-2">
                <span className="text-zinc-700 print:text-zinc-400 flex-shrink-0 text-[10px]">—</span>
                <p
                  className="text-[11px] text-zinc-300 print:text-zinc-700 leading-snug"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span className={cn(isTopPick && "text-[#b8973a] print:text-black font-medium")}>
                    {v.reference}
                  </span>
                  {v.label && (
                    <span className="text-zinc-500 print:text-zinc-500"> · {v.label}</span>
                  )}
                  {isTopPick && (
                    <span className="text-zinc-600 print:text-zinc-400 ml-2 text-[10px] not-italic">(top pick)</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
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
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft size={13} />
            Collection
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#b8973a] transition-colors"
          >
            <Printer size={13} />
            Print
          </button>
        </div>

        <h1
          className="text-4xl font-light tracking-[0.2em] uppercase text-[#FAF6EE] print:text-black mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Jack&apos;s Verdict
        </h1>
        <p className="text-[10px] tracking-widest text-zinc-600 uppercase mb-2">
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>

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

        {/* Footer + QR */}
        {models.length > 0 && (
          <div className="mt-10 pt-6 border-t border-zinc-800 print:border-zinc-300 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">Jack&apos;s Watch Guide</p>
              <p
                className="text-[10px] text-zinc-700 mt-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                alizainali.com/jackswatch
              </p>
            </div>
            <QRCodeSVG
              value="https://alizainali.com/jackswatch"
              size={56}
              bgColor="transparent"
              fgColor="#ffffff"
            />
          </div>
        )}
      </div>
    </div>
  );
}
