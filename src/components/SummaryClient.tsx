"use client";

import { useState, useEffect } from "react";
import type { WatchModel } from "@/types/watch";
import { cn, getBrandGradient } from "@/lib/utils";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

function ModelSummaryRow({ model, rank }: { model: WatchModel; rank: number }) {
  const preferred = model.variants.filter((v) => v.reaction === "preferred");

  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800 print:border-zinc-300 last:border-0">
      <span className="text-[11px] text-zinc-600 w-5 flex-shrink-0 pt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
        {rank}
      </span>
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
        <p className="text-sm font-light text-[#FAF6EE] print:text-black leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {model.name}
        </p>
        {preferred.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {preferred.map((v) => (
              <span
                key={v.id}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded border",
                  v.id === model.topPickVariantId
                    ? "bg-[#b8973a]/10 border-[#b8973a]/30 text-[#b8973a]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {v.id === model.topPickVariantId && "★ "}{v.reference}{v.label ? ` · ${v.label}` : ""}
              </span>
            ))}
          </div>
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
