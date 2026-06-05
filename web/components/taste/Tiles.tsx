"use client";

import { GenreBubbles } from "@/components/taste/GenreBubbles";
import { PaperCard } from "@/components/ui/PaperCard";
import type { TasteProfile } from "@/lib/api";
import { countryName, flag } from "@/lib/countries";
import { HEX, pastelFor } from "@/lib/pastels";
import { motion } from "framer-motion";

const MINT = "#C2E6CD";
const CLAY = "#D8C8BE";

export function CardTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

interface TileProps {
  taste: TasteProfile;
  tilt?: number;
  delay?: number;
}

// ---------- Genre bubble cloud ----------
export function GenreTile({ taste, tilt, delay }: TileProps) {
  return (
    <PaperCard tilt={tilt} delay={delay}>
      <CardTitle title="Genre galaxy" hint="Bigger = you love it more. Tap a bubble for the why." />
      <GenreBubbles genres={taste.genreAffinity} />
    </PaperCard>
  );
}

// ---------- Directors as a film strip ----------
export function DirectorsTile({ taste, tilt, delay }: TileProps) {
  const directors = Object.values(taste.directorAffinity)
    .filter((d) => d.affinity > 0)
    .sort((a, b) => b.affinity - a.affinity)
    .slice(0, 6);

  return (
    <motion.div
      initial={{ y: 18, opacity: 0, rotate: tilt ?? 0 }}
      whileInView={{ y: 0, opacity: 1, rotate: tilt ?? 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay }}
      className="overflow-hidden rounded-squircle bg-lilac p-2 shadow-lift"
    >
      <div className="flex">
        <Sprockets />
        <div className="flex-1 px-1.5">
          <h2 className="px-1 pb-1 pt-2 font-display text-xl font-bold text-lilac-deep">
            Directors you adore
          </h2>
          <ul className="space-y-1.5 pb-2">
            {directors.length ? (
              directors.map((d, i) => (
                <motion.li
                  key={d.name}
                  initial={{ x: -12, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (delay ?? 0) + i * 0.06 }}
                  className="flex items-center gap-2 rounded-lg bg-paper px-2 py-1.5"
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-ink"
                    style={{ background: HEX[pastelFor(d.name)].fill }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold text-ink">{d.name}</span>
                  <span className="text-[11px] font-bold text-ink-faint">{d.count}</span>
                </motion.li>
              ))
            ) : (
              <li className="px-2 text-sm text-ink-soft">Not enough repeat directors yet.</li>
            )}
          </ul>
        </div>
        <Sprockets />
      </div>
    </motion.div>
  );
}

const SPROCKETS = ["a", "b", "c", "d", "e", "f", "g"];
function Sprockets() {
  return (
    <div className="flex w-5 flex-col items-center justify-around py-2">
      {SPROCKETS.map((k) => (
        <span key={k} className="h-2.5 w-2.5 rounded-sm bg-paper/70" />
      ))}
    </div>
  );
}

// ---------- Decades as a wavy timeline ----------
export function DecadeTile({ taste, tilt, delay }: TileProps) {
  const decades = Object.entries(taste.eraAffinity)
    .map(([d, v]) => ({ decade: Number(d), ...v }))
    .sort((a, b) => a.decade - b.decade);
  const n = decades.length;
  const maxCount = Math.max(1, ...decades.map((d) => d.count));

  // wavy path across the tile (viewBox stretched on x; circles are HTML)
  const wave = Array.from({ length: 40 }, (_, i) => {
    const x = 2 + (i / 39) * 96;
    const y = 50 + Math.sin((i / 39) * Math.PI * 2) * 30;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <PaperCard tilt={tilt} delay={delay}>
      <CardTitle
        title="Your cinema century"
        hint="A wander through the decades — size = how many, glow = how much you love them."
      />
      <div className="relative h-36 w-full">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <motion.path
            d={wave}
            fill="none"
            stroke="#EADDC4"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        </svg>
        {decades.map((d, i) => {
          const p = n > 1 ? i / (n - 1) : 0.5;
          const x = 2 + p * 96;
          const y = 50 + Math.sin(p * Math.PI * 2) * 30;
          const size = 26 + (d.count / maxCount) * 34;
          return (
            <motion.div
              key={d.decade}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 240, damping: 15, delay: 0.3 + i * 0.06 }}
              whileHover={{ scale: 1.15 }}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[10px] font-bold text-ink/70 shadow-sticker"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                background: d.affinity >= 0 ? MINT : CLAY,
                opacity: 0.6 + Math.min(Math.abs(d.affinity), 0.4),
              }}
              title={`${d.count} films · ${d.avg_rating}/10`}
            >
              {`'${String(d.decade).slice(2)}`}
            </motion.div>
          );
        })}
      </div>
    </PaperCard>
  );
}

