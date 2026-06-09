"use client";

import { useState, useEffect, useRef } from "react";
import { Lock } from "lucide-react";

const PASSWORD = "jackali";
const STORAGE_KEY = "jacks-watch-access";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (unlocked === false) inputRef.current?.focus();
  }, [unlocked]);

  if (unlocked === null) return null;
  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setInput("");
      setTimeout(() => setShaking(false), 400);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(184,151,58,0.04) 0, rgba(184,151,58,0.04) 1px, transparent 0, transparent 48px), repeating-linear-gradient(90deg, rgba(184,151,58,0.04) 0, rgba(184,151,58,0.04) 1px, transparent 0, transparent 48px)",
        }}
      />

      <div className={`relative w-full max-w-xs${shaking ? " shake" : ""}`}>
        {/* Lock icon */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 border border-[#b8973a]/30 bg-[#b8973a]/8 flex items-center justify-center">
            <Lock size={20} className="text-[#b8973a]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Brand label */}
        <p
          className="text-center text-[9px] tracking-[0.45em] uppercase text-[#b8973a] mb-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Jack&apos;s Watch Guide
        </p>

        {/* Headline */}
        <h1
          className="text-center text-[30px] font-light text-[#FAF6EE] leading-tight mb-7"
          style={{ fontFamily: "var(--font-display)" }}
        >
          For your eyes only.
        </h1>

        {/* Joke */}
        <div className="border-t border-b border-zinc-800/60 py-4 mb-8 text-center">
          <p
            className="text-[11px] text-zinc-500 italic leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            &ldquo;Why did the watchmaker quit his job?
            <br />
            He felt his life was just ticking away.&rdquo;
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              ref={inputRef}
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="password"
              autoComplete="off"
              className={`w-full bg-zinc-950 border px-4 py-3 text-sm text-[#FAF6EE] tracking-[0.25em] placeholder:text-zinc-700 placeholder:tracking-[0.15em] focus:outline-none transition-colors ${
                error
                  ? "border-red-900"
                  : "border-zinc-800 focus:border-[#b8973a]/50"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            />
            {error && (
              <p
                className="text-[10px] text-red-600/80 mt-1.5 tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                wrong password — try again
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full border border-[#b8973a] text-[#b8973a] py-3 text-[11px] tracking-widest uppercase hover:bg-[#b8973a]/10 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Unlock the vault →
          </button>
        </form>
      </div>
    </div>
  );
}
