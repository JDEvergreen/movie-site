"use client";

import { RecRow } from "@/components/recs/RecRow";
import { type MatchResult, getImportStatus, getMatch, importByUsername } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const GOLD = "#c9a84c";
const GOLD_DIM = "rgba(196,154,60,0.55)";
const EDGE = "rgba(196,154,60,0.22)";
const DARK = "#1c1108";

const IMPORT_STAGES: Record<string, string> = {
  queued:            "INITIALISING",
  fetching:          "READING LETTERBOXD",
  matching:          "CROSS-REFERENCING FILMS",
  enriching:         "ENRICHING CATALOGUE",
  profiling:         "ANALYSING TASTE",
  precomputing_recs: "COMPUTING OUTPUT",
};

// ── Gear ───────────────────────────────────────────────────────────────────
function gearPath(teeth: number, outer: number, inner: number): string {
  const step = (Math.PI * 2) / teeth;
  const w = step * 0.32;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = step * i;
    pts.push(
      `${inner * Math.cos(a - w)},${inner * Math.sin(a - w)}`,
      `${outer * Math.cos(a - w * 0.35)},${outer * Math.sin(a - w * 0.35)}`,
      `${outer * Math.cos(a + w * 0.35)},${outer * Math.sin(a + w * 0.35)}`,
      `${inner * Math.cos(a + w)},${inner * Math.sin(a + w)}`,
    );
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p}`).join(" ") + " Z";
}

function Gear({ size, teeth = 12, duration = 9, reverse = false, lit = false, opacity = 1 }: {
  size: number; teeth?: number; duration?: number; reverse?: boolean; lit?: boolean; opacity?: number;
}) {
  const r = size / 2;
  const outer = r - 2;
  const inner = outer * 0.76;
  const hole = inner * 0.3;
  const path = useMemo(() => gearPath(teeth, outer, inner), [teeth, outer, inner]);
  return (
    <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`}
      style={{
        opacity, flexShrink: 0,
        animation: `gear-spin${reverse ? "-r" : ""} ${duration}s linear infinite`,
        filter: lit ? `drop-shadow(0 0 ${Math.round(size * 0.08)}px ${GOLD})` : "none",
        transition: "filter 0.4s",
      }}
    >
      <path d={path} fill={lit ? "rgba(201,168,76,0.85)" : "rgba(196,154,60,0.28)"} />
      <circle r={hole} fill={DARK} />
      <circle r={hole * 0.38} fill={lit ? GOLD : "rgba(196,154,60,0.18)"} />
    </svg>
  );
}

// ── Status light ───────────────────────────────────────────────────────────
function Light({ on, blink }: { on: boolean; blink?: boolean }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: on ? GOLD : "rgba(196,154,60,0.15)",
      boxShadow: on ? `0 0 8px 2px rgba(201,168,76,0.6)` : "none",
      animation: blink && on ? "light-blink 0.6s ease-in-out infinite alternate" : "none",
      transition: "background 0.3s, box-shadow 0.3s",
    }} />
  );
}

// ── Corner bracket ─────────────────────────────────────────────────────────
function Corner({ r = false, b = false }: { r?: boolean; b?: boolean }) {
  return (
    <svg width={18} height={18}
      style={{ transform: `rotate(${r && b ? 180 : r ? 90 : b ? 270 : 0}deg)`, flexShrink: 0 }}
      viewBox="0 0 18 18">
      <path d="M1 17 L1 1 L17 1" fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.5} />
    </svg>
  );
}