// ---------- Countries as postage stamps ----------
export function PassportTile({ taste, tilt, delay }: TileProps) {
  const countries = Object.entries(taste.countryAffinity)
    .map(([cc, v]) => ({ cc, ...v }))
    .filter((c) => c.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <PaperCard tilt={tilt} delay={delay}>
      <CardTitle
        title="Your film passport"
        hint="Stamps from everywhere your cinema's been — ♥ = you rate it highest."
      />
      <div className="flex flex-wrap gap-2.5">
        {countries.map((c, i) => (
          <motion.div
            key={c.cc}
            initial={{ scale: 0, rotate: -8 }}
            whileInView={{ scale: 1, rotate: (i % 3) - 1 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 14,
              delay: (delay ?? 0) + i * 0.05,
            }}
            whileHover={{ rotate: 0, scale: 1.06, y: -3 }}
            className="relative flex w-20 flex-col items-center gap-0.5 border-2 border-dashed border-paper-edge bg-paper px-2 py-2"
            style={{
              borderRadius: 4,
              boxShadow: "inset 0 0 0 3px #FBF6EC, 0 4px 10px -4px rgba(59,50,44,0.25)",
            }}
          >
            <span className="text-2xl leading-none">{flag(c.cc)}</span>
            <span className="text-[11px] font-bold text-ink">{countryName(c.cc)}</span>
            <span className="text-[10px] text-ink-faint">
              {c.count}
              {c.affinity > 0.2 ? " ♥" : ""}
            </span>
          </motion.div>
        ))}
      </div>
    </PaperCard>
  );
}

// ---------- Personality as gauge rings ----------
export function PersonalityTile({ taste, tilt, delay }: TileProps) {
  const rt = taste.runtimePref?.pref_min ?? null;
  const runtimeLabel =
    rt == null
      ? ""
      : rt < 95
        ? "tight & punchy"
        : rt < 125
          ? "feature-length"
          : rt < 150
            ? "room to breathe"
            : "epic-leaning";
  const ratingLabel =
    taste.mu >= 7.2 ? "generous" : taste.mu <= 5.8 ? "tough crowd" : "even-handed";

  return (
    <PaperCard tilt={tilt} delay={delay}>
      <CardTitle title="Your viewing personality" />
      <div className="flex items-center justify-around gap-2">
        <Ring value={rt ?? 0} max={200} unit="min" label={runtimeLabel} pastel="peach" />
        <Ring
          value={taste.mu}
          max={10}
          unit="/10"
          label={ratingLabel}
          pastel="butter"
          decimals={1}
        />
        <Ring
          value={taste.sigma}
          max={4}
          unit="σ"
          label={taste.sigma >= 2.2 ? "eclectic" : taste.sigma <= 1.3 ? "consistent" : "decisive"}
          pastel="mint"
          decimals={1}
        />
      </div>
    </PaperCard>
  );
}

