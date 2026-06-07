"use client";

import { useState, useEffect } from "react";
import type { WatchModel } from "@/types/watch";
import { cn, likenessScore, getBrandGradient } from "@/lib/utils";
import { ArrowLeft, Trophy, Printer } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

function ModelSummaryRow({ model, rank }: { model: WatchModel; rank: number }) {
  const score = likenessScore(model);
  const loved = model.variants.filter((v) => v.reaction === "love");
  const considering = model.variants.filter((v) => v.reaction === "consider");
  const tryAgain = model.variants.filter((v) => v.tryAgain);

  return (
    <div className="border border-zinc-800 rounded-2xl overflow-hidden print:border-zinc-300">
      {/* Model header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 print:bg-zinc-100 border-b border-zinc-800 print:border-zinc-300">
        <div className="flex-shrink-0 w-7 text-center">
          {rank === 1 ? (
            <Trophy size={14} className="text-[#b8973a] mx-auto" />
          ) : (
            <span className="text-sm font-bold text-zinc-500">{rank}</span>
          )}
        </div>
        <div
          className={cn("w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br flex-shrink-0", getBrandGradient(model.brand))}
        >
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
            <p className="text-[9px] text-zinc-600 print:text-zinc-500">likeness</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Loved */}
        {loved.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1.5">Loved</p>
            <div className="flex flex-wrap gap-1.5">
              {loved.map((v) => (
                <span
                  key={v.id}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-rose-950/30 border border-rose-800/30 text-rose-300 print:bg-rose-50 print:border-rose-200 print:text-rose-700"
                >
                  ❤️ {v.label} {v.reference && <span className="opacity-60 font-mono">{v.reference}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Considering */}
        {considering.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1.5">Considering</p>
            <div className="flex flex-wrap gap-1.5">
              {considering.map((v) => (
                <span
                  key={v.id}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-950/20 border border-amber-800/20 text-amber-400 print:bg-amber-50 print:border-amber-200 print:text-amber-700"
                >
                  👍 {v.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Try again */}
        {tryAgain.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1.5">Try again next time</p>
            <div className="flex flex-wrap gap-1.5">
              {tryAgain.map((v) => (
                <span
                  key={v.id}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-blue-950/20 border border-blue-800/20 text-blue-400 print:bg-blue-50 print:border-blue-200 print:text-blue-700"
                >
                  ↩ {v.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Likeness bar */}
        {score !== null && (
          <div className="h-0.5 w-full bg-zinc-800 rounded-full print:bg-zinc-200 overflow-hidden">
            <div
              className="h-full bg-[#b8973a] rounded-full"
              style={{ width: `${score}%` }}
            />
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

  const lovedModels = models.filter((m) => m.variants.some((v) => v.reaction === "love"));
  const topPick = lovedModels[0] ?? null;

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
          Jack&apos;s Watch Guide · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>

        {/* Top pick hero */}
        {topPick && (
          <div className="mt-6 mb-8 px-4 py-4 rounded-2xl border border-[#b8973a]/20 bg-[#b8973a]/5 print:bg-yellow-50 print:border-yellow-200">
            <p className="text-[9px] uppercase tracking-widest text-[#b8973a]/70 mb-1">Top pick</p>
            <p
              className="text-2xl font-light text-[#FAF6EE] print:text-black"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {topPick.brand} {topPick.name}
            </p>
            {topPick.variants.filter((v) => v.reaction === "love").length > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                ❤️ {topPick.variants.filter((v) => v.reaction === "love").map((v) => v.label).join(", ")}
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

        {/* QR code + footer */}
        {models.length > 0 && (
          <div className="mt-10 pt-6 border-t border-zinc-800 print:border-zinc-300 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">Jack&apos;s Watch Guide</p>
              <p className="text-[10px] text-zinc-700 mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
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
