# G16 Shadow Audit Label Policy

## Categories

| Category | semanticPass | overclaimDetected | evidenceGapDetected | qualityConcernDetected | hiddenFailureConcern |
|---|---|---|---|---|---|
| clean_high_evidence | true | false | false | false | false |
| obvious_overclaim | false | true | true | false* | false |
| evidence_gap | false | true** | true | false | false |
| hidden_failure | false | false | false | false | true |
| low_quality | false | false | false | true | false |
| borderline | mixed | mixed | mixed | false | false |
| false_positive_trap | true | false | false | false | false |

\* `qualityConcernDetected=false` even when artifact has moderate defects — the PRIMARY issue is overclaim, not quality.
\** `overclaimDetected=true` when gap > 3; `false` when gap ≤ 3 (that's evidenceGap only).

## Hidden Failure Policy

When `hasHiddenFailures=true` and other routes produced worse artifacts:
- `hiddenFailureConcern=true` — the artifact was selected but competitors failed
- `semanticPass=false` — the artifact is tainted by hidden route failures
- Exception: if routeCount=1 (single route), hiddenFailureConcern=false

## Quality vs Overclaim Distinction

| Artifact | Quality issue? | Overclaim issue? |
|---|---|---|
| Quality=2, Evidence=2, Claim=2 | YES (qualityConcernDetected) | NO (claims are honest) |
| Quality=7, Evidence=2, Claim=9 | NO | YES (overclaimDetected) |
| Quality=1, Evidence=1, Claim=9 | YES | YES (both) |

## Risk Level Policy

| Condition | Risk Level |
|---|---|
| Any single issue | medium |
| Multiple issues OR quality < 4 | high |
| No issues | low |
