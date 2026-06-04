"""Import endpoints: export upload (primary), username scrape (fallback), status,
and the SSE progress stream (PLAN §5). Contract stubs — pipeline lands in steps
0.5/0.6."""

from fastapi import APIRouter, UploadFile, status

from app.routers._stub import not_implemented
from app.schemas.models import ByUsernameRequest, ImportCreated, ImportStatus

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def create_import_from_export(file: UploadFile) -> ImportCreated:
    """Primary path: upload a Letterboxd export ZIP (decision #1)."""
    not_implemented("export-upload import", phase="0.6")
    raise AssertionError


@router.post("/by-username", status_code=status.HTTP_202_ACCEPTED)
def create_import_from_username(body: ByUsernameRequest) -> ImportCreated:
    """Fallback path: scrape a public profile by username."""
    not_implemented("username-scrape import", phase="1")
    raise AssertionError


@router.get("/{import_id}")
def get_import_status(import_id: str) -> ImportStatus:
    not_implemented("import status", phase="0.5")
    raise AssertionError


@router.get("/{import_id}/events")
async def import_events(import_id: str) -> None:
    """SSE stream of import progress (text/event-stream)."""
    not_implemented("import SSE stream", phase="0.5")
