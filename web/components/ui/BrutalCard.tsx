"use client";

import { BG, type Pastel } from "@/lib/pastels";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const PAT: Record<string, string> = {
  dots: "pat-dots",
  stripes: "pat-stripes",
  checks: "pat-checks",
  grid: "pat-grid",
  none: "",
};

// A bold, ink-outlined block with a hard offset shadow over a pastel + pattern.
// The maximalist building block — colour-blocked, decorated, anti-sleek.
export function BrutalCard({
  children,
  bg = "blush",
  pattern = "none",
  tilt = 0,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  bg?: Pastel;
  pattern?: "dots" | "stripes" | "checks" | "grid" | "none";
  tilt?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ y: 22, opacity: 0, rotate: tilt }}
      whileInView={{ y: 0, opacity: 1, rotate: tilt }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 130, damping: 14, delay }}
      whileHover={{ rotate: 0, y: -3, boxShadow: "9px 9px 0 0 #3B322C" }}
      className={`brutal relative rounded-[1.4rem] ${BG[bg]} p-5 ${className}`}
    >
      <div className={`pointer-events-none absolute inset-0 rounded-[1.2rem] ${PAT[pattern]}`} />
      <div className="relative">{children}</div>
    </motion.section>
  );
}

// A loud section heading: chunky, with a hand-drawn underline highlight.
export function BrutalTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="inline font-display text-2xl font-black uppercase tracking-tight text-ink [text-shadow:1.5px_1.5px_0_rgba(255,255,255,0.6)]">
        {children}
      </h2>
      {hint && <p className="mt-1 text-xs font-semibold text-ink/70">{hint}</p>}
    </div>
  );
}
