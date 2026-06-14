# G10 Machine-Readable Balance Evidence

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`

## Goal

Turn G9 multi-seed balance from Markdown-level evidence into machine-readable,
replayable, auditable JSON artifacts with hard regression gates.

## JSON Artifacts

| File | Contents | Entries |
|---|---|---|
| `MULTI_SEED_STRATEGY_MATRIX.json` | Aggregate means + std per strategy/horizon | 16 |
| `HORIZON_COMPARISON.json` | Per-metric evolution across horizons | 16 |
| `DOMINANCE_REPORT.json` | Pareto dominance analysis per horizon | 4 |
| `TRADEOFF_CONSISTENCY.json` | Expected trade-off verification per horizon | 4 |

## Hard Gates (horizon=100, 8 seeds)

| Gate | Result | Detail |
|---|---|---|
| No strategy dominates all | PASS | No strategy is dominated by all others |
| Speed evidence < Balanced evidence | PASS | Balanced 30.5 vs Speed 27.0 |
| Quality incidents ≤ Speed incidents | PASS | Quality 2.0 vs Speed 2.5 |
| Parallel route spend > Speed | PASS | Parallel $3,875 vs Speed $0 |
| Game-over rate matches raw runs | PASS | Computed 63% = Aggregate 63% |
| Balanced survival measured | PASS | 0/8 alive at horizon 100 |

## Verification Gate

| Check | Result |
|---|---|
| `npx tsc -b` | PASS |
| `npx vite build` | PASS |
| `npx vitest run` | PASS (20 files, 124 tests) |
| JSON re-serialization round-trip | PASS |
| Aggregate means match raw recomputation | PASS |
| All hard gates pass | PASS (6/6) |

## Non-Claims

- Does NOT validate Runtime Lab
- Does NOT claim real multi-agent research capability
- Does NOT contain LLM/API/backend/network/shell
- Balanced survival at horizon 100 is 0/8 — economy still needs long-run tuning
