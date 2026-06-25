"use client";

import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { getDiscover, posterUrl, type RecItem } from "@/lib/api";

const GOLD = "#c9a84c";
const GOLD_TEXT = "rgba(240,210,150,0.92)";
const GOLD_DIM = "rgba(196,154,60,0.45)";
const CARD_BG = "rgba(22,13,4,0.92)";
const CARD_BORDER = "rgba(196,154,60,0.22)";

interface Option {
  value: string;
  label: string;
  sub?: string;
}

interface Question {
  id: string;
  question: string;
  cols: number;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "genre",
    question: "What genre?",
    cols: 4,
    options: [
      { value: "action",    label: "Action" },
      { value: "adventure", label: "Adventure" },
      { value: "animation", label: "Animation" },
      { value: "comedy",    label: "Comedy" },
      { value: "crime",     label: "Crime" },
      { value: "drama",     label: "Drama" },
      { value: "fantasy",   label: "Fantasy" },
      { value: "horror",    label: "Horror" },
      { value: "mystery",   label: "Mystery" },
      { value: "romance",   label: "Romance" },
      { value: "sci-fi",    label: "Sci-Fi" },
      { value: "thriller",  label: "Thriller" },
      { value: "western",   label: "Western" },
      { value: "history",   label: "History" },
      { value: "any",       label: "Any genre" },
    ],
  },
  {
    id: "era",
    question: "Which era?",
    cols: 3,
    options: [
      { value: "classic", label: "Classic",       sub: "before 1970" },
      { value: "retro",   label: "Golden Age",    sub: "1970s – 1990s" },
      { value: "modern",  label: "2000s – 2010s", sub: "a little nostalgic" },
      { value: "new",     label: "Brand New",     sub: "2015 and later" },
      { value: "any",     label: "Any era",       sub: "" },
    ],
  },
  {
    id: "length",
    question: "How much time do you have?",
    cols: 2,
    options: [
      { value: "short",    label: "Quick Watch",    sub: "under 90 minutes" },
      { value: "standard", label: "Just Right",     sub: "90 to 130 minutes" },
      { value: "epic",     label: "I'm All In",     sub: "over 2 hours" },
      { value: "any",      label: "Doesn't matter", sub: "" },
    ],
  },
  {
    id: "popularity",
    question: "How well-known should it be?",
    cols: 3,
    options: [
      { value: "mainstream", label: "Crowd Favourite", sub: "widely seen & acclaimed" },
      { value: "hidden",     label: "Hidden Gem",      sub: "something you likely haven't seen" },
      { value: "any",        label: "Either",          sub: "" },
    ],
  },
  {
    id: "language",
    question: "Language?",
    cols: 3,
    options: [
      { value: "english", label: "English only",      sub: "" },
      { value: "foreign", label: "Something foreign", sub: "subtitles welcome" },
      { value: "any",     label: "Any language",      sub: "" },
    ],
  },
];

type Answers = Record<string, string>;

