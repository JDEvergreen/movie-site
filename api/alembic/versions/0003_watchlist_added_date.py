"""Add watchlist_added_date to user_film_rating.

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-24
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


DDL_UP = """
ALTER TABLE user_film_rating
    ADD COLUMN IF NOT EXISTS watchlist_added_date DATE;
"""

DDL_DOWN = """
ALTER TABLE user_film_rating DROP COLUMN IF EXISTS watchlist_added_date;
"""


def upgrade() -> None:
    op.execute(DDL_UP)


def downgrade() -> None:
    op.execute(DDL_DOWN)
