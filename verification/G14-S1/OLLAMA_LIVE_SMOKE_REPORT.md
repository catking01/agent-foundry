# G14-S1 Local Ollama Live Smoke Report

## Environment

| Field | Value |
|---|---|
| Host | localhost:11434 |
| Model | qwen2.5-coder:14b (Q4_K_M, 14.8B params) |
| Hardware | Mac (darwin) |
| Date | 2026-06-15 |

## Results

### High-Claim Artifact (overclaim gap = 7.0)

| Field | Value |
|---|---|
| callSucceeded | true |
| semanticPass | **false** |
| riskLevel | **high** |
| overclaimDetected | **true** |
| evidenceGapDetected | **true** |
| hiddenFailureConcern | **true** |
| confidence | 8/10 |
| responseTimeMs | 28,677 |

**Reason**: "The artifact significantly overclaims its capabilities, has a low evidence strength compared to the claim level, and there are hidden or failed parallel routes producing this artifact."

### Clean Artifact (overclaim gap = 0.5)

| Field | Value |
|---|---|
| callSucceeded | true |
| semanticPass | **true** |
| riskLevel | **low** |
| overclaimDetected | false |
| evidenceGapDetected | true (minor gap noted) |
| hiddenFailureConcern | false |
| confidence | 9/10 |
| responseTimeMs | 20,442 |

**Reason**: "The artifact meets the criteria with a slight evidence gap compared to its claim."

## Comparison: Deterministic vs Shadow Audit

| Aspect | High-Claim | Clean |
|---|---|---|
| Deterministic audit | null (not run) | PASSED |
| Shadow semantic pass | false | true |
| Shadow risk level | high | low |
| Shadow overclaim | detected | not detected |
| Shadow hidden failure | detected | not detected |

The shadow auditor correctly discriminates between the two artifacts:
- High-claim artifact with evidence 2/10 and claim 9/10 is correctly flagged as overclaim + evidence gap + hidden failure concern
- Clean artifact with evidence 8.5/10 and claim 9/10 passes with low risk

## Non-Determinism Recheck

- [x] No GameState mutation
- [x] No ledger/artifact mutation
- [x] No replay hash impact
- [x] No browser execution
- [x] No external API calls (localhost only)
- [x] Normal tests pass without Ollama (189 tests, 4 skipped)
