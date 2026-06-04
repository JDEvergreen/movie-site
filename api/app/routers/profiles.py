"""Profile + taste-profile reads (PLAN §6). Contract stubs — logic in Phase 1."""

from fastapi import APIRouter

from app.routers._stub import not_implemented
from app.schemas.models import FilmCard, ProfileSummary, TasteProfile

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/{profile_id}")
def get_profile(profile_id: str) -> ProfileSummary:
    not_implemented("profile summary", phase="1")
    raise AssertionError


@router.get("/{profile_id}/taste")
def get_taste(profile_id: str) -> TasteProfile:
    not_implemented("taste profile", phase="1")
    raise AssertionError


@router.get("/{profile_id}/recently-watched")
def recently_watched(profile_id: str, limit: int = 24) -> list[FilmCard]:
    not_implemented("recently watched", phase="1")
    raise AssertionError
