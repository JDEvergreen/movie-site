"""Recommendation surfaces (PLAN §7-8, RECOMMENDATION_MATH). Contract stubs —
engine lands in Phase 2."""

from fastapi import APIRouter, Query

from app.routers._stub import not_implemented
from app.schemas.models import RecommendationSet

router = APIRouter(tags=["recommendations"])


@router.get("/profiles/{profile_id}/recs/{surface}")
def get_recs(
    profile_id: str,
    surface: str,
    mood: str | None = Query(default=None),
    decade: int | None = Query(default=None),
    country: str | None = Query(default=None),
    director: int | None = Query(default=None),
    limit: int = 24,
    offset: int = 0,
) -> RecommendationSet:
    not_implemented(f"recommendations[{surface}]", phase="2")
    raise AssertionError


@router.post("/recs/{set_id}/share")
def share_set(set_id: str) -> dict[str, str]:
    not_implemented("share recommendation set", phase="3")
    raise AssertionError


@router.get("/share/{share_id}")
def get_shared(share_id: str) -> RecommendationSet:
    not_implemented("shared recommendation set", phase="3")
    raise AssertionError
