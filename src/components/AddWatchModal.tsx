"use client";

import { useState } from "react";
import type { Watch } from "@/types/watch";
import { generateId } from "@/lib/utils";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdd: (watch: Watch) => void;
  nextRank: number;
}

export function AddWatchModal({ onClose, onAdd, nextRank }: Props) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [caseSize, setCaseSize] = useState("");
  const [movement, setMovement] = useState("");
  const [powerReserve, setPowerReserve] = useState("");
  const [image, setImage] = useState("");
  const [recommendation, setRecommendation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || !name.trim()) return;

    const watch: Watch = {
      id: generateId(),
      brand: brand.trim(),
      name: name.trim(),
      reference: reference.trim(),
      caseSize: caseSize.trim(),
      movement: movement.trim(),
      powerReserve: powerReserve.trim(),
      image: image.trim(),
      recommendation: recommendation.trim(),
      rank: nextRank,
    };

    onAdd(watch);
    onClose();
  }

  const inputClass =
    "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">Add Watch</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Brand *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Rolex"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Model *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Submariner Date"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="126610LN"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Case Size
              </label>
              <input
                type="text"
                value={caseSize}
                onChange={(e) => setCaseSize(e.target.value)}
                placeholder="41mm"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Movement
              </label>
              <input
                type="text"
                value={movement}
                onChange={(e) => setMovement(e.target.value)}
                placeholder="Cal. 3235"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                Power Reserve
              </label>
              <input
                type="text"
                value={powerReserve}
                onChange={(e) => setPowerReserve(e.target.value)}
                placeholder="70 hours"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
              Recommendation
            </label>
            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Why is this watch worth considering? What's the pitch?"
              className={inputClass}
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-zinc-300 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-sm font-medium px-5 py-2 rounded-xl bg-[#b8973a]/15 border border-[#b8973a]/30 text-[#b8973a] hover:bg-[#b8973a]/25 transition-all"
          >
            Add Watch
          </button>
        </div>
      </form>
    </div>
  );
}
