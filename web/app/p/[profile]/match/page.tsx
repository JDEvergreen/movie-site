"use client";

import { RecRow } from "@/components/recs/RecRow";
import { type MatchResult, getImportStatus, getMatch, importByUsername } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const GOLD     = "#c9a84c";
const GOLD_DIM = "rgba(196,154,60,0.5)";
const GOLD_TXT = "rgba(240,210,150,0.92)";
const EDGE     = "rgba(196,154,60,0.18)";
const BG       = "#0a0703";
const DARK     = "#1c1108";

const STAGE_LABELS: Record<string, string> = {
  queued:            "Initialising",
  fetching:          "Reading Letterboxd",
  matching:          "Matching films",
  enriching:         "Enriching catalogue",
  profiling:         "Analysing taste",
  precomputing_recs: "Computing results",
};

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const R = 72;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    setDisplayed(0);
    const dur = 1300;
    const t0 = performance.now();
    function tick(now: number) {
      const t = Math.min((now - t0) / dur, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setDisplayed(Math.round(ease * score));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [score]);

  return (
    <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
      <svg width={180} height={180} viewBox="0 0 180 180"
        style={{ position: "absolute", inset: 0 }}>
        <circle cx={90} cy={90} r={R}
          fill="none" stroke="rgba(196,154,60,0.1)" strokeWidth={9} />
        <circle cx={90} cy={90} r={R}
          fill="none" stroke={GOLD} strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - displayed / 100)}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 0.04s linear" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 3,
      }}>
        <span style={{ fontSize: 46, fontWeight: 300, lineHeight: 1, color: GOLD_TXT }}>
          {displayed}
        </span>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", color: GOLD_DIM }}>
          % MATCH
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MatchPage() {
  const { profile } = useParams<{ profile: string }>();
  const [username, setUsername] = useState("");
  const [result, setResult]     = useState<MatchResult | null>(null);
  const [items, setItems]       = useState<MatchResult["items"]>([]);
  const [loading, setLoading]   = useState(false);
  const [stage, setStage]       = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (result) setItems(result.items); }, [result]);

  async function importThenMatch(uname: string): Promise<MatchResult> {
    setStage("Importing profile");
    const { importId } = await importByUsername(uname);
    for (let i = 0; i < 180; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const st = await getImportStatus(importId);
      if (st.status === "ready") { setStage("Computing results"); return getMatch(profile, uname); }
      if (st.status === "failed") throw new Error("Import failed — check the username.");
      setStage(STAGE_LABELS[st.status] ?? "Processing");
    }
    throw new Error("Import timed out.");
  }

  async function find(e?: React.FormEvent) {
    e?.preventDefault();
    const q = username.trim();
    if (!q) return;
    setLoading(true); setError(null); setResult(null); setStage("Looking up profile");
    try {
      let data: MatchResult;
      try { setStage("Computing results"); data = await getMatch(profile, q); }
      catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("not found") || msg.includes("profile_not_found"))
          data = await importThenMatch(q);
        else throw err;
      }
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg.includes("taste_not_ready")
        ? "One or both profiles need more films imported first."
        : msg);
    } finally { setLoading(false); setStage(null); }
  }

  function reset() {
    setResult(null); setError(null); setItems([]); setUsername("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const label = !result ? null
    : result.compatibility.score >= 75 ? "Great match"
    : result.compatibility.score >= 55 ? "Good match"
    : "Some common ground";

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.2; }
        }
        .m-enter { animation: fade-up 0.4s ease both; }
        .m-input:focus { border-color: rgba(196,154,60,0.5) !important; }
      `}</style>

      <main style={{ minHeight: "100vh", background: BG, padding: "52px 24px 100px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Page label */}
          <div style={{
            fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(196,154,60,0.38)", marginBottom: 56,
          }}>
            Match
          </div>

          {/* ─── Input view ────────────────────────────────────────────── */}
          {!result && (
            <>
              <h1 style={{
                fontSize: 42, fontWeight: 600, color: GOLD_TXT,
                lineHeight: 1.15, marginBottom: 10,
              }}>
                How well do your<br />tastes line up?
              </h1>
              <p style={{ fontSize: 15, color: GOLD_DIM, marginBottom: 44, lineHeight: 1.6 }}>
                Enter a Letterboxd username to see your compatibility<br />
                and get film recommendations you'd both enjoy.
              </p>

              <form onSubmit={find}>
                {/* Two inputs */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  {/* Locked profile */}
                  <div style={{
                    flex: 1, padding: "15px 20px", borderRadius: 10,
                    background: "rgba(22,13,4,0.95)", border: `1px solid ${EDGE}`,
                    color: GOLD_TXT, fontSize: 17, fontWeight: 500,
                  }}>
                    {profile}
                  </div>

                  <span style={{ color: GOLD_DIM, fontSize: 16, flexShrink: 0, paddingInline: 6, letterSpacing: "0.04em" }}>
                    vs
                  </span>

                  <input
                    ref={inputRef}
                    className="m-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="their username"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={loading}
                    style={{
                      flex: 1, padding: "15px 20px", borderRadius: 10,
                      background: "rgba(22,13,4,0.95)",
                      border: `1px solid ${username.trim() ? "rgba(196,154,60,0.4)" : EDGE}`,
                      outline: "none", color: GOLD_TXT, fontSize: 17, fontWeight: 500,
                      transition: "border-color 0.2s",
                    }}
                  />
                </div>

                {/* Button row */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={loading || !username.trim()}
                    style={{
                      padding: "12px 36px", borderRadius: 10,
                      background: !loading && username.trim() ? GOLD : "rgba(196,154,60,0.07)",
                      color: !loading && username.trim() ? DARK : GOLD_DIM,
                      border: `1px solid ${!loading && username.trim() ? "transparent" : EDGE}`,
                      fontSize: 14, fontWeight: 600, letterSpacing: "0.03em",
                      cursor: loading || !username.trim() ? "not-allowed" : "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {loading ? "Matching…" : "Match"}
                  </button>
                </div>
              </form>

              {/* Loading state */}
              {loading && stage && (
                <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 5, height: 5, borderRadius: "50%", background: GOLD,
                        animation: `blink 1.2s ease-in-out ${i * 0.22}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: GOLD_DIM }}>{stage}</span>
                </div>
              )}

              {error && (
                <div style={{ marginTop: 20, fontSize: 13, color: "rgba(196,154,60,0.5)", lineHeight: 1.5 }}>
                  {error}
                </div>
              )}
            </>
          )}

          {/* ─── Results view ───────────────────────────────────────────── */}
          {result && (
            <div className="m-enter">

              {/* Matchup header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 44,
              }}>
                <h1 style={{ fontSize: 30, fontWeight: 600, color: GOLD_TXT, lineHeight: 1.2 }}>
                  {result.profileA}
                  <span style={{ color: GOLD_DIM, fontWeight: 300, margin: "0 14px" }}>×</span>
                  {result.profileB}
                </h1>
                <button
                  onClick={reset}
                  style={{
                    fontSize: 13, color: GOLD_DIM, background: "none",
                    border: `1px solid ${EDGE}`, borderRadius: 8,
                    padding: "7px 18px", cursor: "pointer", flexShrink: 0,
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                >
                  Start over
                </button>
              </div>

              {/* Score + breakdown */}
              <div style={{
                display: "flex", gap: 60, alignItems: "center",
                padding: "44px 0",
                borderTop: `1px solid ${EDGE}`,
                borderBottom: `1px solid ${EDGE}`,
                marginBottom: 56,
              }}>
                <ScoreRing score={result.compatibility.score} />

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 22, fontWeight: 600, color: GOLD_TXT, marginBottom: 10 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 14, color: GOLD_DIM, lineHeight: 1.75, marginBottom: 30 }}>
                    {result.compatibility.blurb}
                  </p>

                  <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
                    {result.compatibility.sharedGenres.length > 0 && (
                      <div>
                        <p style={{
                          fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "rgba(196,154,60,0.35)", marginBottom: 10,
                        }}>
                          Both love
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {result.compatibility.sharedGenres.map(g => (
                            <span key={g} style={{
                              padding: "4px 14px", borderRadius: 20, fontSize: 12,
                              background: "rgba(196,154,60,0.1)",
                              border: `1px solid rgba(196,154,60,0.25)`,
                              color: GOLD_TXT,
                            }}>{g}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.compatibility.divergentGenres.length > 0 && (
                      <div>
                        <p style={{
                          fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "rgba(196,154,60,0.35)", marginBottom: 10,
                        }}>
                          You diverge on
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {result.compatibility.divergentGenres.map(g => (
                            <span key={g} style={{
                              padding: "4px 14px", borderRadius: 20, fontSize: 12,
                              background: "rgba(196,154,60,0.04)",
                              border: `1px solid ${EDGE}`,
                              color: GOLD_DIM,
                            }}>{g}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Watch Together */}
              {items.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 600, color: GOLD_TXT, marginBottom: 8 }}>
                    Watch Together
                  </h2>
                  <p style={{ fontSize: 14, color: GOLD_DIM, lineHeight: 1.65, marginBottom: 24 }}>
                    Films neither of you has seen that both your tastes point toward.
                  </p>
                  <RecRow
                    items={items}
                    profileId={profile}
                    surface="co_watch"
                    onRemove={id => setItems(prev => prev.filter(it => it.film.tmdbId !== id))}
                  />
                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </>
  );
}