export default function DiscoverPage() {
  const { profile } = useParams<{ profile: string }>();
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [results, setResults] = useState<RecItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const pick = async (value: string) => {
    const q = QUESTIONS[step];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = await getDiscover(profile, next);
      setResults(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
    setError(null);
    setLoading(false);
  };

  const q = QUESTIONS[step];
  const done = results !== null;

  return (
    <main style={{ minHeight: "100vh", background: "#0a0703", padding: "48px 24px 80px" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 1; }
        }
        .disc-enter { animation: fadeUp 0.32s ease both; }
        .disc-card  { animation: fadeUp 0.4s ease both; }
        .opt-btn {
          background: ${CARD_BG};
          border: 1px solid ${CARD_BORDER};
          border-radius: 12px;
          padding: 18px 20px;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          width: 100%;
        }
        .opt-btn:hover {
          background: rgba(196,154,60,0.1);
          border-color: rgba(196,154,60,0.55);
          transform: translateY(-2px);
        }
        .res-card {
          background: ${CARD_BG};
          border: 1px solid ${CARD_BORDER};
          border-radius: 14px;
          overflow: hidden;
          transition: transform 0.15s, border-color 0.15s;
        }
        .res-card:hover {
          border-color: rgba(196,154,60,0.5);
          transform: translateY(-3px);
        }
        .reset-btn {
          background: transparent;
          border: 1px solid rgba(196,154,60,0.3);
          border-radius: 8px;
          padding: 10px 28px;
          color: ${GOLD_DIM};
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .reset-btn:hover {
          border-color: rgba(196,154,60,0.65);
          color: ${GOLD_TEXT};
        }
      `}</style>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Page header */}
        <div style={{
          fontSize: 12,
          letterSpacing: "0.18em",
          color: "rgba(196,154,60,0.4)",
          textTransform: "uppercase",
          marginBottom: 56,
        }}>
          Discover
        </div>

        {/* Loading */}
        {loading && (
          <div className="disc-enter" style={{ textAlign: "center", paddingTop: 96 }}>
            <div style={{ fontSize: 14, letterSpacing: "0.2em", color: GOLD_DIM, marginBottom: 28 }}>
              FINDING YOUR FILM
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: GOLD,
                  animation: `pulse 1.2s ease-in-out ${i * 0.25}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Quiz */}
        {!loading && !done && (
          <div key={step} className="disc-enter">
            {/* Progress bar */}
            <div style={{ display: "flex", gap: 5, marginBottom: 52 }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{
                  height: 2,
                  flex: 1,
                  borderRadius: 2,
                  background: i <= step ? GOLD : "rgba(196,154,60,0.12)",
                  transition: "background 0.35s ease",
                }} />
              ))}
            </div>

            {/* Question */}
            <h2 style={{
              fontSize: 38,
              fontWeight: 600,
              color: GOLD_TEXT,
              marginBottom: 36,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}>
              {q.question}
            </h2>

            {/* Options grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${q.cols}, 1fr)`,
              gap: 10,
            }}>
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  className="opt-btn"
                  onClick={() => pick(opt.value)}
                >
                  <div style={{ fontSize: 15, fontWeight: 500, color: GOLD_TEXT, marginBottom: opt.sub ? 3 : 0 }}>
                    {opt.label}
                  </div>
                  {opt.sub && (
                    <div style={{ fontSize: 12, color: GOLD_DIM, lineHeight: 1.3 }}>
                      {opt.sub}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Back button */}
            {step > 0 && (
              <button
                className="reset-btn"
                onClick={() => setStep(s => s - 1)}
                style={{ marginTop: 32, fontSize: 13 }}
              >
                ← Back
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && done && (
          <div className="disc-enter">
            {error || results!.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: 16, color: GOLD_DIM, marginBottom: 10 }}>
                  {error ?? "No films matched those filters."}
                </div>
                {!error && (
                  <div style={{ fontSize: 13, color: "rgba(196,154,60,0.3)", marginBottom: 28 }}>
                    Try relaxing one or two answers.
                  </div>
                )}
                {error && <div style={{ marginBottom: 28 }} />}
                <button className="reset-btn" onClick={reset}>Start over</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, letterSpacing: "0.16em", color: GOLD_DIM, marginBottom: 32, textTransform: "uppercase" }}>
                  Tonight, watch
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${results!.length}, 1fr)`,
                  gap: 18,
                  marginBottom: 44,
                }}>
                  {results!.map((item, i) => (
                    <ResultCard key={item.film.tmdbId} item={item} delay={i * 0.08} />
                  ))}
                </div>
                <button className="reset-btn" onClick={reset}>Start over</button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ResultCard({ item, delay }: { item: RecItem; delay: number }) {
  const poster = posterUrl(item.film.posterPath, "w342");
  const runtime = item.film.runtimeMin
    ? `${Math.floor(item.film.runtimeMin / 60)}h ${item.film.runtimeMin % 60}m`
    : null;

  return (
    <div className="res-card disc-card" style={{ animationDelay: `${delay}s` }}>
      {/* Poster */}
      {poster ? (
        <div style={{ position: "relative", aspectRatio: "2/3" }}>
          <Image src={poster} alt={item.film.title} fill style={{ objectFit: "cover" }} />
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,0.78)",
            border: "1px solid rgba(196,154,60,0.4)",
            borderRadius: 6,
            padding: "3px 9px",
            fontSize: 11,
            color: "#e8c870",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}>
            {item.fit}% match
          </div>
        </div>
      ) : (
        <div style={{
          aspectRatio: "2/3",
          background: "rgba(196,154,60,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "rgba(196,154,60,0.15)", fontSize: 48 }}>?</span>
        </div>
      )}

      {/* Info */}
      <div style={{ padding: "16px 16px 18px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: GOLD_TEXT, marginBottom: 4, lineHeight: 1.25 }}>
          {item.film.title}
        </div>
        <div style={{ fontSize: 12, color: GOLD_DIM, marginBottom: 10 }}>
          {[item.film.year, runtime].filter(Boolean).join(" · ")}
        </div>

        {item.film.genres && item.film.genres.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {item.film.genres.slice(0, 3).map(g => (
              <span key={g} style={{
                fontSize: 11,
                padding: "2px 8px",
                background: "rgba(196,154,60,0.08)",
                border: "1px solid rgba(196,154,60,0.18)",
                borderRadius: 4,
                color: "rgba(240,210,150,0.55)",
              }}>
                {g}
              </span>
            ))}
          </div>
        )}

        {item.explanation.reasons[0] && (
          <div style={{
            fontSize: 12,
            color: "rgba(196,154,60,0.4)",
            fontStyle: "italic",
            lineHeight: 1.45,
          }}>
            {item.explanation.reasons[0]}
          </div>
        )}
      </div>
    </div>
  );
}
