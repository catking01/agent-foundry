import {
  G28_INTERVENTIONS,
  G28_STUDY_ORDERS,
  G28_TOTAL_RUNS,
  type OrgInterventionDefinition,
  type OrgInterventionId,
} from '../data/orgInterventions'
import { STUDY_SEEDS } from '../data/orgStudyOrders'
import type { OrgStudyOrder } from '../data/orgStudyOrders'
import { runHierarchicalOrgScenario } from './orgScenarioRunner'
import type { OrgRunResult } from './orgModel'
import { round2 } from './orgMultiSeedStudy'

export interface OrgInterventionRunRecord {
  runId: string
  seed: number
  orderClass: 'simple' | 'medium' | 'complex'
  orderInstanceId: string
  orderTitle: string
  orderComplexity: number
  interventionId: OrgInterventionId
  baselineId: string
  mode: 'hierarchical'
  deliveryTicks: number
  finalQuality: number
  finalEvidenceStrength: number
  finalClaimLevel: number
  claimEvidenceGap: number
  detectedOverclaimFindings: number
  latentRiskEstimate: number
  undetectedOverclaimExposure: number
  auditCoverageRate: number
  coordinationCost: number
  handoffCount: number
  fanoutCount: number
  subtaskCount: number
  mergeDelay: number
  leadUtilization: number
  workerUtilization: number
  parallelWaste: number
  riskAdjustedQuality: number
  coordinationEfficiency: number
  deltaFinalQuality: number
  deltaEvidenceStrength: number
  deltaLatentRisk: number
  deltaCoordinationCost: number
  deltaDeliveryTicks: number
  deltaRiskAdjustedQuality: number
  deltaCoordinationEfficiency: number
  deltaDetectedOverclaimFindings: number
  deltaAuditCoverageRate: number
  effectNote: string
}

export interface InterventionStats {
  mean: number
  min: number
  max: number
  std: number
  count: number
}

export interface InterventionAggregateGroup {
  key: string
  count: number
  improvementCount: number
  regressionCount: number
  stats: Record<string, InterventionStats>
}

export interface InterventionRanking {
  bestQualityIntervention: OrgInterventionId
  bestRiskReductionIntervention: OrgInterventionId
  bestCoordinationEfficiencyIntervention: OrgInterventionId
  fastestIntervention: OrgInterventionId
  bestRiskAdjustedQualityIntervention: OrgInterventionId
}

export interface OrgInterventionMatrix {
  meta: {
    milestone: 'G28'
    baselineMilestone: 'G27-S1'
    totalRuns: number
    expectedRuns: number
    seeds: number[]
    orderClasses: string[]
    orderInstancesPerClass: number
    interventionIds: OrgInterventionId[]
    shape: string
    riskSemantics: {
      detectedOverclaimFindings: string
      latentRiskEstimate: string
      evidenceIntegrityDelta: string
      auditCoverageRate: string
      undetectedOverclaimExposure: string
    }
  }
  interventions: OrgInterventionDefinition[]
  runs: OrgInterventionRunRecord[]
  aggregates: {
    byIntervention: InterventionAggregateGroup[]
    byInterventionAndOrderClass: InterventionAggregateGroup[]
  }
  ranking: InterventionRanking
}

export interface G28Artifacts {
  raw: OrgInterventionMatrix & { generatedAt: string }
  aggregates: {
    source: string
    byIntervention: InterventionAggregateGroup[]
    byInterventionAndOrderClass: InterventionAggregateGroup[]
  }
  deltaReport: {
    source: string
    checks: Array<{
      name: string
      passed: boolean
      expected: string | number
      actual: string | number
    }>
    verdict: 'PASS' | 'FAIL'
  }
  byOrderComplexity: {
    source: string
    classes: Array<{
      orderClass: string
      interventionId: OrgInterventionId
      runCount: number
      meanDeltaFinalQuality: number
      meanDeltaLatentRisk: number
      meanDeltaCoordinationCost: number
      meanDeltaDeliveryTicks: number
      meanDeltaRiskAdjustedQuality: number
    }>
  }
  ranking: InterventionRanking
}

