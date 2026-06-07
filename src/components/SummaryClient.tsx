"use client";

import { useState, useEffect } from "react";
import type { WatchModel } from "@/types/watch";
import { cn, likenessScore, getBrandGradient } from "@/lib/utils";
import { ArrowLeft, Printer, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

function ModelSummaryRow({ model, rank }: { model: WatchModel; rank: number }) {
  const score = likenessScore(model);
  const preferred = model.variants.filter((v) => v.reaction === "preferred");
  const passed = model.variants.filter((v) => v.reaction === "pass");
  const topPickVariant = model.variants.find((v) => v.id === model.topPickVariantId);

  return (
    <div className="border border-zinc-800 rounded-2xl overflow-hidden print:border-zinc-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 print:bg-zinc-100 border-b border-zinc-800 print:border-zinc-300">
        <div className="flex-shrink-0 w-6 text-center">
          <span className="text-sm font-bold text-zinc-500">{rank}</span>
        </div>
        <div className={cn("w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br flex-shrink-0", getBrandGradient(model.brand))}>
          {model.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={model.heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 text-xs">{model.brand[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-widest text-zinc-500">{model.brand}</p>
          <p
            className="text-sm font-light text-[#FAF6EE] print:text-black leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {model.name}
          </p>
        </div>
        {score !== null && (
          <div className="flex-shrink-0 text-right">
            <span className="text-[#b8973a] text-sm font-semibold">{score}%</span>
            <p className="text-[9px] text-zinc-600 print:text-zinc-500">preferred</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Top pick */}
        {topPickVariant && (
          <div className="flex items-center gap-2">
            <Star size={11} className="text-[#b8973a] fill-[#b8973a] flex-shrink-0" />
            <span className="text-[11px] text-[#b8973a] font-medium">{topPickVariant.label}</span>
            <span
              className="text-[10px] text-zinc-600"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {topPickVariant.reference}
            </span>
          </div>
        )}

        {/* Preferred variants */}
        {preferred.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1.5">Preferred</p>
            <div className="flex flex-wrap gap-1.5">
              {preferred.map((v) => (
                <span
                  key={v.id}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-xl border",
                    v.id === model.topPickVariantId
                      ? "bg-[#b8973a]/10 border-[#b8973a]/30 text-[#b8973a]"
                      : "bg-[#F5E6C8]/5 border-[#F5E6C8]/15 text-[#F5E6C8]/80"
                  )}
                >
                  {v.id === model.topPickVariantId && "★ "}{v.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Passed */}
        {passed.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1.5">Passed</p>
            <div className="flex flex-wrap gap-1.5">
              {passed.map((v) => (
                <span
                  key={v.id}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-600 line-through"
                >
                  {v.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick tags */}
        {model.reactionTags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.reactionTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-[#b8973a]/10 text-[#b8973a]/80 border border-[#b8973a]/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Likeness bar */}
        {score !== null && (
          <div className="h-0.5 w-full bg-zinc-800 rounded-full print:bg-zinc-200 overflow-hidden">
            <div className="h-full bg-[#b8973a] rounded-full" style={{ width: `${score}%` }} />
          </div>
        )}

        {/* Notes */}
        {model.notes && (
          <p className="text-xs text-zinc-500 print:text-zinc-600 leading-relaxed border-t border-zinc-800 print:border-zinc-200 pt-2">
            &ldquo;{model.notes}&rdquo;
          </p>
        )}
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

  const topModel = models.find((m) => m.topPickVariantId || m.variants.some((v) => v.reaction === "preferred"));
  const topPickVariant = topModel?.variants.find((v) => v.id === topModel.topPickVariantId);

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

        {/* Top pick hero */}
        {(topPickVariant || topModel) && (
          <div className="mt-6 mb-8 px-4 py-4 rounded-2xl border border-[#b8973a]/20 bg-[#b8973a]/5">
            <p className="text-[9px] uppercase tracking-widest text-[#b8973a]/70 mb-1">Top pick</p>
            <p
              className="text-2xl font-light text-[#FAF6EE] print:text-black"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {topModel!.brand} {topModel!.name}
            </p>
            {topPickVariant && (
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                <Star size={10} className="text-[#b8973a] fill-[#b8973a]" />
                {topPickVariant.label}
                <span className="text-zinc-600" style={{ fontFamily: "var(--font-mono)" }}>
                  {topPickVariant.reference}
                </span>
              </p>
            )}
          </div>
        )}

        {models.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-600 text-sm">No watches rated yet.</p>
            <Link href="/" className="inline-block mt-4 text-xs text-[#b8973a] hover:underline">
              Go to collection →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
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
              fgColor="#b8973a"
            />
          </div>
        )}
      </div>
    </div>
  );
}
