"""Liveness / readiness checks. Used by docker-compose and the Phase 0 checklist."""

from fastapi import APIRouter
from sqlalchemy import text

from app.db.base import get_engine

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/db")
def health_db() -> dict[str, str]:
    with get_engine().connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "db": "reachable"}