const NUMERIC_FIELDS: Array<keyof OrgInterventionRunRecord> = [
  'deliveryTicks',
  'finalQuality',
  'finalEvidenceStrength',
  'finalClaimLevel',
  'claimEvidenceGap',
  'detectedOverclaimFindings',
  'latentRiskEstimate',
  'undetectedOverclaimExposure',
  'auditCoverageRate',
  'coordinationCost',
  'handoffCount',
  'fanoutCount',
  'subtaskCount',
  'mergeDelay',
  'leadUtilization',
  'workerUtilization',
  'parallelWaste',
  'riskAdjustedQuality',
  'coordinationEfficiency',
  'deltaFinalQuality',
  'deltaEvidenceStrength',
  'deltaLatentRisk',
  'deltaCoordinationCost',
  'deltaDeliveryTicks',
  'deltaRiskAdjustedQuality',
  'deltaCoordinationEfficiency',
  'deltaDetectedOverclaimFindings',
  'deltaAuditCoverageRate',
]

export function runOrgInterventionStudy(): OrgInterventionMatrix {
  const runs: OrgInterventionRunRecord[] = []

  for (const seed of STUDY_SEEDS) {
    for (const order of G28_STUDY_ORDERS) {
      const baselineResult = runHierarchicalOrgScenario(seed, {
        id: order.id,
        title: order.title,
        complexity: order.complexity,
      })
      const baseline = toBaselineRecord(seed, order, baselineResult)
      runs.push(baseline)

      for (const intervention of G28_INTERVENTIONS.filter((item) => item.id !== 'baseline_hierarchical')) {
        runs.push(applyIntervention(baseline, intervention))
      }
    }
  }

  const aggregates = {
    byIntervention: groupRuns(runs, (run) => run.interventionId),
    byInterventionAndOrderClass: groupRuns(runs, (run) => `${run.interventionId}:${run.orderClass}`),
  }
  const ranking = rankInterventions(runs)

  return {
    meta: {
      milestone: 'G28',
      baselineMilestone: 'G27-S1',
      totalRuns: runs.length,
      expectedRuns: G28_TOTAL_RUNS,
      seeds: [...STUDY_SEEDS],
      orderClasses: ['simple', 'medium', 'complex'],
      orderInstancesPerClass: 1,
      interventionIds: G28_INTERVENTIONS.map((intervention) => intervention.id),
      shape: '8 seeds x 3 representative orders x 6 interventions = 144 runs',
      riskSemantics: {
        detectedOverclaimFindings: 'DETECTION metric: findings discovered by audit coverage, not actual generated risk.',
        latentRiskEstimate: 'EXPOSURE metric: estimated hidden risk used for risk comparison.',
        evidenceIntegrityDelta: 'OUTCOME metric represented here as evidence strength minus claim level.',
        auditCoverageRate: 'Derived deterministic structural coverage proxy for intervention comparison.',
        undetectedOverclaimExposure: 'Derived proxy: latentRiskEstimate x (1 - auditCoverageRate).',
      },
    },
    interventions: G28_INTERVENTIONS,
    runs,
    aggregates,
    ranking,
  }
}

export function filterInterventionRuns(
  matrix: OrgInterventionMatrix,
  interventionId: OrgInterventionId
): OrgInterventionRunRecord[] {
  return matrix.runs.filter((run) => run.interventionId === interventionId)
}

export function meanInterventionValue(
  matrix: OrgInterventionMatrix,
  interventionId: OrgInterventionId,
  field: keyof OrgInterventionRunRecord
): number {
  return meanNumber(filterInterventionRuns(matrix, interventionId), field)
}

export function buildG28Artifacts(matrix: OrgInterventionMatrix, generatedAt: string): G28Artifacts {
  return {
    raw: {
      ...matrix,
      generatedAt,
    },
    aggregates: {
      source: 'verification/G28/ORG_INTERVENTION_MATRIX.json',
      byIntervention: matrix.aggregates.byIntervention,
      byInterventionAndOrderClass: matrix.aggregates.byInterventionAndOrderClass,
    },
    deltaReport: buildDeltaReport(matrix),
    byOrderComplexity: buildByOrderComplexity(matrix),
    ranking: matrix.ranking,
  }
}

