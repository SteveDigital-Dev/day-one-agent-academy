# AGENTS.md — Day One / Agent Academy

## What this repo is

An AI-powered educational platform (**Agent Academy**) with a FastAPI backend and React frontend. The concept document lives in `Day One.eml`.

## Do not modify

- `Day One.eml` is a user-provided sample. Do not edit or overwrite it unless explicitly asked.

## Current state

- FastAPI backend at `backend/` with 7 modules (auth, users, curriculum, learning, compliance, ai, gamification).
- React/TypeScript/Tailwind frontend at `frontend/` with parent and teacher dashboards.
- Seed script populates demo data: 4 students (G3–G11), 17 subjects, 51 concepts, 204 lessons, 1392 hour logs, compliance documents.
- 22 backend tests pass, 10 frontend tests pass, TypeScript compiles clean.
- Not a git repository (no history).

## Key architectural decisions

- **SQLite+aiosqlite** for dev (zero-config), PostgreSQL for production.
- Models use `sqlalchemy.Uuid()` (cross-database compatible) instead of `sqlalchemy.dialects.postgresql.UUID`.
- Pydantic response schemas use `uuid.UUID` for ID fields (ORM returns UUID objects; Pydantic serializes to string in JSON).
- Service functions convert string UUIDs to `uuid.UUID` before passing to SQLAlchemy queries.
- AI provider is model-agnostic via `AA_AI_PROVIDER` env var (default: `ollama`).

## Backend

Run with:

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload     # API server
uv run pytest tests/ -v                  # run tests (22 tests)
uv run python -m app.seed                # populate demo data
```

### Module layout

| Module | Path | Purpose |
|--------|------|---------|
| `auth` | `app/auth/` | JWT auth, registration, login, role-based access |
| `users` | `app/users/` | Families, students, parent-child grouping |
| `curriculum` | `app/curriculum/` | Subjects, concept graph (with prerequisites DAG), lessons |
| `learning` | `app/learning/` | Lesson progress, quiz attempts, mastery calculation |
| `compliance` | `app/compliance/` | NY homeschool compliance engine — IHIP, quarterly reports, annual assessments, hour tracking, PDF generation |
| `ai` | `app/ai/` | Model-agnostic AI tutor (OpenAI / Anthropic / Ollama) |
| `gamification` | `app/gamification/` | Placeholder models for Phase 2 (avatars, achievements) |

### API endpoints (prefix `/api`)

- `GET /health` — health check
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `POST /users/families`, `GET /users/families/{id}`, `GET /users/families/{id}/students`
- `POST /users/students`, `GET /users/students`, `GET /users/students/{id}`
- `GET /curriculum/subjects`, `GET /curriculum/subjects/{id}/concepts`, `POST /curriculum/concepts`
- `GET /curriculum/concepts/{id}/path` — prerequisite breadcrumb path
- `GET /curriculum/concepts/{id}/lessons`, `POST /curriculum/lessons`
- `PUT /learning/progress/{lesson_id}`, `GET /learning/progress`
- `POST /learning/quizzes`, `GET /learning/quizzes`, `GET /learning/mastery/{concept_id}`
- `POST /compliance/hours`, `GET /compliance/hours/summary`
- `POST /compliance/ihip`, `GET /compliance/ihip`, `POST /compliance/ihip/{id}/submit`, `POST /compliance/ihip/{id}/generate`
- `POST /compliance/quarterly-reports`, `GET /compliance/quarterly-reports`
- `POST /compliance/assessments`, `GET /compliance/assessments`
- `GET /compliance/status` — compliance dashboard
- `POST /ai/tutor/chat`, `POST /ai/tutor/quiz`, `POST /ai/tutor/explain`, `GET /ai/provider`

### Seed data

Demo login: `parent@demo.aa` / `demo1234`

| Student | Grade | Subjects | Concepts | Lessons | Hour Logs |
|---------|-------|----------|----------|---------|-----------|
| Ethan   | 3     | 17       | 51       | 204     | ~348      |
| Maya    | 6     | 17       | 51       | 204     | ~348      |
| Liam    | 8     | 17       | 51       | 204     | ~348      |
| Zara    | 11    | 17       | 51       | 204     | ~348      |

Plus 484 lesson progress entries, 87 quiz attempts, 20 compliance docs, 4 annual assessments.

## Frontend

```bash
cd frontend
npm install
npm run dev          # dev server with /api proxy to localhost:8000
npm run build        # production build
npx vitest run       # frontend tests (10 tests)
```

### Pages

- **Parent Dashboard** — `/parent/` — overview, students list, compliance status
- **Teacher Dashboard** — `/teacher/` — overview, student management, analytics

## Phase directories

| Phase | Focus |
|-------|-------|
| `phase-1/` | NY Homeschool MVP — dashboards, compliance, AI tutor |
| `phase-2/` | Gamification — avatars, achievements, streaks |
| `phase-3/` | Multi-tenancy, districts, teacher network |
| `phase-4/` | Mobile, offline, real-time sync |
| `phase-5/` | Scaling, enterprise, marketplace |

## Critical Context

- Response schemas use `uuid.UUID` for ID fields — FastAPI serializes these to strings in JSON automatically.
- Service layer converts all string UUIDs to `uuid.UUID` before ORM queries/inserts (required by SQLite's `Uuid` type).
- Engine fixture is function-scoped (drops all tables after each test) — prevents UNIQUE constraint violations between tests.
- Frontend `vite.config.ts` proxies `/api` to `localhost:8000` — both servers must run simultaneously.
- WeasyPrint system libs (glib, pango, cairo) not yet installed — PDF generation via `brew install` requires interactive sudo.

## Adding files

Use action-oriented kebab-case names (e.g. `parse-email.py`). Place sample emails under `assets/emails/`. Keep the root directory clean.
