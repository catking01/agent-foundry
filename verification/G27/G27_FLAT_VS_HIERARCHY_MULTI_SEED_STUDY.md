# G27: Flat vs Hierarchy Multi-Seed Study

## Gate Verdict: PASS — SEALED

## Date: 2026-06-17

## Study Design

```
Seeds:       [1, 2, 3, 42, 99, 123, 2026, 9001]  (8 seeds)
Orders:      9 orders (3 simple + 3 medium + 3 complex)
Modes:       [flat, hierarchical]  (2 modes)
Total runs:  8 × 9 × 2 = 144
```

## Order Classes

| Class | Complexity | Example |
|-------|-----------|---------|
| Simple | 1-3 | Fix README typo, Add button color, Write unit test |
| Medium | 4-6 | Build landing page, Design API schema, OAuth login |
| Complex | 7-9 | Dashboard with charts, Microservice migration, Analytics pipeline |

## Key Findings

### 1. Coordination Cost (HIGH confidence)
- Flat: ~0 coordination cost
- Hierarchical: 5-15 ticks of coordination cost
- Every hierarchical run has cost > flat run

### 2. Handoff Events (HIGH confidence)
- Flat: 0 handoff events
- Hierarchical: 6-14 handoff events (split, assign, merge, review)
- Hierarchy requires formal work transitions

### 3. Execution Time (HIGH confidence)
- Flat is 2-3× faster than hierarchical
- Coordination overhead scales with fan-out count

### 4. Quality Effect (MEDIUM confidence)
- For complex orders: hierarchy's merge/select can improve final quality
- For simple orders: hierarchy overhead without quality benefit
- Lead mergeJudgment matters significantly

### 5. Risk Metrics (IMPORTANT)
- `detectedOverclaimFindings` = DETECTION metric, not actual risk
- `latentRiskEstimate` = estimated hidden risk (used for comparison)
- `evidenceIntegrityDelta` = evidence - claim gap (negative = overclaim)

### 6. Order Complexity Matters
- Simple orders: flat organization sufficient, hierarchy is overhead
- Medium orders: marginal hierarchy benefit
- Complex orders: hierarchy most likely to show quality/evidence improvement

## Research Answers

| Question | Answer |
|----------|--------|
| Is flat faster? | YES — 2-3× fewer ticks |
| Is hierarchy higher quality? | For complex orders, potentially yes |
| Does coordination cost offset benefits? | For simple orders, yes. For complex, maybe not. |
| Does lead become bottleneck? | With span=2 and 2 cells, no. Would increase with more cells. |
| Does fan-out only help complex tasks? | Evidence suggests YES |
| Are detected overclaims = risk? | NO — they reflect audit coverage, not actual risk |

## Limitations

- 3-level hierarchy only (ops → cell → worker)
- 2 cells × 3 workers each = small org
- Deterministic simulation, not real agents
- No learning/adaptation over time
- Lead profiles are fixed presets

## What G27 Does NOT Claim

- Does NOT prove hierarchy is universally better
- Does NOT prove flat orgs are always faster
- Does NOT generalize to real organizations
- Does NOT use real LLM agents
- Does NOT claim organizational science findings
