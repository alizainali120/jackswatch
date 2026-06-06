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
import {
  X,
  Camera,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface Props {
  watch: Watch;
  onClose: () => void;
  onUpdate: (watch: Watch) => void;
  onDelete: (id: string) => void;
}

const TIERS: WatchTier[] = ["must-have", "consider", "maybe", "pass"];

export function WatchModal({ watch, onClose, onUpdate, onDelete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoMode, setPhotoMode] = useState<"stock" | "wrist">("stock");
  const [urlInput, setUrlInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const currentPhotos =
    photoMode === "stock" ? watch.stockPhotos : watch.wristPhotos;
  const safeIndex = Math.min(photoIndex, Math.max(0, currentPhotos.length - 1));
  const displayPhoto = currentPhotos[safeIndex] ?? null;
  const allPhotos = [...watch.stockPhotos, ...watch.wristPhotos];

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const updated = {
        ...watch,
        wristPhotos: [...watch.wristPhotos, compressed],
      };
      onUpdate(updated);
      setPhotoMode("wrist");
      setPhotoIndex(updated.wristPhotos.length - 1);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleAddStockUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onUpdate({ ...watch, stockPhotos: [...watch.stockPhotos, url] });
    setUrlInput("");
    setPhotoMode("stock");
    setPhotoIndex(watch.stockPhotos.length);
  }

  function handleRemoveCurrentPhoto() {
    if (photoMode === "stock") {
      const updated = watch.stockPhotos.filter((_, i) => i !== safeIndex);
      onUpdate({ ...watch, stockPhotos: updated });
      setPhotoIndex(Math.max(0, safeIndex - 1));
    } else {
      const updated = watch.wristPhotos.filter((_, i) => i !== safeIndex);
      onUpdate({ ...watch, wristPhotos: updated });
      setPhotoIndex(Math.max(0, safeIndex - 1));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-zinc-500">
              {watch.brand}
            </p>
            <h2 className="text-base font-semibold text-zinc-100">
              {watch.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#b8973a]">
              {formatPrice(watch.price)}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo section */}
          <div
            className={cn(
              "relative h-60 sm:h-72 flex-shrink-0 bg-gradient-to-br",
              getBrandGradient(watch.brand)
            )}
          >
            {displayPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayPhoto}
                alt={watch.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <span className="text-5xl font-thin text-white/10 uppercase tracking-widest">
                  {watch.brand[0]}
                </span>
                <span className="text-[11px] text-white/20 tracking-widest uppercase">
                  No photo
                </span>
              </div>
            )}

            {/* Nav arrows */}
            {currentPhotos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setPhotoIndex((i) =>
                      i === 0 ? currentPhotos.length - 1 : i - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setPhotoIndex((i) =>
                      i === currentPhotos.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Photo mode tabs */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/60 rounded-full p-1">
              {watch.stockPhotos.length > 0 && (
                <button
                  onClick={() => {
                    setPhotoMode("stock");
                    setPhotoIndex(0);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-medium transition-all",
                    photoMode === "stock"
                      ? "bg-white/20 text-white"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  Stock ({watch.stockPhotos.length})
                </button>
              )}
              {watch.wristPhotos.length > 0 && (
                <button
                  onClick={() => {
                    setPhotoMode("wrist");
                    setPhotoIndex(0);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-medium transition-all",
                    photoMode === "wrist"
                      ? "bg-white/20 text-white"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  Wrist ({watch.wristPhotos.length})
                </button>
              )}
            </div>

            {/* Remove photo */}
            {displayPhoto && (
              <button
                onClick={handleRemoveCurrentPhoto}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 text-red-400 flex items-center justify-center hover:bg-red-500/20"
                title="Remove this photo"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Photo actions */}
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Camera size={14} />
              {uploading ? "Uploading…" : "Upload wrist photo"}
            </button>
            <span className="text-zinc-700">·</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddStockUrl()}
                placeholder="Paste stock photo URL…"
                className="flex-1 min-w-0 bg-transparent text-xs text-zinc-400 placeholder-zinc-700 focus:outline-none focus:text-zinc-200"
              />
              {urlInput && (
                <button
                  onClick={handleAddStockUrl}
                  className="flex-shrink-0 flex items-center gap-1 text-[11px] text-[#b8973a] hover:text-[#d4aa4d]"
                >
                  <ExternalLink size={11} />
                  Add
                </button>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {allPhotos.length > 1 && (
            <div className="px-5 py-3 border-b border-zinc-800 flex gap-2 overflow-x-auto">
              {watch.stockPhotos.map((p, i) => (
                <button
                  key={`stock-${i}`}
                  onClick={() => {
                    setPhotoMode("stock");
                    setPhotoIndex(i);
                  }}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                    photoMode === "stock" && safeIndex === i
                      ? "border-[#b8973a]"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {watch.wristPhotos.map((p, i) => (
                <button
                  key={`wrist-${i}`}
                  onClick={() => {
                    setPhotoMode("wrist");
                    setPhotoIndex(i);
                  }}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all",
                    photoMode === "wrist" && safeIndex === i
                      ? "border-[#b8973a]"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="px-5 py-5 space-y-5">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full border",
                  STYLE_COLORS[watch.style]
                )}
              >
                {STYLE_LABELS[watch.style]}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 font-mono">
                {watch.reference}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400">
                #{watch.rank}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 leading-relaxed">
              {watch.description}
            </p>

            {/* Highlights */}
            <div>
              <h3 className="text-[10px] tracking-widest uppercase text-zinc-600 mb-2">
                Key Highlights
              </h3>
              <ul className="space-y-1.5">
                {watch.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-[#b8973a] mt-1.5 w-1 h-1 rounded-full bg-[#b8973a] flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specs grid */}
            <div>
              <h3 className="text-[10px] tracking-widest uppercase text-zinc-600 mb-2">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries({
                  "Case Size": watch.specs.caseDiameter,
                  ...(watch.specs.caseThickness
                    ? { Thickness: watch.specs.caseThickness }
                    : {}),
                  Material: watch.specs.caseMaterial,
                  Movement: watch.specs.movement,
                  ...(watch.specs.powerReserve
                    ? { "Power Reserve": watch.specs.powerReserve }
                    : {}),
                  ...(watch.specs.waterResistance
                    ? { "Water Resist.": watch.specs.waterResistance }
                    : {}),
                  Crystal: watch.specs.crystal ?? "—",
                  Bracelet: watch.specs.bracelet,
                }).map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-zinc-950 rounded-lg px-3 py-2"
                  >
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    <p className="text-xs text-zinc-300 leading-snug">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Color options */}
            {watch.colorOptions.length > 0 && (
              <div>
                <h3 className="text-[10px] tracking-widest uppercase text-zinc-600 mb-2">
                  Color Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {watch.colorOptions.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 bg-zinc-950 rounded-lg px-3 py-2"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div>
                        <p className="text-xs font-medium text-zinc-300">
                          {c.name}
                        </p>
                        {c.description && (
                          <p className="text-[10px] text-zinc-600">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tier */}
            <div>
              <h3 className="text-[10px] tracking-widest uppercase text-zinc-600 mb-2">
                My Ranking
              </h3>
              <div className="flex flex-wrap gap-2">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      onUpdate({
                        ...watch,
                        tier: watch.tier === t ? undefined : t,
                      })
                    }
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-all",
                      watch.tier === t
                        ? TIER_COLORS[t]
                        : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {TIER_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-[10px] tracking-widest uppercase text-zinc-600 mb-2">
                Wrist Notes
              </h3>
              <textarea
                value={watch.notes}
                onChange={(e) => onUpdate({ ...watch, notes: e.target.value })}
                placeholder="How did it feel on the wrist? What stood out? Any concerns?&#10;Transfer your showroom impressions here…"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors leading-relaxed"
                rows={4}
              />
            </div>

            {/* Delete */}
            <div className="pt-2 border-t border-zinc-800">
              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-red-400">Remove this watch?</span>
                  <button
                    onClick={() => onDelete(watch.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors"
                  >
                    Yes, remove
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                  Remove watch
                </button>
              )}
            </div>
          </div>
        </div>
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
