# Phase 2 — Gamification

## Goal

Layer engagement mechanics onto the Phase 1 MVP: avatars, companions, rivals, and achievements to drive retention and motivation.

## Deliverables

- **Avatar System** — character creation (appearance, specialization), unlockable cosmetics/titles/badges
- **Companion System** — AI teammate that explains concepts, gives hints, encourages, adapts to personality
- **Rival System** — optional AI-driven rival that advances alongside the student (never punitive)
- **Achievement Engine** — badge and title unlocks tied to learning milestones

## Prerequisites

- Phase 1 MVP (student/parent dashboards, AI tutor, concept graph)

## Research agenda

- [ ] Avatar generation — simple composable SVGs vs Three.js avatars vs Stable Diffusion portraits
- [ ] Companion AI personality modeling — adjust tone/hints based on student frustration signals
- [ ] Gamification psychology — badge fatigue, optimal reward schedules, intrinsic vs extrinsic motivation
- [ ] Rival progression algorithm — keep rival slightly ahead or at same pace
- [ ] Cosmetics/title data model — unlock conditions, rarity tiers, display logic

## Key design constraints

- **No pay-to-win** — all cosmetics earned through learning milestones
- **Educational first** — game mechanics serve learning outcomes, not the reverse
- **Rival never punitive** — no penalties, only motivation

## Verification

- Student can create and customize avatar
- Companion offers hints that adapt to quiz performance
- Rival visible on dashboard, advances with student progress
- Achievements unlock at defined milestones and display correctly
- Cosmetics system has zero monetization paths
