"""Seed a small corpus slice into `film` (PHASE0 §6, step 0.3).

Stub: real implementation pulls TMDB's daily id-export, filters to
vote_count >= CORPUS_VOTE_COUNT_FLOOR, enriches via the TMDB client, and computes
weighted_rating / keyword idf. Requires TMDB_API_KEY.

Run: `python -m app.scripts.seed_corpus`  (or `make seed`).
"""

import sys

from app.config import get_settings


def main() -> int:
    settings = get_settings()
    if not settings.tmdb_api_key:
        print(
            "TMDB_API_KEY is not set. Add it to .env before seeding "
            "(themoviedb.org -> Settings -> API).",
            file=sys.stderr,
        )
        return 1
    print(
        "seed_corpus is a Phase-0 step-0.3 stub. "
        f"Will seed films with vote_count >= {settings.corpus_vote_count_floor}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
