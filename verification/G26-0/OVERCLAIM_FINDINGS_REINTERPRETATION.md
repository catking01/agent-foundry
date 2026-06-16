# G26-0 Overclaim Findings Reinterpretation

## Date: 2026-06-16

## Discovery (G25-S1)

During G25-S1 regression reconciliation, two strategy tests were found to have incorrect assertions about `overclaimFindings`. Investigation revealed:

```
overclaimFindings counts AUDIT events where reason includes "Overclaim".
It is a DETECTION metric, not an ACTUAL risk metric.
```

## Semantic Clarification

### What overclaimFindings ACTUALLY measures

```ts
// src/sim/scenarioRunner.ts:125-127
if (event.details.reason && String(event.details.reason).includes('Overclaim')) {
  overclaimFindings++
}
```

Conditions for counting:
1. An `AUDIT_COMPLETED` ledger event must fire
2. The audit reason must contain "Overclaim"

Implications:
- **No audit → no count** (even if overclaims exist)
- **More audit → more potential counts**
- **Quality-first audits more → higher overclaimFindings**
- **Speed-first skips audit → lower overclaimFindings (but higher real risk)**

### Correct Risk Indicators

| Metric | What It Means | Use For |
|--------|--------------|---------|
| `overclaimFindings` | Detected overclaims (depends on audit coverage) | Audit effectiveness |
| `evidenceIntegrityEnd` | Actual evidence degradation (undetected + detected) | True risk |
| `reputationEnd` | Client trust after all deliveries | Outcome quality |
| `auditCoverageRate` | Fraction of artifacts audited | Detection completeness |
| `undetectedOverclaimExposure` | Estimated latent risk | Research heuristic |

## Test Fixes Applied (G25-S1)

### Test 1: `longRunBalanceTuning.test.ts`
- **Old**: `speed.overclaimFindings > quality.overclaimFindings`
- **New**: `quality.overclaimFindings > speed.overclaimFindings`
- **Rationale**: Quality-first audits more → finds more. Correct behavior.

### Test 2: `strategyDominance.test.ts`
- **Old**: `speed.overclaimFindings > quality.overclaimFindings && speed > balanced`
- **New**: `quality.evidenceIntegrityEnd > speed.evidenceIntegrityEnd && balanced.evidenceIntegrityEnd > speed.evidenceIntegrityEnd`
- **Rationale**: Evidence integrity is the actual risk indicator. Speed-first skips audit → lower evidence integrity.

## Research Impact

For G26+ hierarchy scenarios, this distinction is critical:
- A hierarchical org with more audit coverage will show HIGHER overclaimFindings
- This does NOT mean the hierarchy produces worse output
- It means the hierarchy DETECTS more issues
- Compare evidenceIntegrityEnd, not overclaimFindings, to assess actual quality
