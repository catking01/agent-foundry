# G20 Playable UX Onboarding

## Goal

Make the first 5 minutes playable and understandable for a new player
by introducing a guided 7-step tutorial checklist.

## Implementation

| File | Purpose |
|---|---|
| `src/ui/TutorialChecklist.tsx` | 7-step tutorial with progress tracking |
| `src/App.tsx` | Tutorial integration + dismissal state |

## Tutorial Steps

1. Accept your first order
2. Watch agents start working (Agent HUD)
3. An artifact is produced
4. Validation runs on the artifact
5. Audit reviews the artifact
6. Deliver your first order
7. Check the Agent HUD

Each step has a GameState-derived completion check and a hint
for the player when incomplete.

## Boundaries

| Check | Result |
|---|---|
| No GameState mutation | ✅ |
| No PlayerAction dispatch | ✅ |
| No Ollama calls | ✅ |
| No replay hash impact | ✅ |
| localStorage: dismissal only | ✅ |

## Verification

39 test files, 250 tests, 636-module build.
