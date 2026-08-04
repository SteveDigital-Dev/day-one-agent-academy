# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Agent Academy** — an AI-powered homeschool educational platform. FastAPI backend + React/TypeScript/Tailwind frontend. Full architecture is documented in `AGENTS.md`; this file covers commands and Claude-specific context.

## Commands

### Backend (run from `backend/`)

```bash
uv sync --all-extras                             # install deps (core + dev group)
uv run uvicorn app.main:app --port 8001 --reload # API on :8001
uv run pytest tests/ -v                          # all 38 tests
uv run pytest tests/test_auth.py -v              # single test file
uv run python -m app.seed                        # populate demo data
uv run ruff check app/                           # lint
uv run ruff format app/                          # format
```

### Frontend (run from `frontend/`)

```bash
npm install
npm run dev          # dev server on :5173 (proxies /api → localhost:8001)
npm run build        # tsc + vite build
npx vitest run       # frontend tests
```

### Environment

Copy `backend/.env.example` to `backend/.env` before first run. Default AI provider is Ollama (`qwen3:4b` on port 11434).

`AA_SECRET_KEY` must be a real random value (32+ chars) once `AA_DEBUG=false` — `app/config.py` raises `RuntimeError` at import time otherwise (it signs every JWT; the placeholder is public since it's committed in `.env.example`, and short keys are weaker than HS256 intends per RFC 7518). `AA_CORS_ORIGINS` (comma-separated) controls allowed frontend origins, default `http://localhost:5173`. `/api/auth/login` and `/register` are rate-limited via `slowapi` (`app/rate_limit.py`) — disabled in `tests/conftest.py` since fixtures log in fresh per test. JWT lib is PyJWT (not python-jose — see AGENTS.md for why).

## Architecture

See `AGENTS.md` for the full breakdown. Key points for day-to-day edits:

**Module structure** — each backend module follows `models.py / schemas.py / service.py / router.py`. Add routes in `router.py`, mount them in `app/main.py`.

**UUID invariant** — `app/` uses `sqlalchemy.Uuid()` (not the Postgres dialect). Service functions must convert incoming string IDs to `uuid.UUID` before passing to ORM queries. Response schemas declare ID fields as `uuid.UUID`; FastAPI serializes them to strings in JSON automatically.

**Async everywhere** — all DB access is async (`aiosqlite` in dev, `asyncpg` in prod). Use `await` and `async with get_db()` session patterns consistently.

**AI provider** — `app/ai/` is model-agnostic. Switch providers via `AA_AI_PROVIDER` env var (`ollama` | `openai` | `anthropic`). Don't hardcode provider logic outside that module. The `GET /api/ai/lesson/{lesson_id}/quiz` endpoint generates structured `GameQuestion[]` from lesson content using assistant prefill + `think=False` for qwen3 reliability.

**Gamification** — frontend-only state in `GameContext` (localStorage). XP, levels, streaks, achievements. `GameEngine` renders quiz/match/sort/fill questions. `LessonViewer` fetches AI-generated questions from the backend when entering Play mode, falling back to static extraction if the call fails.

**Lesson content** — 36 markdown files in `lessons/{subject}/unit-{n}-lesson-{n}.md`. The seed loads them automatically; `extract_lesson_title()` in `seed.py` pulls the `# Heading` as the DB lesson title so titles stay in sync with content.

**Tests** — `conftest.py` creates a function-scoped in-memory SQLite engine (drops tables after each test). Don't share state between tests; each test must set up its own data via the fixture.

**Ownership checks are mandatory on every id-taking endpoint** — see AGENTS.md's "Critical patterns" for the full writeup (several endpoints used to return any family's data to any logged-in user). `role == "admin"` is the only sanctioned bypass; everything else needs `x.user_id == current_user.id`.

**PDF generation** — `weasyprint` requires system libs (`glib`, `pango`, `cairo`). `brew install weasyprint` needs interactive sudo; PDF endpoints will fail locally until installed.

## Demo credentials

`parent@demo.aa` / `demo1234` (created by seed script)
