# Risk Semantics UI Recheck

Verdict: PASS

## Required Distinction

G31 preserves the G25/G27/G28 risk semantics distinction:

- `detectedOverclaimFindings` is a DETECTION metric.
- Higher detected findings can indicate stronger audit coverage, not higher actual generated risk.
- `latentRiskEstimate` is an EXPOSURE metric and is closer to modeled risk outcome.

## UI Evidence

The G31 dashboard renders a `Risk semantics` panel with the scoring note, Pareto note, exposure note, and detection note.

## Boundary

The UI does not present detected findings as actual risk.
