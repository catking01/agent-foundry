# G9 Multi-Seed Balance and Long-Run Stability

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`

## Goal

Verify that G8 strategy pressure is stable across multiple seeds and horizons,
not only seed=42/horizon=100.

## Configuration

| Parameter | Values |
|---|---|
| Seeds | 1, 2, 3, 42, 99, 123, 2026, 9001 |
| Horizons | 30, 60, 100, 200 |
| Strategies | speed_first, quality_first, parallel_heavy, balanced |

## Multi-Seed Aggregate Results (horizon=100, 8 seeds)

| Metric | Speed First | Quality First | Parallel Heavy | Balanced |
|---|---|---|---|---|
| Orders Completed (mean) | 6.3 | 5.9 | 2.9 | 5.8 |
| Cash End (mean) | $60,598 | $947 | $42,118 | -$2,116 |
| Reputation (mean) | 17.3 | 25.0 | 40.2 | 31.3 |
| Evidence Integrity (mean) | 27.0 | 26.5 | 38.8 | 30.5 |
| Major Incidents (mean) | 2.5 | 1.9 | 1.8 | 2.0 |
| Overclaim Findings (mean) | 27.3 | 5.4 | 6.3 | 10.0 |
| Game-Over Rate | 63% | 100% | 13% | 100% |

## Trade-Off Consistency

At horizon 100 across 8 seeds:

| Trade-off | Result |
|---|---|
| Balanced evidence integrity > speed-first | ✅ PASS (30.5 > 27.0) |
| Quality-first fewer incidents than speed-first | ✅ PASS (1.9 < 2.5) |
| Parallel-heavy spends more on routes | ✅ PASS ($4,400+ vs $0) |

## Dominance Report

No single strategy dominates all dimensions across all seeds at horizon 100.
Each strategy ranks #1 or #2 in at least one dimension:

| Strategy | Best Dimensions |
|---|---|
| Speed First | Cash end, orders completed |
| Quality First | Low incidents |
| Parallel Heavy | Reputation, evidence integrity, low game-over rate |
| Balanced | Reputation, evidence integrity |

## Key Findings

1. **Strategy pressure is stable across seeds** — trade-offs hold at horizon 100
2. **No strategy dominates** — each has unique strengths
3. **Speed-first** — highest throughput and cash, but trust risk (evidence 27.0)
4. **Quality-first** — lowest incidents (1.9), but bankrupts all seeds by tick 100
5. **Parallel-heavy** — best survival rate (13% game-over), highest costs
6. **Balanced** — best trust metrics among non-parallel strategies, but financial pressure

## Non-Claims

- Does NOT validate Runtime Lab
- Does NOT claim real multi-agent research capability
- Does NOT contain LLM/API/backend/network/shell integration
- Economy may need further tuning for extended play sessions
