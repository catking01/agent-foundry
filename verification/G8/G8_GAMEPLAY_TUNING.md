# G8 Gameplay Tuning and Decision Pressure

## Repository

- **Remote**: https://github.com/catking01/agent-factory
- **Branch**: `main`
- **Target**: G8 verification

## Goal

Prove that Agent Foundry creates meaningful management decision pressure —
different organizational strategies produce significantly different outcomes.

## Strategy Profiles

Four strategies tested, each with different parameters:

| Strategy | Accept Rule | Routes | Validation | Audit | Min Quality | Require Audit |
|---|---|---|---|---|---|---|
| Speed First | All orders | Single | No | No | 3 | No |
| Quality First | Max C=8, R=5 | Single | Yes | Yes | 6 | Yes |
| Parallel Heavy | All, min ratio 100 | 1-3 by complexity | Yes | Yes | 5 | Yes |
| Balanced | Max C=9, R=7, min ratio 80 | 1-2 by complexity | Yes | Yes | 5 | Yes |

## Strategy Comparison Results (seed=42, horizon=100)

| Metric | Speed First | Quality First | Parallel Heavy | Balanced |
|---|---|---|---|---|
| Orders Completed | 6 | 7 | 3 | 3 |
| Cash End | $39,108 | -$5,015 | $8,711 | -$5,292 |
| Reputation | 10.6 | 22.8 | 25.2 | 77.8 |
| Evidence Integrity | 16 | 36 | 27 | 67 |
| Avg Quality | 3.6 | 3.7 | 3.8 | 3.9 |
| Major Incidents | 3 | 1 | 3 | 0 |
| Overclaim Findings | 14 | 3 | 11 | 0 |
| Validation Failures | 9 | 12 | 12 | 8 |
| Audit Failures | 30 | 10 | 16 | 6 |
| Missed Deadlines | 0 | 0 | 6 | 3 |
| Parallel Route Spend | $0 | $0 | $4,400 | $800 |
| Game Over | Yes (evidence collapse) | Yes (bankruptcy) | No | Yes (bankruptcy) |

## Key Findings

### 1. Different strategies produce significantly different outcomes
Each strategy has a distinct profile across all key metrics.
No two strategies produce the same cash/reputation/evidence/quality vector.

### 2. Speed-first has highest risk
- 14 overclaim findings, 30 audit failures, evidence integrity collapses to 16
- Dies from evidence integrity failure, not bankruptcy
- Makes the most money ($39k cash) but destroys trust

### 3. Quality-first has lower risk, higher cost
- Only 3 overclaims, 1 incident
- But high validation/audit costs lead to bankruptcy
- Most orders completed (7) but can't sustain financially

### 4. Parallel-heavy has highest operational cost
- $4,400 in parallel route spending, $33k total costs
- Engineering bottleneck with queue depth 20
- Survives financially but has worst missed-deadline rate (6)

### 5. Balanced has best trust metrics
- Reputation 77.8, evidence integrity 67 — both best in class
- Zero overclaims, zero incidents
- But costs still exceed revenue over 100 ticks

### 6. No strategy is strictly dominant
- Speed: best cash, worst trust
- Quality: best throughput, financial pressure
- Parallel: survives, worst deadlines
- Balanced: best trust, financial pressure

## Conclusion

G8 demonstrates that Agent Foundry creates genuine strategic trade-offs.
The four strategies produce measurably different outcomes, and no single
strategy dominates all dimensions. Players face real decisions between
speed, quality, cost, and trust.

## Non-Claims

- Does NOT validate Runtime Lab
- Does NOT claim real multi-agent research capability
- Does NOT contain LLM/API/backend/network/shell integration
- Economy may need further tuning for extended play sessions
