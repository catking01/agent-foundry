# G29 Risk Semantics UI Recheck

## UI Requirement

The Research Dashboard must visibly preserve this distinction:

```text
detectedOverclaimFindings = DETECTION metric
latentRiskEstimate        = EXPOSURE metric
evidenceIntegrityDelta    = evidence-vs-claim outcome metric
```

## Recheck Result

PASS. `ResearchDashboard` renders:

- `detectedOverclaimFindings is a DETECTION metric`
- `Latent risk is the preferred risk-outcome metric`
- `evidenceIntegrityDelta compares evidence strength with claim level`

## Interpretation Rule

Higher detected findings may indicate stronger audit coverage, not worse latent behavior.
