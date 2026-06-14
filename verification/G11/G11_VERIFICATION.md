# G11 Long-Run Balance Tuning and Raw Run Seal

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`

## Goals

1. Commit RAW_RUNS.json as machine-readable raw evidence
2. Prove aggregates can be recomputed from raw runs
3. Tune balanced strategy to survive horizon 100 (was 0/8)
4. Preserve all strategic trade-offs

## Raw Run Evidence

| File | Entries | Coverage |
|---|---|---|
| `RAW_RUNS.json` | 128 | 8 seeds × 4 horizons × 4 strategies |
| `RAW_TO_AGGREGATE_RECOMPUTE.json` | 16 | All aggregate means match raw recomputation |

## Balanced Survival (horizon=100, 8 seeds)

| Metric | Before (G10) | After (G11) |
|---|---|---|
| Alive | 0/8 | **7/8** |
| Game-over rate | 100% | **13%** |
| Evidence integrity (mean) | 30.5 | **41.0** |
| Only failure | Bankruptcy (all seeds) | Evidence collapse (seed=3 only) |

## Hard Gates (horizon=100)

| Gate | Result |
|---|---|
| No strategy dominates all | PASS |
| Speed evidence < Balanced evidence | PASS (27.0 < 41.0) |
| Quality incidents ≤ Speed incidents | PASS (2.0 ≤ 2.5) |
| Parallel route spend > Speed spend | PASS ($3,875 > $0) |
| Game-over rate matches raw runs | PASS (63% = 63%) |
| Balanced survival measured | PASS (7/8 alive) |

## Trade-off Preservation

| Horizon | speedRiskHigher | qualityCleaner | parallelCostlier | balancedTrustBest | consistent |
|---|---|---|---|---|---|
| 30 | true | true | true | true | **true** |
| 60 | true | true | true | true | **true** |
| 100 | true | true | true | true | **true** |
| 200 | true | true | true | true | **true** |

All trade-offs consistent at ALL horizons — first time in project history.

## Tuning Changes

| Parameter | Before | After |
|---|---|---|
| Workshop maintenance total | 80/tick | 40/tick |
| Balanced minRewardRatio | 80 | 50 |
| Balanced upgradeWorkshops | true | false |
| Strategy upgrade cash threshold | 8000 | Not applicable (balanced disabled) |

## Verification Gate

| Check | Result |
|---|---|
| `npx tsc -b` | PASS |
| `npx vite build` | PASS |
| `npx vitest run` | PASS (23 files, 143 tests) |
| Raw run recomputation proof | PASS |
| Balanced survival ≥ 2/8 | PASS (7/8) |
| All trade-offs preserved | PASS |
| All 6 hard gates pass | PASS |

## Non-Claims

- Does NOT validate Runtime Lab
- Does NOT claim real multi-agent research capability
- Does NOT contain LLM/API/backend/network/shell
- Long-run balance is improved but not production-grade