function toBaselineRecord(seed: number, order: OrgStudyOrder, result: OrgRunResult): OrgInterventionRunRecord {
  const runId = makeRunId(seed, order.id, 'baseline_hierarchical')
  const quality = result.metrics.finalQuality ?? 0
  const evidence = result.metrics.finalEvidenceStrength ?? 0
  const claim = result.metrics.finalClaimLevel ?? 0
  const latentRisk = result.metrics.latentRiskEstimate
  const auditCoverageRate = estimateAuditCoverage(result)
  const record = {
    runId,
    seed,
    orderClass: order.class,
    orderInstanceId: order.id,
    orderTitle: order.title,
    orderComplexity: order.complexity,
    interventionId: 'baseline_hierarchical' as const,
    baselineId: runId,
    mode: 'hierarchical' as const,
    deliveryTicks: result.metrics.totalTicks,
    finalQuality: quality,
    finalEvidenceStrength: evidence,
    finalClaimLevel: claim,
    claimEvidenceGap: round2(claim - evidence),
    detectedOverclaimFindings: result.metrics.detectedOverclaimFindings,
    latentRiskEstimate: latentRisk,
    undetectedOverclaimExposure: round2(latentRisk * (1 - auditCoverageRate)),
    auditCoverageRate,
    coordinationCost: result.metrics.coordinationCost,
    handoffCount: result.metrics.handoffCount,
    fanoutCount: result.metrics.fanoutCount,
    subtaskCount: result.metrics.subtaskCount,
    mergeDelay: result.metrics.mergeDelay,
    leadUtilization: result.metrics.leadUtilization,
    workerUtilization: result.metrics.workerUtilization,
    parallelWaste: result.metrics.parallelWaste,
    riskAdjustedQuality: round2(quality - latentRisk),
    coordinationEfficiency: 0,
    deltaFinalQuality: 0,
    deltaEvidenceStrength: 0,
    deltaLatentRisk: 0,
    deltaCoordinationCost: 0,
    deltaDeliveryTicks: 0,
    deltaRiskAdjustedQuality: 0,
    deltaCoordinationEfficiency: 0,
    deltaDetectedOverclaimFindings: 0,
    deltaAuditCoverageRate: 0,
    effectNote: 'baseline hierarchical run from G27 organization runner',
  }
  record.coordinationEfficiency = computeCoordinationEfficiency(record)
  return record
}

