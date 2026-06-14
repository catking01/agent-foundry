# G12 Explainability and Scenario Debugger

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`

## Goal

Make strategy outcomes explainable from raw runs, ledger events, artifacts,
and metric deltas. Trace WHY a specific seed/strategy combination failed.

## Explanation Output

Each `explainRun(seed, horizon, profile)` returns:

| Field | Description |
|---|---|
| `outcome` | "GAME OVER: reason" or "Active" |
| `cashBreakdown` | Salaries, maintenance, parallel routes, upgrades, revenue, net |
| `topNegativeEvents` | Top 20 events sorted by severity (high/medium/low) |
| `evidenceDrops` | Evidence integrity decreases with tick and reason |
| `reputationPenalties` | Reputation decreases with tick and reason |
| `bottlenecks` | Per-stage queue depths sorted by severity |
| `criticalArtifacts` | Top 10 artifacts with overclaim > 1, low quality, or failed validation/audit |

## Seed 3 Balanced Failure Trace

- **Game over**: Evidence integrity failure
- **Evidence drops**: 2 events
- **Negative events**: 10 (from ledger)
- **Top bottleneck**: planning

The trace provides full event-level detail: which ticks evidence dropped,
what caused reputation penalties, which artifacts had overclaim gaps,
and what the cost breakdown was.

## Cross-Strategy Attribution (seed=42, horizon=100)

| Strategy | Game Over | Evidence | Reputation | High Sev | Med Sev | Top Bottleneck |
|---|---|---|---|---|---|---|
| Speed First | Yes (evidence collapse) | 16 | 10.6 | 6 | 1 | planning |
| Quality First | Yes (bankruptcy) | 36 | 22.8 | 0 | 1 | engineering |
| Parallel Heavy | No | 27 | 25.2 | 2 | 2 | engineering |
| Balanced | Yes (bankruptcy) | 61 | 77.8 | 0 | 0 | engineering |

## Verification Gate

| Check | Result |
|---|---|
| `npx tsc -b` | PASS |
| `npx vite build` | PASS |
| `npx vitest run` | PASS (26 files, 162 tests) |
| explainRun deterministic | PASS |
| Seed 3 evidence collapse traced | PASS |
| Cash breakdown internally consistent | PASS |
| Bottlenecks sorted by severity | PASS |
| Events classified by severity | PASS |

## Non-Claims

- Does NOT validate Runtime Lab
- Does NOT claim real multi-agent research capability
- Does NOT contain LLM/API/backend/network/shell
- Explanation is deterministic but not exhaustive — future work can add artifact-level blame
