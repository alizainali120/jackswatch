"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { loadWatches } from "@/lib/storage";
import type { Watch } from "@/types/watch";
import { cn, TIER_LABELS, TIER_COLORS } from "@/lib/utils";
import { ArrowLeft, Printer, Star, Trophy } from "lucide-react";
import Link from "next/link";

export function ShareClient() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const ws = loadWatches();
    const sorted = [...ws].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
    setWatches(sorted);
    setShareUrl(window.location.href.replace(/\/share\/?$/, ""));
    setLoaded(true);
  }, []);

  const ratedWatches = watches.filter(
    (w) => (w.notes?.fitScore ?? 0) > 0 || (w.notes?.dialScore ?? 0) > 0
  );
  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function avgScore(watch: Watch) {
    if (!watch.notes) return null;
    const { fitScore, dialScore } = watch.notes;
    if (fitScore === 0 && dialScore === 0) return null;
    return ((fitScore + dialScore) / 2).toFixed(1);
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0c0c0d]">
        <p className="text-zinc-600 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-zinc-100">
      {/* Nav — hidden on print */}
      <div className="no-print max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-xs font-medium hover:bg-[#b8973a]/20 transition-all"
        >
          <Printer size={13} />
          Print / Save PDF
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 print-gold">
            Jack&apos;s Watch Rankings
          </h1>
          <p className="text-sm text-zinc-500 mt-1 print-muted">
            Curated by Ali · {generatedDate}
          </p>
        </div>

        {/* QR code + intro — hidden on print */}
        <div className="no-print flex flex-col sm:flex-row gap-6 items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex-shrink-0 p-3 bg-white rounded-xl">
            <QRCodeSVG
              value={shareUrl}
              size={100}
              bgColor="#ffffff"
              fgColor="#0c0c0d"
              level="M"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200 mb-1">
              Scan to open the guide
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Scan this QR code to open Jack&apos;s Watch Guide on any device.
              Rankings and notes are saved locally.
            </p>
            <p className="text-[10px] text-zinc-700 mt-2 font-mono break-all">
              {shareUrl}
            </p>
          </div>
        </div>

        {/* Print-only QR header */}
        <div className="print-only hidden mb-8 border border-zinc-300 rounded-xl p-4 flex gap-4 items-center">
          <div className="p-2 bg-white border border-gray-200 rounded-lg inline-block">
            <QRCodeSVG
              value={shareUrl}
              size={80}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-black">
              Scan to open the interactive guide
            </p>
            <p className="text-xs text-gray-600 mt-0.5 font-mono">{shareUrl}</p>
          </div>
        </div>

        {/* Ranked list */}
        <div className="space-y-4">
          <h2 className="text-[11px] uppercase tracking-widest text-zinc-600 print-muted">
            Rankings · {watches.length} watches
          </h2>

          {watches.map((watch, index) => {
            const score = avgScore(watch);
            return (
              <div
                key={watch.id}
                className={cn(
                  "print-card p-4 rounded-xl border transition-all",
                  index === 0
                    ? "border-[#b8973a]/30 bg-[#b8973a]/5"
                    : "border-zinc-800 bg-zinc-900"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 mt-0.5">
                    {index === 0 ? (
                      <Trophy size={18} className="text-[#b8973a] print-gold" />
                    ) : (
                      <span className="text-lg font-bold text-zinc-600 tabular-nums leading-none print-muted">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Watch thumb */}
                  {(watch.notes?.wristPhoto || watch.image) && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watch.notes?.wristPhoto || watch.image}
                        alt={watch.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-zinc-600 print-muted">
                          {watch.brand}
                        </p>
                        <h3 className="text-sm font-semibold text-zinc-100">
                          {watch.name}
                        </h3>
                        <p className="text-[10px] text-zinc-600 font-mono print-muted">
                          Ref. {watch.reference} · {watch.caseSize}
                        </p>
                      </div>
                      {score && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star
                            size={11}
                            className="text-[#b8973a] print-gold"
                          />
                          <span className="text-sm font-bold text-[#b8973a] tabular-nums print-gold">
                            {score}
                          </span>
                          <span className="text-[10px] text-zinc-600 print-muted">
                            /10
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Scores breakdown */}
                    {(watch.notes?.fitScore ?? 0) > 0 ||
                    (watch.notes?.dialScore ?? 0) > 0 ? (
                      <div className="flex gap-4 mt-2">
                        <div className="text-[10px]">
                          <span className="text-zinc-600 print-muted">
                            Fit{" "}
                          </span>
                          <span className="text-zinc-300 font-semibold">
                            {watch.notes?.fitScore}/10
                          </span>
                        </div>
                        <div className="text-[10px]">
                          <span className="text-zinc-600 print-muted">
                            Dial{" "}
                          </span>
                          <span className="text-zinc-300 font-semibold">
                            {watch.notes?.dialScore}/10
                          </span>
                        </div>
                        {watch.tier && (
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full border",
                              TIER_COLORS[watch.tier]
                            )}
                          >
                            {TIER_LABELS[watch.tier]}
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* Notes */}
                    {watch.notes?.overallNotes && (
                      <p className="text-[11px] text-zinc-500 mt-2 italic leading-relaxed border-l-2 border-zinc-700 pl-2.5 print-muted">
                        {watch.notes.overallNotes}
                      </p>
                    )}

                    {/* Recommendation */}
                    {watch.recommendation && !watch.notes?.overallNotes && (
                      <p className="text-[11px] text-zinc-600 mt-2 italic leading-relaxed print-muted">
                        {watch.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats — if watches have been rated */}
        {ratedWatches.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <h2 className="text-[11px] uppercase tracking-widest text-zinc-600 mb-4 print-muted">
              Score Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ratedWatches
                .sort((a, b) => {
                  const aAvg =
                    ((a.notes?.fitScore ?? 0) + (a.notes?.dialScore ?? 0)) / 2;
                  const bAvg =
                    ((b.notes?.fitScore ?? 0) + (b.notes?.dialScore ?? 0)) / 2;
                  return bAvg - aAvg;
                })
                .map((w) => (
                  <div
                    key={w.id}
                    className="print-card bg-zinc-900 border border-zinc-800 rounded-xl p-3"
                  >
                    <p className="text-[10px] text-zinc-600 truncate print-muted">
                      {w.brand}
                    </p>
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {w.name}
                    </p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-[10px] text-zinc-500 print-muted">
                        Fit:{" "}
                        <strong className="text-zinc-300">
                          {w.notes?.fitScore}
                        </strong>
                      </span>
                      <span className="text-[10px] text-zinc-500 print-muted">
                        Dial:{" "}
                        <strong className="text-zinc-300">
                          {w.notes?.dialScore}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-zinc-700 print-muted">
            Jack&apos;s Watch Guide · {generatedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
