// Landing + entry (PLAN §10). Phase 0 placeholder: establishes the design
// language and the two ingest paths (decision #1: export-first, scrape fallback).
// Wiring to /imports lands in step 0.6/0.7.

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="font-display text-5xl font-semibold text-ink">
          Find the next film you'll love.
        </h1>
        <p className="text-lg text-ink-soft">
          A discovery layer on top of Letterboxd — explainable recommendations
          drawn from your own taste, not the crowd's.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 rounded-card bg-cream-50 p-6 shadow-sm">
        <button
          type="button"
          className="w-full rounded-card bg-teal px-5 py-3 font-medium text-cream-50 transition hover:bg-teal-600"
        >
          Upload your Letterboxd export
        </button>
        <p className="text-sm text-ink-soft">
          or look up a public username
        </p>
        <input
          type="text"
          placeholder="letterboxd username"
          className="w-full rounded-card border border-cream-200 bg-cream px-4 py-2 text-ink outline-none focus:border-teal"
        />
      </div>

      <p className="text-xs text-ink-soft">Phase 0 scaffold — ingest wiring coming next.</p>
    </main>
  );
}