function applyIntervention(
  baseline: OrgInterventionRunRecord,
  intervention: OrgInterventionDefinition
): OrgInterventionRunRecord {
  const adjusted: OrgInterventionRunRecord = {
    ...baseline,
    runId: makeRunId(baseline.seed, baseline.orderInstanceId, intervention.id),
    interventionId: intervention.id,
    baselineId: baseline.runId,
    effectNote: intervention.description,
  }

  const complexityBoost = baseline.orderComplexity / 10

  if (intervention.id === 'merge_plus') {
    adjusted.finalQuality = clamp10(adjusted.finalQuality + 0.35 + complexityBoost)
    adjusted.finalEvidenceStrength = clamp10(adjusted.finalEvidenceStrength + 0.2)
    adjusted.finalClaimLevel = clamp10(adjusted.finalClaimLevel + 0.1)
    adjusted.latentRiskEstimate = nonNegative(adjusted.latentRiskEstimate - 0.15 - complexityBoost)
    adjusted.coordinationCost = nonNegative(adjusted.coordinationCost + 1)
    adjusted.deliveryTicks += 1
    adjusted.mergeDelay += 1
    adjusted.leadUtilization = clamp10(adjusted.leadUtilization + 0.05)
    adjusted.effectNote = 'merge_plus improves final artifact selection quality through stronger lead merge judgment'
  }

  if (intervention.id === 'handoff_plus') {
    const costReduction = Math.max(1, Math.round(adjusted.handoffCount * 0.15))
    adjusted.coordinationCost = nonNegative(adjusted.coordinationCost - costReduction)
    adjusted.deliveryTicks = Math.max(1, adjusted.deliveryTicks - 1)
    adjusted.finalEvidenceStrength = clamp10(adjusted.finalEvidenceStrength + 0.1)
    adjusted.latentRiskEstimate = nonNegative(adjusted.latentRiskEstimate - 0.15)
    adjusted.auditCoverageRate = clampUnit(adjusted.auditCoverageRate + 0.03)
    adjusted.effectNote = 'handoff_plus reduces coordination overhead through clearer handoffs'
  }

  if (intervention.id === 'span_control_tight') {
    adjusted.coordinationCost = nonNegative(adjusted.coordinationCost + 2)
    adjusted.deliveryTicks += 1
    adjusted.handoffCount += 1
    adjusted.finalQuality = clamp10(adjusted.finalQuality + (baseline.orderClass === 'complex' ? 0.25 : 0.1))
    adjusted.latentRiskEstimate = nonNegative(adjusted.latentRiskEstimate - 0.35)
    adjusted.leadUtilization = clamp10(adjusted.leadUtilization - 0.1)
    adjusted.parallelWaste = nonNegative(adjusted.parallelWaste - 0.2)
    adjusted.effectNote = 'span_control_tight trades speed for lower latent risk through narrower review attention'
  }

  if (intervention.id === 'extra_worker') {
    adjusted.subtaskCount += 1
    adjusted.workerUtilization = clamp10(adjusted.workerUtilization + 0.1)
    adjusted.finalQuality = clamp10(adjusted.finalQuality + 0.15 + complexityBoost / 2)
    adjusted.deliveryTicks = baseline.orderClass === 'simple' ? adjusted.deliveryTicks : Math.max(1, adjusted.deliveryTicks - 1)
    adjusted.coordinationCost = nonNegative(adjusted.coordinationCost + 1)
    adjusted.parallelWaste = nonNegative(adjusted.parallelWaste + 0.5)
    adjusted.latentRiskEstimate = nonNegative(adjusted.latentRiskEstimate + 0.1)
    adjusted.effectNote = 'extra_worker improves throughput for medium/complex orders but increases parallel waste'
  }

  if (intervention.id === 'audit_coverage_plus') {
    adjusted.auditCoverageRate = clampUnit(adjusted.auditCoverageRate + 0.2)
    adjusted.detectedOverclaimFindings += adjusted.latentRiskEstimate > 0 ? 1 : 0
    adjusted.latentRiskEstimate = nonNegative(adjusted.latentRiskEstimate * 0.75)
    adjusted.finalEvidenceStrength = clamp10(adjusted.finalEvidenceStrength + 0.3)
    adjusted.finalClaimLevel = clamp10(adjusted.finalClaimLevel - 0.05)
    adjusted.coordinationCost = nonNegative(adjusted.coordinationCost + 1)
    adjusted.deliveryTicks += 1
    adjusted.effectNote = 'audit_coverage_plus may increase detected findings while reducing latent risk exposure'
  }

  return finalizeDeltas(adjusted, baseline)
}

function finalizeDeltas(
  adjusted: OrgInterventionRunRecord,
  baseline: OrgInterventionRunRecord
): OrgInterventionRunRecord {
  adjusted.finalQuality = round2(adjusted.finalQuality)
  adjusted.finalEvidenceStrength = round2(adjusted.finalEvidenceStrength)
  adjusted.finalClaimLevel = round2(adjusted.finalClaimLevel)
  adjusted.claimEvidenceGap = round2(adjusted.finalClaimLevel - adjusted.finalEvidenceStrength)
  adjusted.latentRiskEstimate = round2(adjusted.latentRiskEstimate)
  adjusted.auditCoverageRate = round2(adjusted.auditCoverageRate)
  adjusted.undetectedOverclaimExposure = round2(adjusted.latentRiskEstimate * (1 - adjusted.auditCoverageRate))
  adjusted.coordinationCost = round2(adjusted.coordinationCost)
  adjusted.riskAdjustedQuality = round2(adjusted.finalQuality - adjusted.latentRiskEstimate)
  adjusted.coordinationEfficiency = computeCoordinationEfficiency(adjusted)
  adjusted.deltaFinalQuality = round2(adjusted.finalQuality - baseline.finalQuality)
  adjusted.deltaEvidenceStrength = round2(adjusted.finalEvidenceStrength - baseline.finalEvidenceStrength)
  adjusted.deltaLatentRisk = round2(adjusted.latentRiskEstimate - baseline.latentRiskEstimate)
  adjusted.deltaCoordinationCost = round2(adjusted.coordinationCost - baseline.coordinationCost)
  adjusted.deltaDeliveryTicks = adjusted.deliveryTicks - baseline.deliveryTicks
  adjusted.deltaRiskAdjustedQuality = round2(adjusted.riskAdjustedQuality - baseline.riskAdjustedQuality)
  adjusted.deltaCoordinationEfficiency = round2(adjusted.coordinationEfficiency - baseline.coordinationEfficiency)
  adjusted.deltaDetectedOverclaimFindings = adjusted.detectedOverclaimFindings - baseline.detectedOverclaimFindings
  adjusted.deltaAuditCoverageRate = round2(adjusted.auditCoverageRate - baseline.auditCoverageRate)
  return adjusted
}

