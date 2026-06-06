"use client";

import { useState } from "react";
import type { Watch, WatchStyle } from "@/types/watch";
import { cn, STYLE_LABELS, generateId } from "@/lib/utils";
import { X, Plus, Minus } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdd: (watch: Watch) => void;
  nextRank: number;
}

const STYLES: WatchStyle[] = [
  "diver",
  "sport",
  "dress",
  "pilot",
  "casual",
  "field",
];

export function AddWatchModal({ onClose, onAdd, nextRank }: Props) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [price, setPrice] = useState("");
  const [style, setStyle] = useState<WatchStyle>("sport");
  const [description, setDescription] = useState("");
  const [caseDiameter, setCaseDiameter] = useState("");
  const [caseMaterial, setCaseMaterial] = useState("");
  const [movement, setMovement] = useState("");
  const [powerReserve, setPowerReserve] = useState("");
  const [waterResistance, setWaterResistance] = useState("");
  const [bracelet, setBracelet] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#1a1a1a");
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);

  function addColor() {
    if (!colorName.trim()) return;
    setColors((prev) => [
      ...prev,
      { name: colorName.trim(), hex: colorHex },
    ]);
    setColorName("");
    setColorHex("#1a1a1a");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || !name.trim()) return;

    const watch: Watch = {
      id: generateId(),
      brand: brand.trim(),
      name: name.trim(),
      reference: reference.trim(),
      price: parseFloat(price) || 0,
      style,
      description: description.trim(),
      highlights: [],
      specs: {
        caseDiameter: caseDiameter.trim(),
        caseMaterial: caseMaterial.trim(),
        movement: movement.trim(),
        powerReserve: powerReserve.trim() || undefined,
        waterResistance: waterResistance.trim() || undefined,
        bracelet: bracelet.trim(),
      },
      colorOptions: colors,
      stockPhotos: [],
      wristPhotos: [],
      notes: "",
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
        className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">Add Watch</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {/* Brand + Name */}
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
                MSRP (USD)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="10550"
                className={inputClass}
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
              Style
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={cn(
                    "text-[11px] px-3 py-1 rounded-full border transition-all",
                    style === s
                      ? "bg-zinc-700 border-zinc-600 text-zinc-100"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  {STYLE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this watch worth considering?"
              className={inputClass}
              rows={3}
            />
          </div>

          {/* Specs */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
              Specs
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Case Size", caseDiameter, setCaseDiameter, "41mm"],
                ["Case Material", caseMaterial, setCaseMaterial, "Oystersteel"],
                ["Movement", movement, setMovement, "Cal. 3235"],
                ["Power Reserve", powerReserve, setPowerReserve, "70 hours"],
                ["Water Resistance", waterResistance, setWaterResistance, "300m"],
                ["Bracelet", bracelet, setBracelet, "Oyster"],
              ].map(([label, val, setter, ph]) => (
                <div key={label as string}>
                  <label className="block text-[10px] text-zinc-700 mb-1">
                    {label as string}
                  </label>
                  <input
                    type="text"
                    value={val as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    placeholder={ph as string}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
              Color Options
            </label>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-zinc-950 rounded-lg px-2 py-1"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-white/15"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs text-zinc-400">{c.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setColors((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="text-zinc-600 hover:text-red-400"
                    >
                      <Minus size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                placeholder="Color name (e.g. Black)"
                className={cn(inputClass, "flex-1")}
              />
              <button
                type="button"
                onClick={addColor}
                className="flex-shrink-0 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
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
