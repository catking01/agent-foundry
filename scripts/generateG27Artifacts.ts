import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { runMultiSeedStudy } from '../src/sim/orgMultiSeedStudy'
import {
  assertG27SealArtifactsComplete,
  buildG27SealArtifacts,
} from '../src/sim/orgStudyArtifactSeal'

const outDir = join(process.cwd(), 'verification', 'G27')
const generatedAt = new Date().toISOString()
const matrix = runMultiSeedStudy()
const artifacts = buildG27SealArtifacts(matrix, generatedAt)

assertG27SealArtifactsComplete(artifacts)
mkdirSync(outDir, { recursive: true })

writeJson('ORG_MULTI_SEED_MATRIX.json', artifacts.raw)
writeJson('FLAT_VS_HIERARCHY_AGGREGATES.json', artifacts.aggregates)
writeJson('ORDER_COMPLEXITY_BREAKDOWN.json', artifacts.complexityBreakdown)
writeJson('COORDINATION_COST_CURVE.json', artifacts.coordinationCostCurve)
writeJson('AGGREGATE_RECOMPUTE_CHECK.json', artifacts.recomputeCheck)
writeText('G27_CONTRACT_DELTA.md', contractDeltaMarkdown())
writeText('RAW_MATRIX_SCHEMA.md', rawMatrixSchemaMarkdown())
writeText('WORKTREE_HYGIENE_REPORT.md', worktreeHygieneMarkdown())
writeText('G27_SEAL_VERDICT.md', sealVerdictMarkdown())

console.log(`G27-S1 artifacts generated in ${outDir}`)
console.log(`Raw runs: ${artifacts.raw.runs.length}`)
console.log(`Aggregate recompute verdict: ${artifacts.recomputeCheck.verdict}`)

function writeJson(fileName: string, value: unknown): void {
  writeFileSync(join(outDir, fileName), `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(fileName: string, value: string): void {
  writeFileSync(join(outDir, fileName), value)
}

function contractDeltaMarkdown(): string {
  return `# G27 Contract Delta

## Verdict

The G27 implementation intentionally expands the original minimum study matrix.

## Original Contract

\`\`\`text
8 seeds x 2 modes x 3 order classes = 48 runs
\`\`\`

The original contract treated each order class as a single representative scenario.

## Implemented Matrix

\`\`\`text
8 seeds x 2 modes x 3 order classes x 3 concrete order instances per class = 144 runs
\`\`\`

The additional dimension is:

\`\`\`text
orderClassInstanceIndex
\`\`\`

Each complexity class has three concrete order instances:

- simple: complexity 1, 2, 3
- medium: complexity 4, 5, 6
- complex: complexity 7, 8, 9

## Why This Is A Superset

The 144-run matrix preserves the original seed, mode, and order-class coverage while replacing one representative order per class with three concrete orders per class. Aggregates are reported by:

- mode
- orderClass
- mode + orderClass
- order instance

## Audit Implication

G27 is not sealed by Markdown findings alone. The seal requires raw matrix JSON, aggregate JSON, complexity breakdown JSON, coordination cost curve JSON, and recompute evidence generated from the raw matrix.
`
}

function rawMatrixSchemaMarkdown(): string {
  return `# G27 Raw Matrix Schema

Source artifact: \`verification/G27/ORG_MULTI_SEED_MATRIX.json\`

Each run is a flattened, machine-readable record derived from \`runMultiSeedStudy()\`.

## Required Run Fields

- \`seed\`
- \`mode\`
- \`orderClass\`
- \`orderClassInstanceIndex\`
- \`orderClassInstanceCount\`
- \`orderId\`
- \`deliveryTicks\`
- \`finalQuality\`
- \`finalEvidenceStrength\`
- \`finalClaimLevel\`
- \`claimEvidenceGap\`
- \`detectedOverclaimFindings\`
- \`latentRiskEstimate\`
- \`undetectedOverclaimExposure\`
- \`auditCoverageRate\`
- \`coordinationCost\`
- \`handoffCount\`
- \`fanoutCount\`
- \`subtaskCount\`
- \`mergeDelay\`
- \`leadUtilization\`
- \`workerUtilization\`
- \`bottleneckUnitId\`
- \`parallelWaste\`
- \`mergeQualityGain\`
- \`qualityPerTick\`
- \`riskAdjustedQuality\`
- \`coordinationEfficiency\`

## Derived Fields

\`deliveryTicks\` is \`result.metrics.totalTicks\`.

\`claimEvidenceGap\` is the final artifact overclaim gap, equivalent to claim level minus evidence strength when a final artifact exists.

\`auditCoverageRate\` is a structural coverage proxy used only for G27-S1 artifact sealing:

- flat: selected-final-artifact review over produced artifacts
- hierarchical: cell merge reviews plus final operations review over produced artifacts

\`undetectedOverclaimExposure = latentRiskEstimate x (1 - auditCoverageRate)\`.

\`mergeQualityGain\` compares a hierarchical run with the matching flat run for the same seed and order. Flat runs use 0.

\`coordinationEfficiency = mergeQualityGain / max(1, coordinationCost)\`.

## Non-Claim

These derived artifact fields support deterministic study auditing. They do not claim real audit coverage, real hidden risk, or real organization behavior.
`
}

function worktreeHygieneMarkdown(): string {
  return `# G27 Worktree Hygiene Report

## Classification

- \`AGENTS.md\`: commit. This is a repository control/contributor guidance file.
- \`.codex/research_record.md\`: commit. This is the append-only local evidence ledger.
- \`.codex/research_report.md\`: commit. This is the current local research summary.

## Current Policy

These files should not be hidden through ignore rules or removed as cleanup. They are control/evidence files for this project.

## Seal Requirement

Before closing G27-S1, run:

\`\`\`text
git status --short
~/.codex/bin/codex_preclose_hygiene.sh . --mode fast
\`\`\`

The final response must explain any remaining status entries file by file.
`
}

function sealVerdictMarkdown(): string {
  return `# G27 Seal Verdict

## Pre-Validation Verdict

\`\`\`text
G27-S1 artifact generation: CANDIDATE
G27 sealed milestone: not claimed until validators pass
\`\`\`

## Required Evidence

- \`ORG_MULTI_SEED_MATRIX.json\`
- \`FLAT_VS_HIERARCHY_AGGREGATES.json\`
- \`ORDER_COMPLEXITY_BREAKDOWN.json\`
- \`COORDINATION_COST_CURVE.json\`
- \`AGGREGATE_RECOMPUTE_CHECK.json\`
- \`TEST_OUTPUT.txt\`
- \`BUILD_OUTPUT.txt\`

## Non-Claims

G27-S1 does not claim hierarchy is better than flat, does not generalize to real organizations, does not use real LLM agents, and does not replace the main gameplay pipeline.
`
}
