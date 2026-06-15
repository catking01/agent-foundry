# G19 Agent Work Status Floating HUD

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`
- **Target commit**: `5efb7ed`

## Goal

Provide real-time operational awareness of AI agent work status during gameplay
via a global floating HUD that is always visible on all tabs.

## Features

| Feature | Description |
|---|---|
| Collapsed bar | Working/idle/blocked counts at a glance |
| Expanded panel | Overview, per-agent cards, workshop queues, recent ledger events |
| Agent cards | Name, status, current task, workshop, stage, remaining work, fatigue |
| Workshop queues | Active/queued counts per stage with load bars |
| Recent events | Last 8 ledger events with tick, type, target |
| Global visibility | Fixed bottom-right, visible on all tabs |
| Read-only | No dispatch, no mutation, no Ollama |

## Implementation

| File | Purpose |
|---|---|
| `src/game/agentStatusSelectors.ts` | Derives agent work status from GameState |
| `src/ui/AgentWorkStatusFloat.tsx` | Floating HUD component |
| `src/App.tsx` | Global integration |

## Boundaries

| Boundary | Status |
|---|---|
| No GameState mutation | ✅ Selectors only |
| No PlayerAction dispatch | ✅ No onDispatch prop |
| No Ollama calls | ✅ Pure data derivation |
| No replay hash impact | ✅ |
| No browser Ollama | ✅ |

## Verification

| Check | Result |
|---|---|
| `npx tsc -b` | PASS |
| `npx vite build` | PASS (635 modules) |
| `npx vitest run` | PASS (38 files, 235 tests, 12 skipped) |

## Non-Claims

- Does NOT show real AI employee status
- Does NOT control or dispatch agent actions
- Does NOT call Ollama or any LLM
- Does NOT validate Runtime Lab
