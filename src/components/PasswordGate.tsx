"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Lock, LockOpen } from "lucide-react";

const PASSWORD = "jackali";
const STORAGE_KEY = "jacks-watch-access";

const QUOTES = [
  "The right watch for the biggest chapter yet. Let's find it.",
  "Every great love story deserves a great watch to mark it.",
  "You're not just picking a watch — you're picking a witness to the best moments ahead.",
  "A marriage, a milestone, a timepiece. Some things are meant to last forever.",
  "Family helps you pick the watch. The watch helps you remember why.",
  "Here's to the man, the moment, and the watch that ties it all together.",
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning, Jack.";
  if (h < 18) return "Good afternoon, Jack.";
  return "Good evening, Jack.";
}

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    setUnlocked(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (unlocked === false) inputRef.current?.focus();
  }, [unlocked]);

  if (unlocked === null) return null;
  if (unlocked && !transitioning) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.toLowerCase().trim() === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setTransitioning(true);
      setTimeout(() => {
        setUnlocked(true);
        setTimeout(() => setTransitioning(false), 50);
      }, 800);
    } else {
      setError(true);
      setShaking(true);
      setInput("");
      setTimeout(() => setShaking(false), 400);
      inputRef.current?.focus();
    }
  }

  return (
    <div
      className={`min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden transition-opacity duration-700 ${
        transitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      style={{ transitionProperty: "opacity, transform" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(184,151,58,0.04) 0, rgba(184,151,58,0.04) 1px, transparent 0, transparent 48px), repeating-linear-gradient(90deg, rgba(184,151,58,0.04) 0, rgba(184,151,58,0.04) 1px, transparent 0, transparent 48px)",
        }}
      />

      <div className={`relative w-full max-w-xs${shaking ? " shake" : ""}`}>
        <div className="flex justify-center mb-8">
          <div className="lock-icon-container w-16 h-16 border border-[#b8973a]/30 bg-[#b8973a]/8 flex items-center justify-center relative">
            {transitioning ? (
              <LockOpen size={22} className="text-[#b8973a] lock-open-animate" strokeWidth={1.5} />
            ) : (
              <Lock size={22} className="text-[#b8973a]" strokeWidth={1.5} />
            )}
            <div className="lock-glow" />
          </div>
        </div>

        <p
          className="text-center text-[9px] tracking-[0.45em] uppercase text-[#b8973a] mb-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Jack&apos;s Watch Guide
        </p>

        <h1
          className="text-center text-[28px] font-light text-[#FAF6EE] leading-tight mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {transitioning ? "Welcome back." : getGreeting()}
        </h1>
        <p
          className="text-center text-[11px] text-zinc-500 mb-7"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {transitioning
            ? "Opening the vault\u2026"
            : "Enter the password to access your collection."}
        </p>

        <div className="border-t border-b border-zinc-800/60 py-4 mb-8 text-center">
          <p
            className="text-[11px] text-zinc-600 italic leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            &ldquo;{quote}&rdquo;
          </p>
        </div>

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
            disabled={transitioning}
            className="w-full border border-[#b8973a] text-[#b8973a] py-3 text-[11px] tracking-widest uppercase hover:bg-[#b8973a]/10 transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {transitioning ? "Unlocking\u2026" : "Unlock the vault \u2192"}
          </button>
        </form>

        <p
          className="text-center text-[9px] text-zinc-700 mt-6 tracking-wider"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          hint: first name + last name, no space
        </p>
      </div>
    </div>
  );
}
