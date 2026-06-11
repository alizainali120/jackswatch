"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Lock, LockOpen } from "lucide-react";

const PASSWORD = "wristcheck";
const STORAGE_KEY = "jwg_unlocked";

const QUOTES = [
  "Ali spent hours on this. The least you can do is pick something.",
  "I am so excited to get a watch for Mr Gupta!",
  "Make a cup of decaf coffee and shortlist some watches.",
  "Time to watch some Teddy videos!",
  "Assalam o Alaikum!"
];

const ERROR_MESSAGES = [
  "Not even close, Jack.",
  "WTF man!, Try again",
  "Ali is shaking his head somewhere.",
  "So dumb of you!",
  "No wings for you!"
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
  const [fading, setFading] = useState(false);
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [focused, setFocused] = useState(false);
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
      setErrorMsg(null);
      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setUnlocked(true);
          setTransitioning(false);
          setFading(false);
        }, 700);
      }, 800);
    } else {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      setErrorMsg(ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]);
      setShaking(true);
      setInput("");
      setTimeout(() => setShaking(false), 400);
      inputRef.current?.focus();
    }
  }

  const inputBorder = errorMsg
    ? "1px solid #dc2626"
    : focused
    ? "1px solid rgba(184,151,58,0.5)"
    : "1px solid #27272a";

  return (
    <div
      className={`min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden transition-[opacity,transform] duration-700 ${
        fading ? "opacity-0 scale-[0.97]" : "opacity-100 scale-100"
      }`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(184,151,58,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(184,151,58,0.035) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className={`relative w-full max-w-[300px] sm:max-w-sm${shaking ? " shake" : ""}`}>
        <div className="flex justify-center mb-8">
          <div
            className="lock-icon-container w-12 h-12 flex items-center justify-center relative"
            style={{ border: "1.5px solid #b8973a" }}
          >
            {transitioning ? (
              <LockOpen size={20} className="text-[#b8973a] lock-open-animate" strokeWidth={1.5} />
            ) : (
              <Lock size={20} className="text-[#b8973a]" strokeWidth={1.5} />
            )}
            <div className="lock-glow" />
          </div>
        </div>

        <p
          className="text-center text-[11px] tracking-[0.3em] uppercase mb-2"
          style={{ fontFamily: "var(--font-mono)", color: "#b8973a" }}
        >
          Jack&apos;s Watch Guide
        </p>

        <h1
          className="text-center text-[28px] font-light leading-tight mb-1"
          style={{ fontFamily: "var(--font-display)", color: "#f0ede6" }}
        >
          {getGreeting()}
        </h1>

        <p
          className="text-center text-[11px] text-zinc-400 mb-7 tracking-[0.03em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Enter the password to unlock your collection.
        </p>

        <div
          className="py-4 mb-8 text-center"
          style={{
            borderTop: "1px solid rgba(184,151,58,0.12)",
            borderBottom: "1px solid rgba(184,151,58,0.12)",
          }}
        >
          <p
            className="text-[11px] text-zinc-400 italic leading-relaxed"
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
                setErrorMsg(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="password"
              autoComplete="off"
              className="w-full px-4 py-3 placeholder:text-zinc-600 placeholder:tracking-[0.15em] focus:outline-none transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                background: "#18181b",
                border: inputBorder,
                fontSize: "16px",
                letterSpacing: "0.12em",
                color: "#e4e4e7",
              }}
            />
            {errorMsg && (
              <p
                className="text-[11px] text-red-500 mt-1.5 tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {errorMsg}
              </p>
            )}
            {failedAttempts >= 2 && (
              <p
                className="text-[11px] mt-1 text-right text-zinc-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {failedAttempts} failed attempt{failedAttempts !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={transitioning}
            className="w-full py-3 text-[10.5px] tracking-[0.2em] uppercase transition-colors disabled:opacity-50"
            style={{
              fontFamily: "var(--font-sans)",
              background: "transparent",
              border: "1px solid #b8973a",
              color: "#b8973a",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              if (!transitioning) e.currentTarget.style.background = "rgba(184,151,58,0.07)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {transitioning ? "Unlocking…" : "Unlock the Vault →"}
          </button>
        </form>
      </div>
    </div>
  );
}
