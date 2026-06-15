# G17 Non-Determinism Boundary Recheck

## Status: PRESERVED

| Boundary | Check |
|---|---|
| GameState mutation | None — calibration reads ShadowAuditResult only |
| Artifact mutation | None |
| Ledger mutation | None |
| Replay hash impact | None |
| Browser execution | Guarded by `typeof window` check |
| Env var gate | `AGENT_FOUNDRY_ENABLE_OLLAMA=1` required |
| Normal tests without Ollama | 35 files, 209 tests (12 skipped) |
| `shouldBlockDelivery` | Always `false` — type-level literal |

## G14 → G17 Boundary Chain

```
G14: shadowAudit() → ShadowAuditResult (raw LLM)
G15: benchmark runner → runs shadowAudit for 24 cases
G16: refined prompt/schema → qualityConcernDetected added
G17: calibrateShadowAudit() → CalibratedShadowAudit (advisory)

At every stage: no GameState access, no mutation, no replay impact.
```
