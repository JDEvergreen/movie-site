// Deterministic pastel assignment. Class strings are written out in full so
// Tailwind's content scanner keeps them (no dynamic class purging surprises).

export const PASTELS = ["blush", "peach", "butter", "mint", "sky", "lilac", "coral"] as const;
export type Pastel = (typeof PASTELS)[number];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pastelFor(key: string | number): Pastel {
  const i = typeof key === "number" ? Math.abs(Math.trunc(key)) : hash(key);
  return PASTELS[i % PASTELS.length];
}

export const BG: Record<Pastel, string> = {
  blush: "bg-blush",
  peach: "bg-peach",
  butter: "bg-butter",
  mint: "bg-mint",
  sky: "bg-sky",
  lilac: "bg-lilac",
  coral: "bg-coral",
};

export const TEXT_DEEP: Record<Pastel, string> = {
  blush: "text-blush-deep",
  peach: "text-peach-deep",
  butter: "text-butter-deep",
  mint: "text-mint-deep",
  sky: "text-sky-deep",
  lilac: "text-lilac-deep",
  coral: "text-coral-deep",
};

export const RING_DEEP: Record<Pastel, string> = {
  blush: "ring-blush-deep",
  peach: "ring-peach-deep",
  butter: "ring-butter-deep",
  mint: "ring-mint-deep",
  sky: "ring-sky-deep",
  lilac: "ring-lilac-deep",
  coral: "ring-coral-deep",
};

// Warm summer palette: cream base with teal / coral / yellow accents. The seven
// family names map onto shades of those three hues. (fill = soft surface tint,
// deep = readable text/edge colour.) Keep in sync with tailwind.config.ts.
export const HEX: Record<Pastel, { fill: string; deep: string }> = {
  // coral ramp (palest -> strongest)
  blush: { fill: "#F8C2AD", deep: "#C25C3E" },
  peach: { fill: "#F8B093", deep: "#CE5E34" },
  coral: { fill: "#F5906B", deep: "#C8502C" },
  // yellow / gold
  butter: { fill: "#FCE08C", deep: "#B08612" },
  lilac: { fill: "#F6CF77", deep: "#9E7611" },
  // teal
  mint: { fill: "#8FDCDC", deep: "#1F8A8A" },
  sky: { fill: "#5FC9CA", deep: "#156A6A" },
};
