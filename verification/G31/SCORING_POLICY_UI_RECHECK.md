# Scoring Policy UI Recheck

Verdict: PASS

## Source

`verification/G30/SCORING_POLICY.md`

## UI Formulas

G31 renders the deterministic formulas:

- `speedScore = -deliveryTicks`
- `qualityScore = finalQuality + finalEvidenceStrength * 0.5`
- `riskReductionScore = -latentRiskEstimate - undetectedOverclaimExposure`
- `coordinationEfficiencyScore = riskAdjustedQuality / max(1, coordinationCost)`
- `balancedScore = riskAdjustedQuality + finalEvidenceStrength * 0.5 - deliveryTicks * 0.1 - coordinationCost * 0.05`

## Boundary

The UI states that these scores are deterministic simulator metrics, not real organization value functions.
