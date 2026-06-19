import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buildG28Artifacts,
  runOrgInterventionStudy,
  type InterventionAggregateGroup,
  type OrgInterventionMatrix,
} from '../src/sim/orgInterventionStudy'

const outDir = join(process.cwd(), 'verification', 'G28')
const generatedAt = new Date().toISOString()
const matrix = runOrgInterventionStudy()
const artifacts = buildG28Artifacts(matrix, generatedAt)

if (artifacts.deltaReport.verdict !== 'PASS') {
  throw new Error('G28 delta recompute report failed')
}

mkdirSync(outDir, { recursive: true })

writeJson('ORG_INTERVENTION_MATRIX.json', artifacts.raw)
writeJson('INTERVENTION_AGGREGATES.json', artifacts.aggregates)
writeJson('INTERVENTION_DELTA_REPORT.json', artifacts.deltaReport)
writeJson('INTERVENTION_BY_ORDER_COMPLEXITY.json', artifacts.byOrderComplexity)
writeJson('INTERVENTION_RANKING.json', artifacts.ranking)
writeText('G28_ORGANIZATION_INTERVENTION_EXPERIMENTS.md', mainReport(matrix))
writeText('BASELINE_LINKAGE_TO_G27.md', baselineLinkage())
writeText('INTERVENTION_RISK_SEMANTICS.md', riskSemantics())
writeText('INTERVENTION_FINDINGS.md', findingsReport(matrix))
writeText('NON_CLAIMS.md', nonClaims())

console.log(`G28 artifacts generated in ${outDir}`)
console.log(`Runs: ${matrix.runs.length}`)
console.log(`Delta report: ${artifacts.deltaReport.verdict}`)

function writeJson(fileName: string, value: unknown): void {
  writeFileSync(join(outDir, fileName), `${JSON.stringify(value, null, 2)}\n`)
}

function writeText(fileName: string, value: string): void {
  writeFileSync(join(outDir, fileName), value)
}

function mainReport(matrix: OrgInterventionMatrix): string {
  return `# G28: Organization Intervention Experiments

## Study Design

\`\`\`text
Baseline:      G27-S1 hierarchical deterministic simulation
Seeds:         8
Order classes: simple, medium, complex
Orders:        1 representative order per class
Interventions: 6
Total runs:    ${matrix.runs.length}
\`\`\`

## Interventions

${matrix.interventions.map((intervention) => `- \`${intervention.id}\`: ${intervention.description}`).join('\n')}

## Matrix Shape

\`\`\`text
8 seeds x 3 representative orders x 6 interventions = 144 runs
\`\`\`

## Required Evidence

- \`ORG_INTERVENTION_MATRIX.json\`
- \`INTERVENTION_AGGREGATES.json\`
- \`INTERVENTION_DELTA_REPORT.json\`
- \`INTERVENTION_BY_ORDER_COMPLEXITY.json\`
- \`INTERVENTION_RANKING.json\`
- \`INTERVENTION_RISK_SEMANTICS.md\`
- \`INTERVENTION_FINDINGS.md\`
- \`NON_CLAIMS.md\`
- \`TEST_OUTPUT.txt\`
- \`BUILD_OUTPUT.txt\`

## Current Artifact Verdict

\`\`\`text
delta recompute report: ${buildG28Artifacts(matrix, generatedAt).deltaReport.verdict}
machine-readable artifacts: generated
validation status: see TEST_OUTPUT.txt and BUILD_OUTPUT.txt
\`\`\`
`
}

function baselineLinkage(): string {
  return `# G28 Baseline Linkage To G27

G28 uses the G27-S1 deterministic hierarchical scenario runner as the baseline for each same-seed and same-order comparison.

## Baseline Commit

\`\`\`text
G27-S1 commit: 771a58bda0321ae99482d44079eda30cbfb440d6
\`\`\`

## Baseline Mapping

Each non-baseline G28 run stores \`baselineId\`, which points to the matching \`baseline_hierarchical\` run with the same:

- seed
- orderClass
- orderInstanceId

Delta metrics are computed only against that matching baseline row.

## Scope

G28 does not replace the G27 baseline. It adds deterministic intervention transforms on top of the baseline study record so intervention deltas can be recomputed from raw JSON.
`
}

function riskSemantics(): string {
  return `# G28 Intervention Risk Semantics

G28 preserves the G25-S1, G26-0, and G27-S1 metric distinction:

\`\`\`text
detectedOverclaimFindings = DETECTION metric
latentRiskEstimate        = EXPOSURE metric
evidenceIntegrityDelta    = OUTCOME metric
\`\`\`

For G28, \`audit_coverage_plus\` may increase \`detectedOverclaimFindings\` while reducing \`latentRiskEstimate\`. That is not a contradiction. Higher detection can mean stronger audit coverage, not worse underlying generation behavior.

Derived G28 fields:

- \`auditCoverageRate\`: deterministic structural coverage proxy
- \`undetectedOverclaimExposure\`: \`latentRiskEstimate * (1 - auditCoverageRate)\`

These fields are study artifacts only. They do not claim real audit coverage or real hidden risk.
`
}

function findingsReport(matrix: OrgInterventionMatrix): string {
  const ranking = matrix.ranking
  return `# G28 Intervention Findings

## Ranking Summary

- Best quality delta: \`${ranking.bestQualityIntervention}\`
- Best latent risk reduction: \`${ranking.bestRiskReductionIntervention}\`
- Best coordination efficiency delta: \`${ranking.bestCoordinationEfficiencyIntervention}\`
- Fastest intervention: \`${ranking.fastestIntervention}\`
- Best risk-adjusted quality delta: \`${ranking.bestRiskAdjustedQualityIntervention}\`

## Intervention Means

${matrix.aggregates.byIntervention.map(formatAggregate).join('\n')}

## Interpretation Boundary

These findings describe deterministic simulator behavior only. They are not real-world organization conclusions.
`
}

function formatAggregate(group: InterventionAggregateGroup): string {
  return `- \`${group.key}\`: mean delta quality ${stat(group, 'deltaFinalQuality')}, mean delta latent risk ${stat(group, 'deltaLatentRisk')}, mean delta coordination cost ${stat(group, 'deltaCoordinationCost')}, mean delta risk-adjusted quality ${stat(group, 'deltaRiskAdjustedQuality')}`
}

function stat(group: InterventionAggregateGroup, field: string): number {
  return group.stats[field]?.mean ?? 0
}

function nonClaims(): string {
  return `# G28 Non-Claims

G28 does not claim:

1. Any intervention is better in real organizations
2. Agent Foundry validates real organization theory
3. Detected overclaim findings are actual generated risk
4. The study uses real LLM agents
5. The study calls Ollama in core simulation
6. The main gameplay pipeline changed
7. Public demo behavior changed

G28 is a deterministic intervention comparison inside the Agent Foundry research simulator.
`
}
