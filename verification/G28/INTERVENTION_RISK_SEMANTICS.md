# G28 Intervention Risk Semantics

G28 preserves the G25-S1, G26-0, and G27-S1 metric distinction:

```text
detectedOverclaimFindings = DETECTION metric
latentRiskEstimate        = EXPOSURE metric
evidenceIntegrityDelta    = OUTCOME metric
```

For G28, `audit_coverage_plus` may increase `detectedOverclaimFindings` while reducing `latentRiskEstimate`. That is not a contradiction. Higher detection can mean stronger audit coverage, not worse underlying generation behavior.

Derived G28 fields:

- `auditCoverageRate`: deterministic structural coverage proxy
- `undetectedOverclaimExposure`: `latentRiskEstimate * (1 - auditCoverageRate)`

These fields are study artifacts only. They do not claim real audit coverage or real hidden risk.
