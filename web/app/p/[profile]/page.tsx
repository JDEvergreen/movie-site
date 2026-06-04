"use client";

// Profile hub (PLAN §5 step 5, §6): the taste breakdown is the core analytical
// object. Client-fetched (consistent with the rest of the app) with skeletons
// while loading and a "still computing" state if the import just finished.

import { Poster } from "@/components/film/Poster";
import { AffinityBars } from "@/components/taste/AffinityBars";
import {
  type FilmCard,
  type ProfileSummary,
  type TasteProfile,
  getProfileSummary,
  getRecentlyWatched,
  getTasteProfile,
} from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfileHubPage() {
  const { profile } = useParams<{ profile: string }>();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [taste, setTaste] = useState<TasteProfile | null>(null);
  const [recent, setRecent] = useState<FilmCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfileSummary(profile).catch(() => null),
      getTasteProfile(profile).catch(() => null),
      getRecentlyWatched(profile).catch(() => []),
    ]).then(([s, t, r]) => {
      setSummary(s);
      setTaste(t);
      setRecent(r);
      setLoading(false);
    });
  }, [profile]);

  if (loading) return <HubSkeleton />;

  const directors = taste
    ? Object.values(taste.directorAffinity)
        .filter((d) => d.affinity > 0)
        .sort((a, b) => b.affinity - a.affinity)
        .slice(0, 6)
    : [];

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-ink-soft">Taste profile</p>
        <h1 className="font-display text-4xl font-semibold text-ink">
          {summary?.displayName ?? summary?.username ?? "Your profile"}
        </h1>
        <p className="text-ink-soft">
          {summary?.filmCount ?? 0} films
          {taste?.runtimePref?.pref_min
            ? ` · prefers ~${Math.round(taste.runtimePref.pref_min)} min`
            : ""}
        </p>
      </header>

      {!taste ? (
        <p className="rounded-card bg-cream-50 px-5 py-4 text-ink-soft">
          Your taste profile is still being computed — refresh in a moment.
        </p>
      ) : (
        <>
          <section className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <Card
              title="Genre affinities"
              hint="How you rate each genre vs. your own average — honestly."
            >
              <AffinityBars genres={taste.genreAffinity} />
            </Card>

            <div className="space-y-8">
              <Card title="Directors you rate highly">
                {directors.length ? (
                  <ul className="space-y-2">
                    {directors.map((d) => (
                      <li key={d.name} className="flex items-center justify-between text-sm">
                        <span className="text-ink">{d.name}</span>
                        <span className="text-xs text-teal-600">
                          +{d.affinity.toFixed(2)} · {d.count} films
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-soft">Not enough repeat directors yet.</p>
                )}
              </Card>

              <Card title="Your themes">
                <div className="flex flex-wrap gap-2">
                  {taste.topKeywords.slice(0, 14).map((k) => (
                    <span
                      key={k.id}
                      className="rounded-full bg-sunny/30 px-3 py-1 text-xs text-ink"
                    >
                      {k.name}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {recent.length > 0 && (
            <Card title="Recently watched">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {recent.map((f) => (
                  <Poster
                    key={f.tmdbId}
                    path={f.posterPath}
                    title={f.title}
                    rating={f.yourRating}
                  />
                ))}
              </div>
            </Card>
          )}

          {taste.gaps?.decades?.length ? (
            <Card
              title="Blind spots"
              hint="Eras you've under-explored — recommendations to fill them are coming."
            >
              <div className="flex flex-wrap gap-2">
                {taste.gaps.decades.map((d) => (
                  <span
                    key={d.decade}
                    className="rounded-full bg-coral/15 px-3 py-1 text-xs text-coral-600"
                  >
                    {d.decade}s
                  </span>
                ))}
              </div>
            </Card>
          ) : null}

          <p className="text-center text-sm text-ink-soft">
            Personalized recommendations (blind spots, hidden gems, director rabbit holes) arrive in
            Phase 2.
          </p>
        </>
      )}
    </main>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-card bg-cream-50 p-5 shadow-sm">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        {hint && <p className="text-xs text-ink-soft">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function HubSkeleton() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div className="h-10 w-64 skeleton" />
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="h-72 skeleton rounded-card" />
        <div className="h-72 skeleton rounded-card" />
      </div>
      <div className="h-48 skeleton rounded-card" />
    </main>
  );
}
