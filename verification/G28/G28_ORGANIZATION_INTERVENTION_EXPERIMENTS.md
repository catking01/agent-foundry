# G28: Organization Intervention Experiments

## Study Design

```text
Baseline:      G27-S1 hierarchical deterministic simulation
Seeds:         8
Order classes: simple, medium, complex
Orders:        1 representative order per class
Interventions: 6
Total runs:    144
```

## Interventions

- `baseline_hierarchical`: Unmodified G27 hierarchical scenario runner output.
- `merge_plus`: Deterministically models stronger lead merge/select judgment.
- `handoff_plus`: Deterministically models clearer handoffs and summaries.
- `span_control_tight`: Deterministically models narrower lead attention and stricter review.
- `extra_worker`: Deterministically models one additional worker assigned to the order.
- `audit_coverage_plus`: Deterministically models stronger audit coverage without using Ollama.

## Matrix Shape

```text
8 seeds x 3 representative orders x 6 interventions = 144 runs
```

## Required Evidence

- `ORG_INTERVENTION_MATRIX.json`
- `INTERVENTION_AGGREGATES.json`
- `INTERVENTION_DELTA_REPORT.json`
- `INTERVENTION_BY_ORDER_COMPLEXITY.json`
- `INTERVENTION_RANKING.json`
- `INTERVENTION_RISK_SEMANTICS.md`
- `INTERVENTION_FINDINGS.md`
- `NON_CLAIMS.md`
- `TEST_OUTPUT.txt`
- `BUILD_OUTPUT.txt`

## Current Artifact Verdict

```text
delta recompute report: PASS
machine-readable artifacts: generated
validation status: PASS
```

## Validation Evidence

```text
npm run test: PASS
Test Files: 47 passed (47)
Tests: 389 passed | 12 skipped (401)

npx tsc -b: PASS

npx vite build --base=/agent-factory/: PASS
Build warning: chunk size over 500 kB after minification

G28 source-only Ollama/network scan: PASS
```
