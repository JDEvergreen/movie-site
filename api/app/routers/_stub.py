"""Helper for Phase 0 contract stubs.

Routes declare their real response_model (so OpenAPI / the generated TS client are
accurate) but raise 501 until the logic lands in a later step. Each call names the
phase that will implement it, so the stub surface is self-documenting.
"""

from fastapi import HTTPException, status


def not_implemented(what: str, phase: str) -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "error": {
                "code": "not_implemented",
                "message": f"{what} is not implemented yet",
                "details": {"planned_phase": phase},
            }
        },
    )
