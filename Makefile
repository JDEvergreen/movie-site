# Phase 0 developer commands. Run from repo root.
# On Windows use Git Bash or WSL; targets shell out to docker compose.

.PHONY: help up down logs build migrate upgrade revision seed test fmt lint

help:
	@echo "up       - start full stack (postgres, redis, api, worker, web)"
	@echo "down     - stop stack"
	@echo "logs     - tail all logs"
	@echo "build    - rebuild images"
	@echo "upgrade  - apply DB migrations (alembic upgrade head)"
	@echo "revision - autogenerate a new migration (M=\"message\")"
	@echo "seed     - ingest a small corpus slice (needs TMDB_API_KEY)"
	@echo "test     - run api + web tests"
	@echo "fmt      - format (ruff + biome)"
	@echo "lint     - lint + typecheck (ruff, mypy, tsc)"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

upgrade:
	docker compose run --rm api alembic upgrade head

revision:
	docker compose run --rm api alembic revision --autogenerate -m "$(M)"

seed:
	docker compose run --rm api python -m app.scripts.seed_corpus

test:
	docker compose run --rm api pytest -q
	docker compose run --rm web pnpm test

fmt:
	docker compose run --rm api ruff format .
	docker compose run --rm web pnpm fmt

lint:
	docker compose run --rm api sh -c "ruff check . && mypy app"
	docker compose run --rm web pnpm lint
