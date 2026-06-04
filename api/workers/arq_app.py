"""arq worker entrypoint. `arq workers.arq_app.WorkerSettings` (see docker-compose).

Phase 0: registers the task surface (PHASE0 §5) with stub bodies so the worker
boots and the queue wiring is verifiable. Real bodies land in steps 0.5/0.6 and
Phases 1-2.
"""

from arq.connections import RedisSettings

from app.config import get_settings

settings = get_settings()


async def run_import(ctx: dict, import_id: str) -> None:
    """Drive the import state machine (PLAN §5). Stub — step 0.5/0.6."""
    raise NotImplementedError("run_import: step 0.5/0.6")


async def enrich_films(ctx: dict, tmdb_ids: list[int]) -> None:
    """TMDB enrichment with cache + single-flight. Stub — step 0.3."""
    raise NotImplementedError("enrich_films: step 0.3")


async def corpus_refresh(ctx: dict) -> None:
    """Weekly corpus refresh + idf/weighted_rating recompute. Stub — step 0.3/1."""
    raise NotImplementedError("corpus_refresh: step 0.3/1")


async def precompute_recs(ctx: dict, profile_id: str) -> None:
    """Materialize default rec surfaces after import. Stub — Phase 2."""
    raise NotImplementedError("precompute_recs: Phase 2")


class WorkerSettings:
    functions = [run_import, enrich_films, corpus_refresh, precompute_recs]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
