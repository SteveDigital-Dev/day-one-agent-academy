# Phase 4 — Multiplayer

## Goal

Add real-time collaborative features: study groups, shared worlds, and collaborative challenges.

## Deliverables

- **Study Groups** — students can form groups, share notes, study together in real time
- **Shared Worlds** — multiple students in the same 3D world instance, visible avatars
- **Collaborative Challenges** — group puzzles/problems that require teamwork
- **Chat / Communication** — text chat in study groups, voice mode future

## Prerequisites

- Phase 3 (3D world engine with region system)

## Research agenda

- [ ] WebSocket architecture — FastAPI native WebSockets vs Socket.IO vs WebRTC
- [ ] State synchronization — authoritative server vs CRDT for shared world state
- [ ] Scalability — how many students per world instance before degradation
- [ ] Moderation — text filtering, reporting, parent supervision controls
- [ ] Multiplayer puzzle design — collaborative math/science challenges
- [ ] WebRTC for voice (future voice mode requirement)

## Verification

- Two students can join same study group and see each other's avatars
- Real-time chat works with <200ms latency
- Collaborative challenge completes correctly when both students contribute
- Parent dashboard shows who student interacted with
- Group creation and invitation flow works