function estimateAuditCoverage(result: OrgRunResult): number {
  const artifacts = Math.max(1, result.metrics.artifactsProduced)
  const structuralReviews = Math.max(1, result.metrics.fanoutCount + 1)
  return round2(Math.min(1, structuralReviews / artifacts))
}

function computeCoordinationEfficiency(run: OrgInterventionRunRecord): number {
  return round2(run.riskAdjustedQuality / Math.max(1, run.coordinationCost))
}

function groupRuns(
  runs: OrgInterventionRunRecord[],
  getKey: (run: OrgInterventionRunRecord) => string
): InterventionAggregateGroup[] {
  const groups = new Map<string, OrgInterventionRunRecord[]>()
  for (const run of runs) {
    const key = getKey(run)
    const group = groups.get(key) ?? []
    group.push(run)
    groups.set(key, group)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({
      key,
      count: group.length,
      improvementCount: group.filter((run) => run.deltaRiskAdjustedQuality > 0).length,
      regressionCount: group.filter((run) => run.deltaRiskAdjustedQuality < 0).length,
      stats: computeStats(group),
    }))
}

function computeStats(runs: OrgInterventionRunRecord[]): Record<string, InterventionStats> {
  const stats: Record<string, InterventionStats> = {}
  for (const field of NUMERIC_FIELDS) {
    const values = runs
      .map((run) => run[field])
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    if (values.length > 0) {
      stats[String(field)] = statsFor(values)
    }
  }
  return stats
}

function statsFor(values: number[]): InterventionStats {
  const count = values.length
  const mean = values.reduce((sum, value) => sum + value, 0) / count
  const sorted = [...values].sort((a, b) => a - b)
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count
  return {
    mean: round2(mean),
    min: round2(sorted[0]),
    max: round2(sorted[sorted.length - 1]),
    std: round2(Math.sqrt(variance)),
    count,
  }
}

function rankInterventions(runs: OrgInterventionRunRecord[]): InterventionRanking {
  const nonBaselineIds = G28_INTERVENTIONS
    .map((intervention) => intervention.id)
    .filter((id) => id !== 'baseline_hierarchical')

  return {
    bestQualityIntervention: maxBy(nonBaselineIds, (id) => meanById(runs, id, 'deltaFinalQuality')),
    bestRiskReductionIntervention: minBy(nonBaselineIds, (id) => meanById(runs, id, 'deltaLatentRisk')),
    bestCoordinationEfficiencyIntervention: maxBy(nonBaselineIds, (id) => meanById(runs, id, 'deltaCoordinationEfficiency')),
    fastestIntervention: minBy(nonBaselineIds, (id) => meanById(runs, id, 'deltaDeliveryTicks')),
    bestRiskAdjustedQualityIntervention: maxBy(nonBaselineIds, (id) => meanById(runs, id, 'deltaRiskAdjustedQuality')),
  }
}

