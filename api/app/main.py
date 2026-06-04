"""FastAPI application factory.

Phase 0: app boots, mounts routers, emits OpenAPI, exposes /health. Route bodies
are contract stubs (HTTP 501) until Phase 1/2 fill in logic — the schemas in
app/schemas are the single source of truth for the Next client (PHASE0 §4).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, feedback, health, imports, profiles, recommendations

settings = get_settings()

app = FastAPI(
    title="Film Recommendation API",
    version="0.1.0",
    description="Taste-driven film recommendations layered on Letterboxd data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_base_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(imports.router)
app.include_router(profiles.router)
app.include_router(recommendations.router)
app.include_router(feedback.router)
