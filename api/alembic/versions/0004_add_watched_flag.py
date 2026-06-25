"""Add watched boolean to user_film_rating; separate watched-status from watchlist-status.

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-25
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


DDL_UP = """
ALTER TABLE user_film_rating
    ADD COLUMN watched BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: rows where in_watchlist IS NOT TRUE were watched films
UPDATE user_film_rating SET watched = (in_watchlist IS NOT TRUE);
"""

DDL_DOWN = """
ALTER TABLE user_film_rating DROP COLUMN watched;
"""


def upgrade() -> None:
    op.execute(DDL_UP)


def downgrade() -> None:
    op.execute(DDL_DOWN)