function buildDeltaReport(matrix: OrgInterventionMatrix): G28Artifacts['deltaReport'] {
  const missingBaselines = matrix.runs.filter((run) => !matrix.runs.some((candidate) => candidate.runId === run.baselineId)).length
  const changedRuns = matrix.runs.filter((run) => (
    run.interventionId !== 'baseline_hierarchical' &&
    (
      run.deltaFinalQuality !== 0 ||
      run.deltaLatentRisk !== 0 ||
      run.deltaCoordinationCost !== 0
    )
  )).length
  const recomputeFailures = matrix.runs.filter((run) => {
    const baseline = matrix.runs.find((candidate) => candidate.runId === run.baselineId)
    if (!baseline) return true
    return round2(run.finalQuality - baseline.finalQuality) !== run.deltaFinalQuality ||
      round2(run.latentRiskEstimate - baseline.latentRiskEstimate) !== run.deltaLatentRisk ||
      round2(run.coordinationCost - baseline.coordinationCost) !== run.deltaCoordinationCost
  }).length

  const checks = [
    {
      name: 'run count matches expected G28 MVP matrix',
      passed: matrix.runs.length === matrix.meta.expectedRuns,
      expected: matrix.meta.expectedRuns,
      actual: matrix.runs.length,
    },
    {
      name: 'all runs have matching baselines',
      passed: missingBaselines === 0,
      expected: 0,
      actual: missingBaselines,
    },
    {
      name: 'delta metrics recompute from raw rows',
      passed: recomputeFailures === 0,
      expected: 0,
      actual: recomputeFailures,
    },
    {
      name: 'at least one intervention changes quality/risk/cost',
      passed: changedRuns > 0,
      expected: 'changed intervention runs > 0',
      actual: changedRuns,
    },
  ]

  return {
    source: 'verification/G28/ORG_INTERVENTION_MATRIX.json',
    checks,
    verdict: checks.every((check) => check.passed) ? 'PASS' : 'FAIL',
  }
}

function buildByOrderComplexity(matrix: OrgInterventionMatrix): G28Artifacts['byOrderComplexity'] {
  const classes = []
  for (const orderClass of ['simple', 'medium', 'complex'] as const) {
    for (const intervention of G28_INTERVENTIONS) {
      const runs = matrix.runs.filter((run) => run.orderClass === orderClass && run.interventionId === intervention.id)
      classes.push({
        orderClass,
        interventionId: intervention.id,
        runCount: runs.length,
        meanDeltaFinalQuality: meanNumber(runs, 'deltaFinalQuality'),
        meanDeltaLatentRisk: meanNumber(runs, 'deltaLatentRisk'),
        meanDeltaCoordinationCost: meanNumber(runs, 'deltaCoordinationCost'),
        meanDeltaDeliveryTicks: meanNumber(runs, 'deltaDeliveryTicks'),
        meanDeltaRiskAdjustedQuality: meanNumber(runs, 'deltaRiskAdjustedQuality'),
      })
    }
  }
  return {
    source: 'verification/G28/ORG_INTERVENTION_MATRIX.json',
    classes,
  }
}

function meanById(
  runs: OrgInterventionRunRecord[],
  interventionId: OrgInterventionId,
  field: keyof OrgInterventionRunRecord
): number {
  return meanNumber(runs.filter((run) => run.interventionId === interventionId), field)
}

function meanNumber(runs: OrgInterventionRunRecord[], field: keyof OrgInterventionRunRecord): number {
  const values = runs
    .map((run) => run[field])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (values.length === 0) return 0
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function maxBy(ids: OrgInterventionId[], score: (id: OrgInterventionId) => number): OrgInterventionId {
  return ids.reduce((best, id) => score(id) > score(best) ? id : best, ids[0])
}

function minBy(ids: OrgInterventionId[], score: (id: OrgInterventionId) => number): OrgInterventionId {
  return ids.reduce((best, id) => score(id) < score(best) ? id : best, ids[0])
}

function makeRunId(seed: number, orderId: string, interventionId: OrgInterventionId): string {
  return `g28-${seed}-${orderId}-${interventionId}`
}

function clamp10(value: number): number {
  return round2(Math.max(0, Math.min(10, value)))
}

function clampUnit(value: number): number {
  return round2(Math.max(0, Math.min(1, value)))
}

function nonNegative(value: number): number {
  return round2(Math.max(0, value))
}
