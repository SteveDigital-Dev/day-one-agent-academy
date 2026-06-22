# Phase 1 — New York Homeschool MVP

## Goal

Ship a working MVP for homeschool families in New York: parent dashboard, student dashboard, AI tutor, and NY compliance tracking.

## Deliverables

- **Parent Dashboard** — progress tracking, grades, lesson completion, mastery scores
- **Student Dashboard** — personalized learning path, lesson interface, quiz/assessment UI
- **AI Tutor** — conversational tutoring, Socratic questioning, adaptive review
- **Compliance Engine** — IHIP, quarterly reports, annual report generation (NY first)
- **Concept Graph** — subject → topic graph with prerequisite tracking

## Tech decisions for this phase

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend framework | React + TypeScript + Tailwind | MVP speed, broad ecosystem |
| Backend | FastAPI (Python) | Async, auto-docs, model serving |
| Primary DB | PostgreSQL | Users, lessons, progress, achievements |
| Vector DB | Qdrant | Concept embeddings, semantic search |
| AI | Model-agnostic wrapper (OpenAI/Anthropic/Ollama) | Start cloud, enable local later |
| Auth | JWT + OAuth2 (FastAPI built-in) | Simple, standard |

## Research agenda

- [ ] NY homeschool compliance requirements: IHIP format, quarterly/annual reporting specs, hour tracking rules
- [ ] CK-12 / OER Commons content licensing and API access
- [ ] AI tutoring prompt patterns — Socratic questioning, mastery-based review loops
- [ ] Concept graph construction — prerequisite mapping, dependency resolution algorithms
- [ ] React dashboard component libraries (shadcn/ui, Headless UI, Radix)
- [ ] Qdrant self-hosting vs cloud pricing for MVP scale
- [ ] FastAPI project structure conventions (repositories, services, routers)

## Build order

1. Scaffold FastAPI project, PostgreSQL schema, auth
2. Build concept graph data model and seeding scripts
3. Implement AI tutor endpoint (stateless Q&A first)
4. Build student dashboard (lesson viewer, quiz UI)
5. Build parent dashboard (progress, compliance reports)
6. Implement compliance engine (IHIP/report generation)
7. Polish, deploy, pilot with homeschool group

## Verification

- Parent can register, add student, see progress
- Student can complete a lesson and take a quiz
- AI tutor answers subject questions coherently
- Compliance engine generates valid IHIP document
- Runs on Chromebook in browser
