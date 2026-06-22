# Phase 3 — 3D Open World

## Goal

Transform the 2D dashboard into an explorable 3D world where subjects are regions. First two themes: Space Academy and Wizard Academy.

## Deliverables

- **3D World Engine** — Three.js / React Three Fiber scene with navigation
- **Space Academy** — star systems (math), research stations (science), ancient worlds (history), archives (literature), digital sector (CS)
- **Wizard Academy** — spellcraft (spelling), arcane calculations (math), alchemy (science), ancient kingdoms (history), rune engineering (programming)
- **Region transitions** — entering a region loads the subject's lesson/activity interface
- **Low-end fallback** — graceful degradation for Chromebooks/tablets

## Prerequisites

- Phase 1 & 2 (dashboards, AI tutor, gamification)
- Phase 1 concept graph maps subjects to regions in world config

## Research agenda

- [ ] React Three Fiber performance on low-end hardware (Chrome on 4GB RAM)
- [ ] LOD (level of detail) strategies for educational 3D scenes
- [ ] Asset pipeline — Blender → glTF optimization for web
- [ ] Region/level design patterns for educational 3D worlds
- [ ] Cel-shaded / low-poly art style to keep asset size small
- [ ] Progressive loading — load region assets on demand, not all at once
- [ ] Mobile touch controls for 3D navigation

## Key design constraint

- Must run on low-end PCs, Chromebooks, tablets, and phones (from concept doc)

## Verification

- World loads and renders at 30+ fps on a 4GB Chromebook
- Student can walk between regions in Space Academy
- Entering a region opens the correct subject's lesson interface
- Wizard Academy theme swaps without code changes (config-driven)
- All 10 subject regions across both themes accessible