function Ring({
  value,
  max,
  unit,
  label,
  pastel,
  decimals = 0,
}: {
  value: number;
  max: number;
  unit: string;
  label: string;
  pastel: "peach" | "butter" | "mint";
  decimals?: number;
}) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const f = Math.max(0, Math.min(1, value / max));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg aria-hidden="true" viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F3E9D6" strokeWidth="11" />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={HEX[pastel].fill}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: c * (1 - f) }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-lg font-black text-ink">
            {value.toFixed(decimals)}
            <span className="text-[10px] font-normal text-ink-soft">{unit}</span>
          </span>
        </div>
      </div>
      <span className="text-[11px] font-semibold text-ink-soft">{label}</span>
    </div>
  );
}

// ---------- Themes as a floating tag cloud ----------
export function ThemesTile({ taste, tilt, delay }: TileProps) {
  const kws = taste.topKeywords.slice(0, 16);
  const maxW = Math.max(...kws.map((k) => k.weight), 0.01);
  return (
    <PaperCard tilt={tilt} delay={delay}>
      <CardTitle
        title="Your themes"
        hint="The threads running through your favourites — bigger = stronger."
      />
      <div className="flex flex-wrap items-center justify-center gap-2 py-1">
        {kws.map((k, i) => {
          const t = k.weight / maxW;
          const p = pastelFor(k.name);
          let h = 0;
          for (const ch of k.name) h += ch.charCodeAt(0);
          return (
            <motion.span
              key={k.id}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1, rotate: (h % 7) - 3 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 16,
                delay: (delay ?? 0) + i * 0.03,
              }}
              whileHover={{ rotate: 0, scale: 1.1 }}
              className="inline-block cursor-default rounded-full px-3 py-1 font-semibold shadow-sticker"
              style={{
                background: HEX[p].fill,
                color: HEX[p].deep,
                fontSize: 12 + t * 10,
              }}
            >
              {k.name}
            </motion.span>
          );
        })}
      </div>
    </PaperCard>
  );
}

// ---------- Blind spot as a pinned sticky note ----------
export function DiggingTile({ taste, tilt, delay }: TileProps) {
  const era = Object.entries(taste.eraAffinity)
    .map(([d, v]) => ({ decade: Number(d), ...v }))
    .filter((e) => e.affinity > 0.1 && e.count > 0 && e.count <= 20)
    .sort((a, b) => b.avg_rating - a.avg_rating)[0];
  const country = Object.entries(taste.countryAffinity)
    .map(([cc, v]) => ({ cc, ...v }))
    .filter((c) => c.affinity > 0.25 && c.count >= 2 && c.count <= 25)
    .sort((a, b) => b.affinity - a.affinity)[0];

  return (
    <motion.div
      initial={{ y: 18, opacity: 0, rotate: (tilt ?? 0) - 2 }}
      whileInView={{ y: 0, opacity: 1, rotate: (tilt ?? 0) - 2 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 120, damping: 15, delay }}
      whileHover={{ rotate: 0, y: -4 }}
      className="relative bg-butter p-5 shadow-lift"
      style={{ borderRadius: "2px 14px 2px 14px" }}
    >
      {/* tape */}
      <span className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 -rotate-2 bg-paper/60" />
      <h2 className="mb-2 font-display text-xl font-bold italic text-ink">Worth digging into</h2>
      <ul className="space-y-2 text-sm text-ink">
        {era && (
          <li>
            ✦ <strong>{era.decade}s cinema</strong> — you rate it {era.avg_rating}/10 but have only
            seen {era.count}.
          </li>
        )}
        {country && (
          <li>
            ✦ <strong>{countryName(country.cc)} film</strong> {flag(country.cc)} — a clear favourite
            ({country.count} so far).
          </li>
        )}
        {!era && !country && (
          <li className="text-ink-soft">You&apos;re remarkably well-rounded already.</li>
        )}
      </ul>
      {/* folded corner */}
      <span
        className="absolute bottom-0 right-0 h-0 w-0"
        style={{
          borderStyle: "solid",
          borderWidth: "0 0 16px 16px",
          borderColor: "transparent transparent rgba(59,50,44,0.12) transparent",
        }}
      />
    </motion.div>
  );
}
