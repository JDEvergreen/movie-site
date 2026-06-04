"""SQLAlchemy engine / session setup.

Phase 0 ships the schema via Alembic raw-SQL migration (see alembic/versions).
ORM models are added in Phase 1 when domain logic needs them; `Base` is defined
here now so those models have a declarative base to attach to.
"""

from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


@lru_cache
def get_engine() -> Engine:
    """Lazily build the engine on first use.

    Deliberately not constructed at import time: SQLAlchemy imports the DB driver
    eagerly in create_engine, so a lazy engine keeps `app.main` importable without
    a driver/live DB present (tests, serverless cold paths).
    """
    return create_engine(get_settings().database_url, pool_pre_ping=True)


@lru_cache
def _session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped session."""
    db = _session_factory()()
    try:
        yield db
    finally:
        db.close()