// ── Analog gauge ───────────────────────────────────────────────────────────
// Arc: 150° → 390° (= 30°) clockwise, 240° sweep, through 270° (top of circle)
// Endpoints at y = CY + R·sin(150°) = CY + R·0.5  — both well inside SVG bounds
function AnalogGauge({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    setDisplayed(0);
    const dur = 1400;
    const t0 = performance.now();
    function tick(now: number) {
      const t = Math.min((now - t0) / dur, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setDisplayed(Math.round(eased * score));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [score]);

  const W = 270, H = 175;
  const CX = W / 2, CY = 112, R = 90;
  const START = 150;   // degrees
  const SWEEP = 240;   // degrees, clockwise

  function pt(deg: number, radius = R) {
    const a = (deg * Math.PI) / 180;
    return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
  }

  function arcD(radius: number, startDeg: number, sweepDeg: number) {
    const p1 = pt(startDeg, radius);
    const p2 = pt(startDeg + sweepDeg, radius);
    const large = sweepDeg > 180 ? 1 : 0;
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  const activeSweep = (displayed / 100) * SWEEP;
  const needle = pt(START + activeSweep, R * 0.73);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Track */}
      <path d={arcD(R, START, SWEEP)} fill="none" stroke="rgba(196,154,60,0.1)" strokeWidth={13} />
      {/* Glow */}
      {displayed > 0 && (
        <path d={arcD(R, START, activeSweep)} fill="none" stroke={GOLD}
          strokeWidth={22} strokeLinecap="round" opacity={0.13} />
      )}
      {/* Active arc */}
      {displayed > 0 && (
        <path d={arcD(R, START, activeSweep)} fill="none" stroke={GOLD}
          strokeWidth={13} strokeLinecap="round" />
      )}
      {/* Tick marks */}
      {ticks.map((pct) => {
        const a = pt(START + (pct / 100) * SWEEP, R - 10);
        const b = pt(START + (pct / 100) * SWEEP, R - 22);
        return (
          <line key={pct} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={pct <= displayed ? GOLD : "rgba(196,154,60,0.22)"} strokeWidth={1.5} />
        );
      })}
      {/* Needle */}
      <line x1={CX} y1={CY} x2={needle.x} y2={needle.y}
        stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={CX} cy={CY} r={7} fill={GOLD} />
      <circle cx={CX} cy={CY} r={3} fill={DARK} />
      {/* Label */}
      <text x={CX} y={CY + 28} textAnchor="middle"
        fill="rgba(240,210,150,0.95)" fontSize={36} fontWeight={300}
        fontFamily="var(--font-display)" letterSpacing="-1">
        {displayed}%
      </text>
      <text x={CX} y={CY + 50} textAnchor="middle"
        fill={GOLD_DIM} fontSize={9.5} letterSpacing="3">
        COMPATIBLE
      </text>
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MatchPage() {
  const { profile } = useParams<{ profile: string }>();
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [items, setItems] = useState<MatchResult["items"]>([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lit = loading;

  useEffect(() => {
    if (result) setItems(result.items);
  }, [result]);

  async function importThenMatch(uname: string): Promise<MatchResult> {
    setStage("IMPORTING PROFILE");
    const { importId } = await importByUsername(uname);
    for (let i = 0; i < 180; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const st = await getImportStatus(importId);
      if (st.status === "ready") {
        setStage("COMPUTING OUTPUT");
        return await getMatch(profile, uname);
      }
      if (st.status === "failed") throw new Error("Import failed — check the username.");
      setStage(IMPORT_STAGES[st.status] ?? "PROCESSING");
    }
    throw new Error("Import timed out.");
  }

  async function find(e?: React.FormEvent) {
    e?.preventDefault();
    const q = username.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStage("INITIALISING");
    try {
      let data: MatchResult;
      try {
        setStage("COMPUTING OUTPUT");
        data = await getMatch(profile, q);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("not found") || msg.includes("profile_not_found")) {
          data = await importThenMatch(q);
        } else throw err;
      }
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg.includes("taste_not_ready")
        ? "One or both profiles need more films imported first."
        : msg);
    } finally {
      setLoading(false);
      setStage(null);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setItems([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <>
      <style>{`
        @keyframes gear-spin   { to { transform: rotate(360deg);  } }
        @keyframes gear-spin-r { to { transform: rotate(-360deg); } }
        @keyframes light-blink { from { opacity: 1; } to { opacity: 0.2; } }
        @keyframes scanline {
          0%   { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes result-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stage-blink {
          0%, 100% { opacity: 1; } 48%, 52% { opacity: 0; }
        }
      `}</style>

      <main style={{ background: DARK }} className="min-h-screen pb-32">
        <div className="mx-auto px-8 pt-10 pb-8" style={{ maxWidth: 1200 }}>

          {/* ── Machine panel ── */}
          <div style={{
            border: `1.5px solid rgba(196,154,60,0.35)`,
            borderRadius: 4,
            background: "#191007",
            boxShadow: "0 0 80px rgba(0,0,0,0.7), inset 0 0 100px rgba(0,0,0,0.4), 0 0 0 6px #131007, 0 0 0 7.5px rgba(196,154,60,0.1)",
            position: "relative",
            overflow: "hidden",
          }}>

            {/* Scanline texture */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
              backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 4px)",
              animation: "scanline 3s linear infinite",
            }} />

            {/* ── Header plate ── */}
            <div style={{
              position: "relative", zIndex: 1,
              borderBottom: `1px solid rgba(196,154,60,0.18)`,
              padding: "12px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(0,0,0,0.25)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Light on={true} /><Light on={lit} blink={lit} /><Light on={lit} blink={lit} />
              </div>
              <p style={{
                fontFamily: "var(--font-display)", letterSpacing: "0.25em",
                fontSize: 11, color: "rgba(196,154,60,0.6)", textTransform: "uppercase",
              }}>
                Compatibility Analyser — Mk. I
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Light on={lit} blink={lit} /><Light on={lit} blink={lit} /><Light on={true} />
              </div>
            </div>

            {/* ── Input bay ── */}
            <div style={{
              position: "relative", zIndex: 1,
              padding: "28px 32px 24px",
              borderBottom: `1px solid rgba(196,154,60,0.12)`,
            }}>
              <div style={{ position: "absolute", top: 10, left: 12 }}><Corner /></div>
              <div style={{ position: "absolute", top: 10, right: 12 }}><Corner r /></div>

              <p style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(196,154,60,0.3)", textAlign: "center", marginBottom: 16, textTransform: "uppercase" }}>
                Input Terminals
              </p>

              <form onSubmit={find} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Your profile — locked */}
                <div style={{
                  flex: 1, padding: "11px 18px", borderRadius: 3,
                  background: "rgba(196,154,60,0.06)", border: `1px solid ${EDGE}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(196,154,60,0.35)", textTransform: "uppercase", flexShrink: 0 }}>You</span>
                  <span style={{ fontSize: 15, color: "rgba(240,210,150,0.9)", fontFamily: "var(--font-display)" }}>{profile}</span>
                </div>

                {/* Connector */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                      width: i === 1 ? 24 : 6, height: i === 1 ? 1.5 : 6,
                      borderRadius: i === 1 ? 0 : "50%",
                      background: lit
                        ? i === 1 ? `linear-gradient(to right,${GOLD},${GOLD})` : GOLD
                        : i === 1 ? `linear-gradient(to right, rgba(196,154,60,0.2), rgba(196,154,60,0.5), rgba(196,154,60,0.2))` : "rgba(196,154,60,0.25)",
                      boxShadow: lit && i !== 1 ? `0 0 6px ${GOLD}` : "none",
                      transition: "all 0.4s",
                    }} />
                  ))}
                </div>

                {/* Their username */}
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    fontSize: 9, letterSpacing: "0.18em", color: "rgba(196,154,60,0.35)", textTransform: "uppercase",
                    pointerEvents: "none",
                  }}>
                    Match
                  </span>
                  <input
                    ref={inputRef}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    autoComplete="off" spellCheck={false}
                    disabled={loading}
                    style={{
                      width: "100%", padding: "11px 18px 11px 56px",
                      borderRadius: 3, border: `1px solid ${lit ? "rgba(196,154,60,0.45)" : EDGE}`,
                      background: "rgba(196,154,60,0.06)", outline: "none",
                      color: "rgba(240,210,150,0.95)", fontSize: 15,
                      fontFamily: "var(--font-display)",
                      boxShadow: lit ? `0 0 16px rgba(196,154,60,0.08)` : "none",
                      transition: "border-color 0.3s, box-shadow 0.3s",
                    }}
                  />
                </div>
              </form>
            </div>

            {/* ── Processing bay ── */}
            <div style={{
              position: "relative", zIndex: 1,
              padding: "28px 32px",
              borderBottom: result ? `1px solid rgba(196,154,60,0.12)` : "none",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
            }}>
              {/* Left gears */}
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <Gear size={72} teeth={14} duration={lit ? 1.1 : 11} lit={lit} opacity={lit ? 1 : 0.65} />
                <div style={{ marginLeft: -10 }}>
                  <Gear size={44} teeth={9} duration={lit ? 0.7 : 7} reverse lit={lit} opacity={lit ? 0.9 : 0.45} />
                </div>
              </div>

              {/* Centre */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ height: 18, display: "flex", alignItems: "center" }}>
                  {loading && stage && (
                    <p style={{
                      fontSize: 10, letterSpacing: "0.2em", color: GOLD_DIM,
                      textTransform: "uppercase",
                      animation: "stage-blink 2s ease-in-out infinite",
                    }}>
                      {stage}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => find()}
                  disabled={loading || !username.trim()}
                  style={{
                    padding: "14px 56px",
                    background: loading ? "rgba(196,154,60,0.08)" : !username.trim() ? "rgba(196,154,60,0.06)" : "#c9a84c",
                    color: loading || !username.trim() ? GOLD_DIM : DARK,
                    border: loading || !username.trim() ? `1px solid ${EDGE}` : "none",
                    borderRadius: 3, cursor: loading || !username.trim() ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    boxShadow: !loading && username.trim()
                      ? `0 0 24px rgba(201,168,76,0.25), 0 4px 0 rgba(0,0,0,0.5)`
                      : "0 2px 0 rgba(0,0,0,0.3)",
                    transition: "background 0.3s, box-shadow 0.3s, color 0.3s",
                  }}
                >
                  {loading ? "Analysing…" : result ? "Re-Analyse" : "Analyse"}
                </button>

                {error && (
                  <p style={{ fontSize: 12, color: "rgba(196,154,60,0.5)", textAlign: "center", maxWidth: 380 }}>
                    {error}
                  </p>
                )}
              </div>

              {/* Right gears */}
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ marginRight: -10 }}>
                  <Gear size={44} teeth={9} duration={lit ? 0.7 : 7} lit={lit} opacity={lit ? 0.9 : 0.45} />
                </div>
                <Gear size={72} teeth={14} duration={lit ? 1.1 : 11} reverse lit={lit} opacity={lit ? 1 : 0.65} />
              </div>
            </div>

            {/* ── Output bay ── */}
            {result && (
              <div style={{
                position: "relative", zIndex: 1,
                padding: "32px 40px 36px",
                animation: "result-in 0.5s ease both",
              }}>
                <div style={{ position: "absolute", bottom: 12, left: 12 }}><Corner b /></div>
                <div style={{ position: "absolute", bottom: 12, right: 12 }}><Corner r b /></div>

                <p style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(196,154,60,0.3)", textAlign: "center", marginBottom: 28, textTransform: "uppercase" }}>
                  Analysis Output — {result.profileA} × {result.profileB}
                </p>

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 48 }}>
                  {/* Gauge */}
                  <div style={{ flexShrink: 0 }}>
                    <AnalogGauge score={result.compatibility.score} />
                  </div>

                  {/* Info panel */}
                  <div style={{ paddingTop: 8, maxWidth: 380, flex: 1 }}>
                    <p style={{
                      fontFamily: "var(--font-display)", fontSize: "1.8rem",
                      color: "rgba(240,210,150,0.95)", lineHeight: 1.2, marginBottom: 10,
                    }}>
                      {result.compatibility.score >= 75 ? "Great match"
                        : result.compatibility.score >= 55 ? "Good match"
                        : "Some common ground"}
                    </p>
                    <p style={{ fontSize: 13, color: GOLD_DIM, lineHeight: 1.65, marginBottom: 20 }}>
                      {result.compatibility.blurb}
                    </p>

                    {result.compatibility.sharedGenres.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(196,154,60,0.3)", textTransform: "uppercase", marginBottom: 8 }}>
                          Both love
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {result.compatibility.sharedGenres.map((g) => (
                            <span key={g} style={{
                              padding: "3px 13px", borderRadius: 20, fontSize: 12,
                              background: "rgba(196,154,60,0.1)", border: `1px solid rgba(196,154,60,0.28)`,
                              color: "rgba(240,210,150,0.9)",
                            }}>{g}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.compatibility.divergentGenres.length > 0 && (
                      <div>
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(196,154,60,0.3)", textTransform: "uppercase", marginBottom: 8 }}>
                          You diverge on
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {result.compatibility.divergentGenres.map((g) => (
                            <span key={g} style={{
                              padding: "3px 13px", borderRadius: 20, fontSize: 12,
                              background: "rgba(196,154,60,0.04)", border: `1px solid ${EDGE}`,
                              color: GOLD_DIM,
                            }}>{g}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                  <button type="button" onClick={reset} style={{
                    fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "rgba(196,154,60,0.3)", background: "none", border: "none",
                    cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3,
                  }}>
                    New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Watch Together ── */}
          {result && items.length > 0 && (
            <div style={{ marginTop: 48, animation: "result-in 0.6s 0.15s ease both" }}>
              <div style={{ borderTop: `1px solid rgba(196,154,60,0.2)`, paddingTop: 32 }}>
                <h2 className="font-display tracking-tight"
                  style={{ fontSize: "2.8rem", color: "rgba(240,210,150,0.95)", lineHeight: 1 }}>
                  Watch Together
                </h2>
                <p style={{ marginTop: 8, fontSize: 13, color: GOLD_DIM }}>
                  Films neither of you has seen that both your tastes point toward.
                </p>
                <div style={{ marginTop: 20 }}>
                  <RecRow
                    items={items}
                    profileId={profile}
                    surface="co_watch"
                    onRemove={(id) => setItems((prev) => prev.filter((it) => it.film.tmdbId !== id))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
