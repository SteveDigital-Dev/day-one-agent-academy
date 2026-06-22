# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Agent Academy** — an AI-powered homeschool educational platform. FastAPI backend + React/TypeScript/Tailwind frontend. Full architecture is documented in `AGENTS.md`; this file covers commands and Claude-specific context.

## Commands

### Backend (run from `backend/`)

```bash
uv sync                                          # install deps
uv run uvicorn app.main:app --reload             # API on :8000
uv run pytest tests/ -v                          # all 22 tests
uv run pytest tests/test_auth.py -v              # single test file
uv run python -m app.seed                        # populate demo data
uv run ruff check app/                           # lint
uv run ruff format app/                          # format
```

### Frontend (run from `frontend/`)

```bash
npm install
npm run dev          # dev server on :5173 (proxies /api → localhost:8000)
npm run build        # tsc + vite build
npx vitest run       # 10 frontend tests
```

### Environment

Copy `backend/.env.example` to `backend/.env` before first run. Default AI provider is Ollama (`qwen3:4b` on port 11434).

## Architecture

See `AGENTS.md` for the full breakdown. Key points for day-to-day edits:

**Module structure** — each backend module follows `models.py / schemas.py / service.py / router.py`. Add routes in `router.py`, mount them in `app/main.py`.

**UUID invariant** — `app/` uses `sqlalchemy.Uuid()` (not the Postgres dialect). Service functions must convert incoming string IDs to `uuid.UUID` before passing to ORM queries. Response schemas declare ID fields as `uuid.UUID`; FastAPI serializes them to strings in JSON automatically.

**Async everywhere** — all DB access is async (`aiosqlite` in dev, `asyncpg` in prod). Use `await` and `async with get_db()` session patterns consistently.

**AI provider** — `app/ai/` is model-agnostic. Switch providers via `AA_AI_PROVIDER` env var (`ollama` | `openai` | `anthropic`). Don't hardcode provider logic outside that module.

**Tests** — `conftest.py` creates a function-scoped in-memory SQLite engine (drops tables after each test). Don't share state between tests; each test must set up its own data via the fixture.

**PDF generation** — `weasyprint` requires system libs (`glib`, `pango`, `cairo`). `brew install weasyprint` needs interactive sudo; PDF endpoints will fail locally until installed.

## Demo credentials

`parent@demo.aa` / `demo1234` (created by seed script)
