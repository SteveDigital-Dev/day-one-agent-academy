# AGENTS.md — Day One / Agent Academy

## What this repo is

AI-powered homeschool educational platform. FastAPI backend + React/TypeScript/Tailwind frontend. Concept doc: `Day One.eml` (do not modify).

## Do not modify

- `Day One.eml` — user-provided sample, read-only unless explicitly asked.

## Backend (`backend/`)

```bash
cd backend
uv sync --all-extras                             # core deps + dev group (pytest, ruff)
uv run uvicorn app.main:app --port 8001 --reload # API on :8001
uv run pytest tests/ -v                          # 38 tests (6 files)
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
| `ai` | Model-agnostic AI tutor + `GET /api/ai/lesson/{id}/quiz` for structured quiz generation |
| `gamification` | DB models (XP events, achievements) — frontend gamification lives in `src/context/GameContext.tsx` |

**Env**: copy `backend/.env.example` to `backend/.env`. Env vars use `AA_` prefix (`AA_DATABASE_URL`, `AA_SECRET_KEY`, `AA_AI_PROVIDER`, `AA_CORS_ORIGINS`).

**`AA_SECRET_KEY` is enforced, not just documented** — `app/config.py` raises `RuntimeError` at import time if `secret_key` is still one of the known placeholder values (`change-me-in-production` or the `.env.example` one) *and* `AA_DEBUG` is not `true`. `secret_key` signs every JWT; either placeholder is public (one's the class default, the other's committed in `.env.example`), so leaving it in place outside local dev means anyone can forge a token for any user id. Generate a real one with `python -c "import secrets; print(secrets.token_urlsafe(32))"`.

**`AA_CORS_ORIGINS`** — comma-separated allowed frontend origins, default `http://localhost:5173` (the documented Vite dev port). Was `allow_origins=["*"]` + `allow_credentials=True`, the specific combination CORS docs warn against (browsers handle it by reflecting the request's Origin back rather than actually restricting anything). Override for any real deployment.

**Rate limiting** — `POST /api/auth/login` (10/min) and `/register` (5/min) are limited via `slowapi`, keyed by remote address (`app/rate_limit.py`). `tests/conftest.py` disables the limiter globally (`limiter.enabled = False`) because several fixtures log in fresh per test and would otherwise trip it; `test_login_is_rate_limited` in `test_auth.py` re-enables it just for that one test.

**DB**: SQLite+aiosqlite for dev, PostgreSQL for production. Alembic configured but schema created via `Base.metadata.create_all` on startup. Tests use in-memory SQLite.

**PDF generation**: requires `weasyprint` system libs (glib, pango, cairo). `brew install weasyprint` needs interactive sudo — PDF endpoints fail locally until installed.

## Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev          # :5173, proxies /api → localhost:8001
npm run build        # tsc -b && vite build
npx vitest run       # frontend tests (jsdom environment)
```

Routes live in `src/App.tsx`. Parent dashboard under `/dashboard/` (default), teacher under same base with role-based routing.

**Gamification layer** — `src/context/GameContext.tsx` holds XP/level/streak/achievements in localStorage. `src/components/gamification/` contains: `GameEngine` (quiz/match/sort/fill question runner), `XPBar`, `ProgressRing`, `AchievementToast`, `StreakFlame`, `SkillTree`, `ScreenJuice` (XPFloat/ScreenFlash/LevelUpOverlay), `Particles`, `SoundToggle`. Dependencies: `framer-motion`, `react-markdown`, `@tsparticles/react`.

**Key pages**:
- `LessonViewer` — renders lesson markdown, fetches AI quiz via `GET /api/ai/lesson/{id}/quiz` on Play mode entry, falls back to static generation
- `SkillTreePage` — concept mastery visualization per subject
- `ParentCurriculum` — three-panel browser (Subject → Concept → Lesson) with inline content preview and progress status

## Critical patterns

- **UUID invariant**: models use `sqlalchemy.Uuid()` (not Postgres dialect). Service functions must convert string IDs to `uuid.UUID` before ORM queries. Response schemas use `uuid.UUID` for ID fields — FastAPI serializes to JSON strings automatically.
- **Async DB access**: all DB is async. Use `await` and `async with get_db()` consistently.
- **AI provider**: model-agnostic via `AA_AI_PROVIDER` env var. Don't hardcode provider logic outside `app/ai/`.
- **Tests**: function-scoped engine drops tables after each test. Each test sets up its own data via fixtures in `conftest.py`. Don't share state between tests.
- **Frontend proxy**: `vite.config.ts` proxies `/api` to `localhost:8001` — both servers must run simultaneously.
- **Ruff config**: `line-length = 100`, `target-version = "py311"`, selects `["E", "F", "I", "N", "W"]`.
- **Every endpoint taking a client-supplied id must check ownership, not just existence.** `users`, `compliance`, and `learning` routers all had endpoints that fetched a `student_id`/`family_id`/`doc_id` and returned real data (including NY compliance/IHIP records) for *any* authenticated user, not just the owner — fixed, but the pattern is easy to reintroduce on a new endpoint. The rule: after `get_x_by_id`, a non-admin caller must additionally satisfy `x.user_id == current_user.id` (or, for family-scoped resources, own a student with that `family_id` — see `_owns_family` in `users/router.py`) before the data goes back in the response. `compliance/router.py`'s `_resolve_student`/`_resolve_owned_document` and `learning/router.py`'s `_resolve_student` are the reference implementations. `role == "admin"` is the only sanctioned bypass.
- **Self-registration cannot set its own role.** `auth/schemas.py`'s `RegisterRequest.role` is `Literal["parent"]` — do not widen this without a real authorization check in front of it. It used to accept any string, so anyone could `POST /register` with `role: "admin"` and hit the admin bypass above directly.

## Lesson content

36 markdown files at `lessons/{subject}/unit-{n}-lesson-{n}.md` (subjects: `mathematics`, `english-language-arts`, `science`; units 1–3, lessons 1–4 each). The seed script loads these via `load_lesson_content()` and calls `extract_lesson_title()` to pull the `# Heading` as the DB title. Adding or editing a markdown file takes effect on next reseed.

## AI quiz generation

`GET /api/ai/lesson/{lesson_id}/quiz?count=5&grade_level=6` — returns `{"questions": [GameQuestion, ...]}`.

Implementation in `app/ai/service.py::generate_lesson_quiz`:
1. Sends lesson content (first 1500 chars) to the LLM with an **assistant prefill** of `[` so the model is forced to start with JSON
2. Passes `think=False` to the Ollama provider to prevent qwen3's reasoning budget from blocking output
3. Extracts the first complete `[…]` array via bracket-counting (model chatter after the closing `]` is discarded)
4. Returns up to `count` `GameQuestion`-shaped dicts

## Phase directories

`phase-1/` through `phase-5/` contain planning docs and research, not runnable code.

## Demo credentials

`parent@demo.aa` / `demo1234` (seed script)
