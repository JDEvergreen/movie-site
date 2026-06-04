import type { GenreAffinity } from "@/lib/api";

// Diverging horizontal bars: teal to the right for positive affinity, coral to
// the left for negative. The honesty of the profile (PLAN "what makes this
// different") is the point — it shows what you dislike too.
export function AffinityBars({ genres }: { genres: Record<string, GenreAffinity> }) {
  const rows = Object.values(genres).sort((a, b) => b.affinity - a.affinity);
  const scale = 0.6; // affinities rarely exceed ±0.6; clamp the bar to full width there

  return (
    <div className="space-y-1.5">
      {rows.map((g) => {
        const pct = Math.min(Math.abs(g.affinity) / scale, 1) * 50;
        const positive = g.affinity >= 0;
        return (
          <div key={g.name} className="flex items-center gap-2 text-sm">
            <span className="w-28 shrink-0 text-right text-ink-soft">{g.name}</span>
            <div className="relative h-5 flex-1 rounded bg-cream-200/60">
              <div className="absolute left-1/2 top-0 h-full w-px bg-cream-200" />
              <div
                className={`absolute top-0 h-full ${positive ? "bg-teal" : "bg-coral"}`}
                style={
                  positive ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }
                }
              />
            </div>
            <span
              className={`w-12 shrink-0 text-xs tabular-nums ${positive ? "text-teal-600" : "text-coral-600"}`}
            >
              {g.affinity >= 0 ? "+" : ""}
              {g.affinity.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
