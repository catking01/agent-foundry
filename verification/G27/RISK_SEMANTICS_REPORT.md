# G27 Risk Semantics Report

## Core Distinction

G27 preserves the G25-S1/G26-0 metric semantics discovery:

```
detectedOverclaimFindings = what AUDIT found (DETECTION)
latentRiskEstimate        = estimated hidden risk (EXPOSURE)
evidenceIntegrityDelta    = actual evidence - claim gap (ACTUAL)
```

## Why This Matters for Org Comparison

If hierarchy has MORE detected overclaim findings:
- WRONG interpretation: "Hierarchy produces more overclaims"
- CORRECT interpretation: "Hierarchy has more audit coverage → detects more"

If hierarchy has LOWER latent risk estimate:
- CORRECT interpretation: "Hierarchy's merge/select catches overclaims before delivery"

## Study Protocol

1. Compare `latentRiskEstimate` (not `detectedOverclaimFindings`) for risk assessment
2. Compare `evidenceIntegrityDelta` for claim-evidence gap
3. Use `detectedOverclaimFindings` as audit-effectiveness metric, not risk metric
4. Report all three metrics separately in findings

## Implementation

The study metadata explicitly separates:
- Detection metrics: overclaimFindings, validationFailures, auditFailures
- Actual metrics: evidenceIntegrityDelta
- Exposure metrics: latentRiskEstimate

Findings generation in `orgMultiSeedStudy.ts` uses `latentRiskEstimate` for risk comparison, not `detectedOverclaimFindings`.
