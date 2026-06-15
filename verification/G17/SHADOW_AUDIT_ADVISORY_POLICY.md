# G17 Shadow Audit Advisory Policy

## Principle

The Ollama shadow auditor produces **advisory metadata only**.
It never blocks delivery, never mutates GameState, and never affects the replay hash.

## Advisory Levels

| Level | Meaning | Action |
|---|---|---|
| info | No issues detected | No action needed |
| caution | Minor issue or borderline case | Note for review, no block |
| warning | Significant issue detected | Human review recommended |
| critical | Multiple severe issues | Human review strongly recommended |

## Primary Issue Hierarchy

When multiple issues are detected, the most severe one is the primary issue:

1. **overclaim** — claims significantly exceed evidence (most severe)
2. **hidden_failure** — parallel routes had failures
3. **evidence_gap** — evidence is weaker than claims
4. **quality** — artifact quality is low, regardless of claims
5. **borderline** — model is unsure but flags something

## shouldBlockDelivery = false

This is a **type-level guarantee**. The `CalibratedShadowAudit` type enforces
`shouldBlockDelivery: false` as a literal type. No code path can set it to `true`.

## False-Positive Risk

The model tends to over-trigger `qualityConcernDetected` and `evidenceGapDetected`.
The calibration engine estimates false-positive risk:

| Risk | Condition |
|---|---|
| high | Borderline cases (no specific flags, just model uncertainty) |
| medium | Quality concern with low confidence, or single evidence gap with low confidence |
| low | High confidence, multiple corroborating flags |

## Human Review Triggers

Human review is recommended when:
- Advisory level is `critical` or `warning`
- Hidden failure with multiple issues
