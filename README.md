# Reel — taste-driven film discovery

A discovery layer on top of Letterboxd: it ingests your own watch history and
generates explainable, personalized film recommendations across multiple lenses.
Not a Letterboxd replacement — the intelligent recommendation layer it lacks.

> **North-star metric:** does the user discover a film they end up watching and
> loving that they wouldn't have found otherwise?

## Documentation

Planning is the source of truth — read these before changing architecture:

- [`docs/PLAN.md`](docs/PLAN.md) — product scope, architecture, data strategy, roadmap, decisions.
- [`docs/RECOMMENDATION_MATH.md`](docs/RECOMMENDATION_MATH.md) — engine formulas, weights, tuning.
- [`docs/PHASE0_SCAFFOLDING.md`](docs/PHASE0_SCAFFOLDING.md) — repo layout, schema DDL, service contract.

## Stack

- **web/** — Next.js (App Router) + TypeScript + Tailwind + Framer Motion.
- **api/** — FastAPI + SQLAlchemy + Alembic; arq workers; Postgres (+pgvector) + Redis.
- $0 / free-tier deployment posture (PLAN §18).

## Quick start (local)

Requires Docker. Then:

```bash
cp .env.example .env        # add TMDB_API_KEY when ready to seed
make up                     # postgres, redis, api, worker, web
make upgrade                # apply DB migrations
# api:  http://localhost:8000/health   docs: http://localhost:8000/docs
# web:  http://localhost:3000
```

Other commands: `make help`.

## Status

**Phase 0 (foundations) — in progress.** Repo skeleton, docker-compose, schema
migration, FastAPI app with contract stubs, arq worker skeleton, and the Next
design skeleton are in place. Route bodies return HTTP 501 with the implementing
phase named, so the API surface is honest. Next: TMDB integration (0.3), auth
(0.4), import state machine + SSE (0.5/0.6), and the front-end ingest flow (0.7).
See PLAN §16 for the full roadmap.
