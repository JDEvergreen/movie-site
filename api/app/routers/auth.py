"""Magic-link auth (PLAN §1, decision #2). Contract stub — implemented in Phase 0
step 4."""

from fastapi import APIRouter, status

from app.routers._stub import not_implemented
from app.schemas.models import MagicLinkRequest, Session, User, VerifyRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/magic-link", status_code=status.HTTP_202_ACCEPTED)
def request_magic_link(body: MagicLinkRequest) -> dict[str, str]:
    not_implemented("magic-link request", phase="0.4")
    return {}  # unreachable; satisfies type checker


@router.post("/verify")
def verify(body: VerifyRequest) -> Session:
    not_implemented("magic-link verify", phase="0.4")
    raise AssertionError


@router.get("/me")
def me() -> User:
    not_implemented("current user", phase="0.4")
    raise AssertionError
