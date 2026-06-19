# G27 Raw Matrix Schema

Source artifact: `verification/G27/ORG_MULTI_SEED_MATRIX.json`

Each run is a flattened, machine-readable record derived from `runMultiSeedStudy()`.

## Required Run Fields

- `seed`
- `mode`
- `orderClass`
- `orderClassInstanceIndex`
- `orderClassInstanceCount`
- `orderId`
- `deliveryTicks`
- `finalQuality`
- `finalEvidenceStrength`
- `finalClaimLevel`
- `claimEvidenceGap`
- `detectedOverclaimFindings`
- `latentRiskEstimate`
- `undetectedOverclaimExposure`
- `auditCoverageRate`
- `coordinationCost`
- `handoffCount`
- `fanoutCount`
- `subtaskCount`
- `mergeDelay`
- `leadUtilization`
- `workerUtilization`
- `bottleneckUnitId`
- `parallelWaste`
- `mergeQualityGain`
- `qualityPerTick`
- `riskAdjustedQuality`
- `coordinationEfficiency`

## Derived Fields

`deliveryTicks` is `result.metrics.totalTicks`.

`claimEvidenceGap` is the final artifact overclaim gap, equivalent to claim level minus evidence strength when a final artifact exists.

`auditCoverageRate` is a structural coverage proxy used only for G27-S1 artifact sealing:

- flat: selected-final-artifact review over produced artifacts
- hierarchical: cell merge reviews plus final operations review over produced artifacts

`undetectedOverclaimExposure = latentRiskEstimate x (1 - auditCoverageRate)`.

`mergeQualityGain` compares a hierarchical run with the matching flat run for the same seed and order. Flat runs use 0.

`coordinationEfficiency = mergeQualityGain / max(1, coordinationCost)`.

## Non-Claim

These derived artifact fields support deterministic study auditing. They do not claim real audit coverage, real hidden risk, or real organization behavior.
