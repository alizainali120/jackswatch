"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantDraft {
  reference: string;
  label: string;
  link: string;
}

interface AddWatchModalProps {
  onClose: () => void;
  onAdd: (brand: string, name: string, variants: VariantDraft[]) => Promise<void>;
}

const emptyVariant = (): VariantDraft => ({ reference: "", label: "", link: "" });

export function AddWatchModal({ onClose, onAdd }: AddWatchModalProps) {
  const [visible, setVisible] = useState(false);
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function updateVariant(i: number, field: keyof VariantDraft, value: string) {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || !name.trim()) { setError("Brand and name are required."); return; }
    const filled = variants.filter((v) => v.reference.trim());
    if (filled.length === 0) { setError("At least one variant with a reference is required."); return; }
    setError(null);
    setSaving(true);
    try {
      await onAdd(brand.trim(), name.trim(), filled.map((v) => ({
        reference: v.reference.trim(),
        label: v.label.trim(),
        link: v.link.trim() || undefined,
      })));
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full bg-transparent border-b border-zinc-800 focus:border-[#b8973a]/50 px-0 py-1.5 text-sm text-[#FAF6EE] placeholder-zinc-700 focus:outline-none transition-colors";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        className={cn(
          "fixed z-50 flex flex-col bg-black",
          "bottom-0 inset-x-0 max-h-[92vh]",
          "md:inset-x-auto md:left-1/2 md:bottom-auto md:top-1/2",
          "md:w-full md:max-w-lg md:max-h-[85vh]",
          "md:-translate-x-1/2",
          "border-t border-[#b8973a]/20 md:border md:border-[#b8973a]/20",
          "transition-all duration-300 ease-out",
          visible
            ? "translate-y-0 opacity-100 md:-translate-y-1/2"
            : "translate-y-full opacity-0 md:translate-y-[-40%]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#b8973a]/15 flex-shrink-0">
          <p className="text-xs uppercase tracking-[0.25em] text-[#b8973a]" style={{ fontFamily: "var(--font-mono)" }}>
            Add Watch
          </p>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Model */}
          <section className="space-y-4">
            <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 pb-1 border-b border-zinc-800" style={{ fontFamily: "var(--font-mono)" }}>
              Model
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>Brand</label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Rolex"
                  className={inputCls}
                  style={{ fontFamily: "var(--font-sans)" }}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Submariner"
                  className={inputCls}
                  style={{ fontFamily: "var(--font-sans)" }}
                />
              </div>
            </div>
          </section>

          {/* Variants */}
          <section className="space-y-4">
            <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 pb-1 border-b border-zinc-800" style={{ fontFamily: "var(--font-mono)" }}>
              Variants
            </p>
            <div className="space-y-5">
              {variants.map((v, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-zinc-700 uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                      Variant {i + 1}
                    </span>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(i)} className="text-zinc-700 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>Reference</label>
                      <input
                        value={v.reference}
                        onChange={(e) => updateVariant(i, "reference", e.target.value)}
                        placeholder="124060"
                        className={cn(inputCls, "font-mono")}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>Label</label>
                      <input
                        value={v.label}
                        onChange={(e) => updateVariant(i, "label", e.target.value)}
                        placeholder="41mm · Black Dial · Bracelet"
                        className={inputCls}
                        style={{ fontFamily: "var(--font-sans)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 block" style={{ fontFamily: "var(--font-mono)" }}>Link (optional)</label>
                    <input
                      value={v.link}
                      onChange={(e) => updateVariant(i, "link", e.target.value)}
                      placeholder="https://..."
                      className={inputCls}
                      style={{ fontFamily: "var(--font-sans)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Plus size={12} />
              Add variant
            </button>
          </section>

          {error && (
            <p className="text-[10px] text-red-400" style={{ fontFamily: "var(--font-mono)" }}>{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-[#b8973a]/15 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-widest"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#F5E6C8] text-black px-6 py-2 text-[11px] font-medium tracking-widest uppercase hover:bg-[#FAF6EE] transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {saving ? "Adding…" : "Add Watch"}
          </button>
        </div>
      </div>
    </>
  );
}
