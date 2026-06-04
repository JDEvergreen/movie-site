"""North-star feedback capture (PLAN §12). Contract stub — logic in Phase 2."""

from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.models import FeedbackRequest

router = APIRouter(prefix="/profiles", tags=["feedback"])


@router.post("/{profile_id}/feedback", status_code=status.HTTP_204_NO_CONTENT)
def submit_feedback(profile_id: str, body: FeedbackRequest) -> None:
    not_implemented("feedback capture", phase="2")
