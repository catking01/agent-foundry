# G27 Seal Verdict

## Verdict

```text
G27-S1 artifact generation: PASS
G27 machine-readable evidence seal: PASS
G27 sealed milestone: PASS, scoped to deterministic simulation evidence
```

## Required Evidence

- `ORG_MULTI_SEED_MATRIX.json`
- `FLAT_VS_HIERARCHY_AGGREGATES.json`
- `ORDER_COMPLEXITY_BREAKDOWN.json`
- `COORDINATION_COST_CURVE.json`
- `AGGREGATE_RECOMPUTE_CHECK.json`
- `TEST_OUTPUT.txt`
- `BUILD_OUTPUT.txt`

## Validation Evidence

```text
npm run test: PASS
Test Files: 46 passed (46)
Tests: 375 passed | 12 skipped (387)

npx tsc -b: PASS

npx vite build --base=/agent-factory/: PASS
Build warning: chunk size over 500 kB after minification

AGGREGATE_RECOMPUTE_CHECK.json: PASS
Raw matrix runs: 144
```

## Non-Claims

G27-S1 does not claim hierarchy is better than flat, does not generalize to real organizations, does not use real LLM agents, and does not replace the main gameplay pipeline.
