"use client";

import { useRef, useState } from "react";
import type { Watch, WatchTier } from "@/types/watch";
import {
  cn,
  formatPrice,
  STYLE_COLORS,
  STYLE_LABELS,
  TIER_COLORS,
  TIER_LABELS,
  getBrandGradient,
} from "@/lib/utils";
import { compressImage } from "@/lib/storage";
import { Camera, FileText, ChevronDown } from "lucide-react";

interface Props {
  watch: Watch;
  onClick: () => void;
  onUpdate: (watch: Watch) => void;
}

const TIERS: WatchTier[] = ["must-have", "consider", "maybe", "pass"];

export function WatchCard({ watch, onClick, onUpdate }: Props) {
  const [photoMode, setPhotoMode] = useState<"stock" | "wrist">("stock");
  const [uploading, setUploading] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentPhotos =
    photoMode === "stock" ? watch.stockPhotos : watch.wristPhotos;
  const displayPhoto = currentPhotos[0] ?? null;
  const hasWristPhotos = watch.wristPhotos.length > 0;
  const hasStockPhotos = watch.stockPhotos.length > 0;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      onUpdate({
        ...watch,
        wristPhotos: [...watch.wristPhotos, compressed],
      });
      setPhotoMode("wrist");
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleTierChange(tier: WatchTier | undefined) {
    onUpdate({ ...watch, tier });
  }

  function handleNotesChange(notes: string) {
    onUpdate({ ...watch, notes });
  }

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
      {/* Photo area */}
      <div
        className={cn(
          "relative h-52 cursor-pointer group",
          `bg-gradient-to-br ${getBrandGradient(watch.brand)}`
        )}
        onClick={onClick}
      >
        {displayPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPhoto}
            alt={`${watch.brand} ${watch.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <span className="text-3xl font-thin tracking-widest text-white/20 uppercase">
              {watch.brand[0]}
            </span>
            <span className="text-[10px] tracking-widest text-white/15 uppercase">
              {watch.brand}
            </span>
          </div>
        )}

        {/* Rank badge */}
        <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-[#b8973a]">
            {watch.rank}
          </span>
        </div>

        {/* Tier badge */}
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

        {/* Photo mode toggle */}
        {(hasStockPhotos || hasWristPhotos) && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {hasStockPhotos && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoMode("stock");
                }}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                  photoMode === "stock"
                    ? "bg-white/20 text-white"
                    : "bg-black/40 text-white/50 hover:text-white"
                )}
              >
                Stock
              </button>
            )}
            {hasWristPhotos && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoMode("wrist");
                }}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-medium transition-all",
                  photoMode === "wrist"
                    ? "bg-white/20 text-white"
                    : "bg-black/40 text-white/50 hover:text-white"
                )}
              >
                Wrist
              </button>
            )}
          </div>
        )}

        {/* Upload button overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Brand + name */}
        <div className="cursor-pointer" onClick={onClick}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-medium">
              {watch.brand}
            </span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full border",
                STYLE_COLORS[watch.style]
              )}
            >
              {STYLE_LABELS[watch.style]}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
            {watch.name}
          </h3>
          <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
            {watch.reference}
          </p>
        </div>

        {/* Price */}
        <div className="text-[#b8973a] text-sm font-semibold">
          {formatPrice(watch.price)}
        </div>

        {/* Color swatches */}
        {watch.colorOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            {watch.colorOptions.map((c) => (
              <div
                key={c.name}
                title={c.name + (c.description ? ` — ${c.description}` : "")}
                className="w-4 h-4 rounded-full border border-white/15 cursor-default"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}

        {/* Tier selector */}
        <div className="flex flex-wrap gap-1">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => handleTierChange(watch.tier === t ? undefined : t)}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                watch.tier === t
                  ? TIER_COLORS[t]
                  : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-500"
              )}
            >
              {TIER_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Upload + notes row */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Camera size={13} />
            {uploading
              ? "Uploading…"
              : hasWristPhotos
              ? `${watch.wristPhotos.length} wrist photo${watch.wristPhotos.length !== 1 ? "s" : ""}`
              : "Wrist photo"}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setNotesOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1 text-[11px] transition-colors",
              notesOpen || watch.notes
                ? "text-[#b8973a]"
                : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            <FileText size={13} />
            <ChevronDown
              size={11}
              className={cn(
                "transition-transform",
                notesOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Notes */}
        {notesOpen && (
          <textarea
            value={watch.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Wrist notes, impressions, feelings…"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
            rows={3}
          />
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoUpload}
      />
    </div>
  );
}
