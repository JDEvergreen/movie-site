"use client";

import type { GenreAffinity } from "@/lib/api";
import { HEX, pastelFor } from "@/lib/pastels";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const MUTED = "#D8C8BE";
const GOLDEN = 2.399963229728653;

// Genres as a packed bubble cloud: loved genres are big, warm, and near the
// centre; disliked ones shrink to faded clay at the edges. Tap a bubble to
// unfurl the four signals behind it.
export function GenreBubbles({ genres }: { genres: Record<string, GenreAffinity> }) {
  const rows = Object.values(genres).sort((a, b) => b.affinity - a.affinity);
  const n = rows.length;
  const [sel, setSel] = useState<string | null>(null);
  const selected = rows.find((r) => r.name === sel) ?? null;

  return (
    <div>
      <div className="relative mx-auto h-[360px] w-full max-w-[460px]">
        {rows.map((g, i) => {
          // phyllotaxis: radius grows with sqrt(index), angle by golden ratio
          const r = Math.sqrt(i / n);
          const theta = i * GOLDEN;
          const nx = r * Math.cos(theta);
          const ny = r * Math.sin(theta);
          // size by affinity (love big, dislike small)
          const t = Math.max(0, Math.min(1, (g.affinity + 0.3) / 0.9));
          const size = 34 + t * 78;
          const positive = g.affinity >= 0;
          const fill = positive ? HEX[pastelFor(g.name)].fill : MUTED;
          const isSel = g.name === sel;
          return (
            <motion.button
              type="button"
              key={g.name}
              onClick={() => setSel(isSel ? null : g.name)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: i * 0.035 }}
              whileHover={{ scale: 1.12, zIndex: 20 }}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center leading-tight shadow-sticker"
              style={{
                left: `${50 + nx * 44}%`,
                top: `${50 + ny * 46}%`,
                width: size,
                height: size,
                background: fill,
                outline: isSel ? "3px solid #3B322C" : "none",
                outlineOffset: 2,
                zIndex: isSel ? 30 : Math.round(size),
              }}
            >
              <span
                className="px-1 font-semibold text-ink"
                style={{ fontSize: size > 64 ? 12 : size > 46 ? 10 : 0 }}
              >
                {g.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-2 rounded-2xl bg-paper p-4 shadow-lift"
          >
            <p className="mb-2 font-display text-lg font-bold text-ink">
              {selected.name}{" "}
              <span className="text-sm font-normal text-ink-soft">
                · {selected.count} films · {selected.avg_rating.toFixed(1)}/10
              </span>
            </p>
            <Signal label="Rating vs. your average" v={selected.components.rating} />
            <Signal label="vs. the crowd" v={selected.components.vs_audience} />
            <Signal label="How often you watch it" v={selected.components.engagement} />
            <Signal label="How often you ♥ it" v={selected.components.likes} />
          </motion.div>
        )}
      </AnimatePresence>
      {!selected && (
        <p className="mt-2 text-center text-xs text-ink-faint">tap a bubble to see the why</p>
      )}
    </div>
  );
}

function Signal({ label, v }: { label: string; v: number }) {
  const pct = Math.min(Math.abs(v), 1) * 50;
  return (
    <div className="flex items-center gap-2 py-0.5 text-[11px]">
      <span className="w-32 shrink-0 text-ink-soft">{label}</span>
      <div className="relative h-2 flex-1 rounded-full bg-paper-deep">
        <div className="absolute left-1/2 top-0 h-2 w-px bg-paper-edge" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className="absolute top-0 h-2 rounded-full"
          style={
            v >= 0
              ? { left: "50%", background: "#5FA87C" }
              : { right: "50%", background: "#DC6A4B" }
          }
        />
      </div>
    </div>
  );
}
