# AGENTS.md — Day One / Agent Academy

## What this repo is

AI-powered homeschool educational platform. FastAPI backend + React/TypeScript/Tailwind frontend. Concept doc: `Day One.eml` (do not modify).

## Do not modify

- `Day One.eml` — user-provided sample, read-only unless explicitly asked.

## Backend (`backend/`)

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload             # API on :8000
uv run pytest tests/ -v                          # 22 tests (4 files)
uv run pytest tests/test_auth.py -v              # single test file
uv run python -m app.seed                        # populate demo data
uv run ruff check app/                           # lint (line-length 100, py311)
uv run ruff format app/                          # format
```

**Module layout** — each module follows `models.py / schemas.py / service.py / router.py`. New routes go in `router.py`, mounted in `app/main.py`.

| Module | Purpose |
|--------|---------|
| `auth` | JWT auth, registration, login, role-based access |
| `users` | Families, students, parent-child grouping |
| `curriculum` | Subjects, concept graph (prerequisite DAG), lessons |
| `learning` | Lesson progress, quiz attempts, mastery calculation |
| `compliance` | NY homeschool compliance — IHIP, quarterly reports, assessments, hour tracking, PDF generation |
| `ai` | Model-agnostic AI tutor (OpenAI / Anthropic / Ollama) |
| `gamification` | Placeholder models for Phase 2 |

**Env**: copy `backend/.env.example` to `backend/.env`. Env vars use `AA_` prefix (`AA_DATABASE_URL`, `AA_SECRET_KEY`, `AA_AI_PROVIDER`).

**DB**: SQLite+aiosqlite for dev, PostgreSQL for production. Alembic configured but schema created via `Base.metadata.create_all` on startup. Tests use in-memory SQLite.

**PDF generation**: requires `weasyprint` system libs (glib, pango, cairo). `brew install weasyprint` needs interactive sudo — PDF endpoints fail locally until installed.

## Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev          # :5173, proxies /api → localhost:8000
npm run build        # tsc -b && vite build
npx vitest run       # 2 test files (jsdom environment)
```

Routes live in `src/App.tsx`. Parent dashboard under `/dashboard/` (default), teacher under same base with role-based routing.

## Critical patterns

- **UUID invariant**: models use `sqlalchemy.Uuid()` (not Postgres dialect). Service functions must convert string IDs to `uuid.UUID` before ORM queries. Response schemas use `uuid.UUID` for ID fields — FastAPI serializes to JSON strings automatically.
- **Async DB access**: all DB is async. Use `await` and `async with get_db()` consistently.
- **AI provider**: model-agnostic via `AA_AI_PROVIDER` env var. Don't hardcode provider logic outside `app/ai/`.
- **Tests**: function-scoped engine drops tables after each test. Each test sets up its own data via fixtures in `conftest.py`. Don't share state between tests.
- **Frontend proxy**: `vite.config.ts` proxies `/api` to `localhost:8000` — both servers must run simultaneously.
- **Ruff config**: `line-length = 100`, `target-version = "py311"`, selects `["E", "F", "I", "N", "W"]`.

## Phase directories

`phase-1/` through `phase-5/` contain planning docs and research, not runnable code.

## Demo credentials

`parent@demo.aa` / `demo1234` (seed script)
