"use client";

import { useRef, useState } from "react";
import type { Watch, WatchNotes } from "@/types/watch";
import { cn, getBrandGradient } from "@/lib/utils";
import { compressImage } from "@/lib/storage";
import { ScoreSlider } from "@/components/ScoreSlider";
import { X, Camera, Trash2 } from "lucide-react";

interface Props {
  watch: Watch;
  onClose: () => void;
  onUpdate: (watch: Watch) => void;
}

const EMPTY_NOTES: WatchNotes = {
  fitScore: 0,
  dialScore: 0,
  overallNotes: "",
  wristPhoto: undefined,
};

export function NotesPanel({ watch, onClose, onUpdate }: Props) {
  const notes: WatchNotes = watch.notes ?? EMPTY_NOTES;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function patch(partial: Partial<WatchNotes>) {
    onUpdate({ ...watch, notes: { ...notes, ...partial } });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      patch({ wristPhoto: compressed });
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, right drawer on desktop */}
      <div className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:w-[420px] flex flex-col bg-zinc-900 border-t sm:border-t-0 sm:border-l border-zinc-800 shadow-2xl max-h-[90vh] sm:max-h-none overflow-hidden rounded-t-3xl sm:rounded-none">
        {/* Drag pill (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                getBrandGradient(watch.brand)
              )}
            >
              {watch.notes?.wristPhoto || watch.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watch.notes?.wristPhoto || watch.image}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-white/30 text-base font-thin">
                  {watch.brand[0]}
                </span>
              )}
            </div>
            <div>
              <p className="text-[9px] tracking-widest uppercase text-zinc-600">
                {watch.brand}
              </p>
              <p className="text-sm font-semibold text-zinc-100">{watch.name}</p>
              <p className="text-[10px] text-zinc-600 font-mono">
                {watch.reference}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-6 space-y-8">
            {/* Fit & Wrist Presence */}
            <ScoreSlider
              label="Fit & Wrist Presence"
              description="Did the size and weight feel right? Did it command the wrist?"
              value={notes.fitScore}
              onChange={(v) => patch({ fitScore: v })}
            />

            {/* Dial Legibility */}
            <ScoreSlider
              label="Dial Legibility"
              description="Could you read the time instantly? Was the dial beautiful?"
              value={notes.dialScore}
              onChange={(v) => patch({ dialScore: v })}
            />

            {/* Overall Notes */}
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
                Wrist Notes
              </p>
              <textarea
                value={notes.overallNotes}
                onChange={(e) => patch({ overallNotes: e.target.value })}
                placeholder="How did it feel? What stood out? First impression vs. after 10 minutes on wrist? Any hesitation?&#10;&#10;Transfer your showroom notes here while they're fresh…"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors leading-relaxed min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Wrist Photo */}
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">
                Wrist Photo
              </p>

              {notes.wristPhoto ? (
                <div className="relative rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={notes.wristPhoto}
                    alt="Wrist photo"
                    className="w-full max-h-64 object-cover rounded-xl"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white"
                      title="Replace photo"
                    >
                      <Camera size={13} />
                    </button>
                    <button
                      onClick={() => patch({ wristPhoto: undefined })}
                      className="p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-red-400"
                      title="Remove photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 transition-all"
                >
                  <Camera size={20} />
                  <span className="text-xs">
                    {uploading ? "Compressing…" : "Take or upload a wrist photo"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#b8973a]/10 border border-[#b8973a]/20 text-[#b8973a] text-sm font-medium hover:bg-[#b8973a]/20 transition-all"
          >
            Done
          </button>
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
    </>
  );
}
