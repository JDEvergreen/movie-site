"""initial schema (corpus, users/profiles, computed artifacts)

Mirrors PHASE0_SCAFFOLDING.md §3 (with PLAN §18 halfvec adjustment). Shipped as
raw SQL because the schema predates the ORM models (those arrive in Phase 1).

Revision ID: 0001
Revises:
Create Date: 2026-06-02
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


DDL = r"""
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------- corpus ----------
CREATE TABLE film (
    tmdb_id            INTEGER PRIMARY KEY,
    imdb_id            TEXT,
    title              TEXT NOT NULL,
    original_title     TEXT,
    year               SMALLINT,
    runtime_min        SMALLINT,
    original_language  TEXT,
    overview           TEXT,
    poster_path        TEXT,
    vote_average       REAL,
    vote_count         INTEGER,
    popularity         REAL,
    weighted_rating    REAL,
    adult              BOOLEAN DEFAULT FALSE,
    status             TEXT,
    feature_vector     halfvec(1024),
    enriched_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX film_year_idx        ON film (year);
CREATE INDEX film_wr_idx          ON film (weighted_rating DESC);
CREATE INDEX film_pop_idx         ON film (popularity);
CREATE INDEX film_title_trgm_idx  ON film USING gin (title gin_trgm_ops);
CREATE INDEX film_vec_idx         ON film USING hnsw (feature_vector halfvec_cosine_ops);

CREATE TABLE person (
    tmdb_id    INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    department TEXT
);

CREATE TABLE keyword (
    tmdb_id       INTEGER PRIMARY KEY,
    name          TEXT NOT NULL,
    df            INTEGER DEFAULT 0,
    idf           REAL,
    is_stoplisted BOOLEAN DEFAULT FALSE
);

CREATE TABLE genre ( id INTEGER PRIMARY KEY, name TEXT NOT NULL );

CREATE TABLE film_genre (
    film_id INTEGER REFERENCES film, genre_id INTEGER REFERENCES genre,
    PRIMARY KEY (film_id, genre_id)
);
CREATE TABLE film_keyword (
    film_id INTEGER REFERENCES film, keyword_id INTEGER REFERENCES keyword,
    PRIMARY KEY (film_id, keyword_id)
);
CREATE TABLE film_crew (
    film_id INTEGER REFERENCES film, person_id INTEGER REFERENCES person,
    job TEXT,
    PRIMARY KEY (film_id, person_id, job)
);
CREATE TABLE film_country (
    film_id INTEGER REFERENCES film, country_code TEXT,
    PRIMARY KEY (film_id, country_code)
);

CREATE TABLE streaming_availability (
    film_id      INTEGER REFERENCES film,
    region       TEXT,
    provider     TEXT,
    offer_type   TEXT,
    refreshed_at TIMESTAMPTZ,
    PRIMARY KEY (film_id, region, provider, offer_type)
);

CREATE TABLE title_crosswalk (
    norm_title TEXT,
    year       SMALLINT,
    tmdb_id    INTEGER REFERENCES film,
    confidence REAL,
    source     TEXT,
    PRIMARY KEY (norm_title, year)
);

-- ---------- users & profiles ----------
CREATE TABLE app_user (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT UNIQUE,
    region     TEXT DEFAULT 'US',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE letterboxd_profile (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username       TEXT NOT NULL,
    display_name   TEXT,
    owner_user_id  UUID REFERENCES app_user,
    last_import_at TIMESTAMPTZ,
    UNIQUE (username)
);

CREATE TABLE profile_import (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id   UUID REFERENCES letterboxd_profile,
    source       TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'queued',
    stage_counts JSONB DEFAULT '{}',
    error        TEXT,
    started_at   TIMESTAMPTZ DEFAULT now(),
    finished_at  TIMESTAMPTZ
);
CREATE INDEX profile_import_profile_idx ON profile_import (profile_id, started_at DESC);

CREATE TABLE user_film_rating (
    profile_id   UUID REFERENCES letterboxd_profile,
    film_id      INTEGER REFERENCES film,
    rating_0_10  SMALLINT,
    liked        BOOLEAN DEFAULT FALSE,
    watched_date DATE,
    review_text  TEXT,
    in_watchlist BOOLEAN DEFAULT FALSE,
    source       TEXT,
    PRIMARY KEY (profile_id, film_id)
);
CREATE INDEX ufr_profile_idx ON user_film_rating (profile_id);

CREATE TABLE unmatched_film (
    profile_id      UUID REFERENCES letterboxd_profile,
    raw_title       TEXT,
    raw_year        SMALLINT,
    lb_uri          TEXT,
    rating_0_10     SMALLINT,
    best_guess_tmdb INTEGER,
    confidence      REAL,
    PRIMARY KEY (profile_id, lb_uri)
);

-- ---------- computed artifacts ----------
CREATE TABLE taste_profile (
    profile_id        UUID PRIMARY KEY REFERENCES letterboxd_profile,
    model_version     TEXT NOT NULL,
    mu                REAL,
    sigma             REAL,
    taste_vector      halfvec(1024),
    genre_affinity    JSONB,
    director_affinity JSONB,
    era_affinity      JSONB,
    country_affinity  JSONB,
    runtime_pref      JSONB,
    top_keywords      JSONB,
    gaps              JSONB,
    computed_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recommendation_set (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id    UUID REFERENCES letterboxd_profile,
    surface       TEXT NOT NULL,
    params        JSONB DEFAULT '{}',
    model_version TEXT NOT NULL,
    share_id      TEXT UNIQUE,
    computed_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE (profile_id, surface, params, model_version)
);

CREATE TABLE recommendation_item (
    set_id      UUID REFERENCES recommendation_set,
    film_id     INTEGER REFERENCES film,
    rank        SMALLINT,
    score       REAL,
    components  JSONB,
    explanation JSONB,
    PRIMARY KEY (set_id, film_id)
);

CREATE TABLE user_feedback (
    profile_id UUID REFERENCES letterboxd_profile,
    film_id    INTEGER REFERENCES film,
    action     TEXT NOT NULL,
    surface    TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (profile_id, film_id, action)
);
CREATE INDEX feedback_funnel_idx ON user_feedback (surface, action, created_at);
"""


DROP = r"""
DROP TABLE IF EXISTS user_feedback;
DROP TABLE IF EXISTS recommendation_item;
DROP TABLE IF EXISTS recommendation_set;
DROP TABLE IF EXISTS taste_profile;
DROP TABLE IF EXISTS unmatched_film;
DROP TABLE IF EXISTS user_film_rating;
DROP TABLE IF EXISTS profile_import;
DROP TABLE IF EXISTS letterboxd_profile;
DROP TABLE IF EXISTS app_user;
DROP TABLE IF EXISTS title_crosswalk;
DROP TABLE IF EXISTS streaming_availability;
DROP TABLE IF EXISTS film_country;
DROP TABLE IF EXISTS film_crew;
DROP TABLE IF EXISTS film_keyword;
DROP TABLE IF EXISTS film_genre;
DROP TABLE IF EXISTS genre;
DROP TABLE IF EXISTS keyword;
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS film;
"""


def upgrade() -> None:
    op.execute(DDL)


def downgrade() -> None:
    op.execute(DROP)
