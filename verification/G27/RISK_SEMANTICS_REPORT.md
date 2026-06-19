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

## G27-S1 Derived Artifact Fields

The machine-readable seal artifacts add two derived fields for auditability:

```text
auditCoverageRate
undetectedOverclaimExposure
```

These are deterministic artifact-level proxies, not new core simulation behavior.

`auditCoverageRate` is derived from the observed review structure:

- flat: selected-final-artifact review over produced artifacts
- hierarchical: cell merge reviews plus final operations review over produced artifacts

`undetectedOverclaimExposure` is computed as:

```text
latentRiskEstimate * (1 - auditCoverageRate)
```

This preserves the G25-S1/G26-0 distinction:

- `detectedOverclaimFindings` remains a DETECTION metric
- `latentRiskEstimate` remains the risk/exposure comparison metric
- higher detected findings may indicate stronger audit coverage, not worse latent behavior
