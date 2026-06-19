import {
  ORG_STUDY_ORDERS,
  STUDY_MODES,
  STUDY_SEEDS,
  type StudyMode,
} from '../data/orgStudyOrders'
import {
  filterRuns,
  generateFindings,
  meanOf,
  qualityPerCoordinationCost,
  riskAdjustedQuality,
  round2,
  type StudyMatrix,
  type StudyRunRecord,
} from './orgMultiSeedStudy'

export interface G27SealRunRecord {
  seed: number
  mode: StudyMode
  orderClass: 'simple' | 'medium' | 'complex'
  orderClassInstanceIndex: number
  orderClassInstanceCount: number
  orderId: string
  orderTitle: string
  orderComplexity: number
  deliveryTicks: number
  finalQuality: number | null
  finalEvidenceStrength: number | null
  finalClaimLevel: number | null
  claimEvidenceGap: number | null
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
  bottleneckUnitId: string | null
  parallelWaste: number
  mergeQualityGain: number
  qualityPerTick: number
  riskAdjustedQuality: number
  coordinationEfficiency: number
}

export interface G27RawMatrixArtifact {
  meta: {
    milestone: 'G27-S1'
    sourceMilestone: 'G27'
    shape: string
    expectedRuns: number
    actualRuns: number
    seeds: number[]
    modes: StudyMode[]
    orderClasses: string[]
    orderInstancesPerClass: number
    extraDimension: string
    generatedAt: string
    riskSemantics: {
      detectedOverclaimFindings: string
      latentRiskEstimate: string
      evidenceIntegrityDelta: string
      auditCoverageRate: string
      undetectedOverclaimExposure: string
    }
  }
  runs: G27SealRunRecord[]
}

export interface NumericStats {
  mean: number
  min: number
  max: number
  std: number
  count: number
}

export interface G27AggregateGroup {
  key: string
  count: number
  stats: Record<string, NumericStats>
}

export interface G27AggregateArtifact {
  meta: {
    source: string
    totalRuns: number
    numericFields: string[]
  }
  byMode: G27AggregateGroup[]
  byOrderClass: G27AggregateGroup[]
  byModeAndOrderClass: G27AggregateGroup[]
  byOrderInstance: G27AggregateGroup[]
}

export interface G27ComplexityBreakdownArtifact {
  meta: {
    source: string
    interpretation: string
  }
  classes: Array<{
    orderClass: string
    flatRuns: number
    hierarchicalRuns: number
    flatMeanQuality: number
    hierarchicalMeanQuality: number
    qualityDelta: number
    flatMeanTicks: number
    hierarchicalMeanTicks: number
    tickDelta: number
    flatMeanRiskAdjustedQuality: number
    hierarchicalMeanRiskAdjustedQuality: number
    riskAdjustedQualityDelta: number
    flatMeanCoordinationCost: number
    hierarchicalMeanCoordinationCost: number
    coordinationDelta: number
    flatMeanLatentRisk: number
    hierarchicalMeanLatentRisk: number
    latentRiskDelta: number
    hierarchyHelps: boolean
    hierarchyHurts: boolean
    note: string
  }>
}

export interface G27CoordinationCostCurveArtifact {
  meta: {
    source: string
    formula: string
  }
  points: Array<{
    orderClass: string
    orderComplexity: number
    mode: StudyMode
    runCount: number
    meanCoordinationCost: number
    meanMergeQualityGain: number
    meanCoordinationEfficiency: number
    meanQualityPerTick: number
    meanDeliveryTicks: number
  }>
}

export interface G27AggregateRecomputeCheckArtifact {
  meta: {
    sourceMatrix: string
    sourceAggregates: string
    expectedRuns: number
    actualRuns: number
  }
  checks: Array<{
    name: string
    passed: boolean
    expected: number | string | string[] | number[]
    actual: number | string | string[] | number[]
  }>
  verdict: 'PASS' | 'FAIL'
}

const NUMERIC_FIELDS: Array<keyof G27SealRunRecord> = [
  'deliveryTicks',
  'orderComplexity',
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
  'mergeQualityGain',
  'qualityPerTick',
  'riskAdjustedQuality',
  'coordinationEfficiency',
]

export function buildG27RawMatrixArtifact(matrix: StudyMatrix, generatedAt: string): G27RawMatrixArtifact {
  const runs = flattenStudyMatrixForSeal(matrix)
  return {
    meta: {
      milestone: 'G27-S1',
      sourceMilestone: 'G27',
      shape: '8 seeds x 2 modes x 3 order classes x 3 order instances per class = 144 runs',
      expectedRuns: STUDY_SEEDS.length * STUDY_MODES.length * 3 * 3,
      actualRuns: runs.length,
      seeds: [...STUDY_SEEDS],
      modes: [...STUDY_MODES],
      orderClasses: ['simple', 'medium', 'complex'],
      orderInstancesPerClass: 3,
      extraDimension: 'orderClassInstanceIndex: three concrete order instances per complexity class',
      generatedAt,
      riskSemantics: {
        detectedOverclaimFindings: 'DETECTION metric: findings discovered by audit/checking, not actual generated risk.',
        latentRiskEstimate: 'EXPOSURE metric: estimated hidden risk used for risk comparison.',
        evidenceIntegrityDelta: 'OUTCOME metric in the source run: evidence strength minus claim level.',
        auditCoverageRate: 'Derived structural coverage proxy for artifact sealing, based on review/merge structure.',
        undetectedOverclaimExposure: 'Derived exposure proxy: latentRiskEstimate x (1 - auditCoverageRate).',
      },
    },
    runs,
  }
}

export function flattenStudyMatrixForSeal(matrix: StudyMatrix): G27SealRunRecord[] {
  return matrix.runs.map((run) => flattenRun(run, matrix))
}

export function buildG27AggregateArtifact(raw: G27RawMatrixArtifact): G27AggregateArtifact {
  return {
    meta: {
      source: 'verification/G27/ORG_MULTI_SEED_MATRIX.json',
      totalRuns: raw.runs.length,
      numericFields: NUMERIC_FIELDS.map(String),
    },
    byMode: groupBy(raw.runs, (r) => r.mode),
    byOrderClass: groupBy(raw.runs, (r) => r.orderClass),
    byModeAndOrderClass: groupBy(raw.runs, (r) => `${r.mode}:${r.orderClass}`),
    byOrderInstance: groupBy(raw.runs, (r) => `${r.orderClass}:${r.orderId}`),
  }
}

export function buildG27ComplexityBreakdownArtifact(
  raw: G27RawMatrixArtifact
): G27ComplexityBreakdownArtifact {
  const classes = ['simple', 'medium', 'complex'].map((orderClass) => {
    const flat = raw.runs.filter((r) => r.orderClass === orderClass && r.mode === 'flat')
    const hierarchical = raw.runs.filter((r) => r.orderClass === orderClass && r.mode === 'hierarchical')
    const flatMeanQuality = meanFlat(flat, 'finalQuality')
    const hierarchicalMeanQuality = meanFlat(hierarchical, 'finalQuality')
    const flatMeanTicks = meanFlat(flat, 'deliveryTicks')
    const hierarchicalMeanTicks = meanFlat(hierarchical, 'deliveryTicks')
    const flatMeanRiskAdjustedQuality = meanFlat(flat, 'riskAdjustedQuality')
    const hierarchicalMeanRiskAdjustedQuality = meanFlat(hierarchical, 'riskAdjustedQuality')
    const flatMeanCoordinationCost = meanFlat(flat, 'coordinationCost')
    const hierarchicalMeanCoordinationCost = meanFlat(hierarchical, 'coordinationCost')
    const flatMeanLatentRisk = meanFlat(flat, 'latentRiskEstimate')
    const hierarchicalMeanLatentRisk = meanFlat(hierarchical, 'latentRiskEstimate')

    const riskAdjustedQualityDelta = round2(hierarchicalMeanRiskAdjustedQuality - flatMeanRiskAdjustedQuality)
    const coordinationDelta = round2(hierarchicalMeanCoordinationCost - flatMeanCoordinationCost)
    const qualityDelta = round2(hierarchicalMeanQuality - flatMeanQuality)

    return {
      orderClass,
      flatRuns: flat.length,
      hierarchicalRuns: hierarchical.length,
      flatMeanQuality,
      hierarchicalMeanQuality,
      qualityDelta,
      flatMeanTicks,
      hierarchicalMeanTicks,
      tickDelta: round2(hierarchicalMeanTicks - flatMeanTicks),
      flatMeanRiskAdjustedQuality,
      hierarchicalMeanRiskAdjustedQuality,
      riskAdjustedQualityDelta,
      flatMeanCoordinationCost,
      hierarchicalMeanCoordinationCost,
      coordinationDelta,
      flatMeanLatentRisk,
      hierarchicalMeanLatentRisk,
      latentRiskDelta: round2(hierarchicalMeanLatentRisk - flatMeanLatentRisk),
      hierarchyHelps: riskAdjustedQualityDelta > 0 && qualityDelta >= 0,
      hierarchyHurts: coordinationDelta > 0 && riskAdjustedQualityDelta <= 0,
      note: buildComplexityNote(orderClass, qualityDelta, riskAdjustedQualityDelta, coordinationDelta),
    }
  })

  return {
    meta: {
      source: 'verification/G27/ORG_MULTI_SEED_MATRIX.json',
      interpretation: 'Comparisons are scoped to deterministic G27 simulation outputs, not real organizations.',
    },
    classes,
  }
}

export function buildG27CoordinationCostCurveArtifact(
  raw: G27RawMatrixArtifact
): G27CoordinationCostCurveArtifact {
  const points = []

  for (const order of ORG_STUDY_ORDERS) {
    for (const mode of STUDY_MODES) {
      const runs = raw.runs.filter((r) => r.orderId === order.id && r.mode === mode)
      points.push({
        orderClass: order.class,
        orderComplexity: order.complexity,
        mode,
        runCount: runs.length,
        meanCoordinationCost: meanFlat(runs, 'coordinationCost'),
        meanMergeQualityGain: meanFlat(runs, 'mergeQualityGain'),
        meanCoordinationEfficiency: meanFlat(runs, 'coordinationEfficiency'),
        meanQualityPerTick: meanFlat(runs, 'qualityPerTick'),
        meanDeliveryTicks: meanFlat(runs, 'deliveryTicks'),
      })
    }
  }

  return {
    meta: {
      source: 'verification/G27/ORG_MULTI_SEED_MATRIX.json',
      formula: 'coordinationEfficiency = mergeQualityGain / max(1, coordinationCost); flat mergeQualityGain is 0.',
    },
    points,
  }
}

export function buildG27AggregateRecomputeCheckArtifact(
  raw: G27RawMatrixArtifact,
  aggregates: G27AggregateArtifact
): G27AggregateRecomputeCheckArtifact {
  const checks = [
    {
      name: 'run count matches documented expected count',
      passed: raw.runs.length === raw.meta.expectedRuns,
      expected: raw.meta.expectedRuns,
      actual: raw.runs.length,
    },
    {
      name: 'all seeds covered',
      passed: setEquals(new Set(raw.runs.map((r) => r.seed)), new Set(STUDY_SEEDS)),
      expected: STUDY_SEEDS,
      actual: [...new Set(raw.runs.map((r) => r.seed))].sort((a, b) => a - b),
    },
    {
      name: 'all modes covered',
      passed: setEquals(new Set(raw.runs.map((r) => r.mode)), new Set(STUDY_MODES)),
      expected: [...STUDY_MODES],
      actual: [...new Set(raw.runs.map((r) => r.mode))].sort(),
    },
    {
      name: 'all order classes covered',
      passed: setEquals(new Set(raw.runs.map((r) => r.orderClass)), new Set(['simple', 'medium', 'complex'])),
      expected: ['complex', 'medium', 'simple'],
      actual: [...new Set(raw.runs.map((r) => r.orderClass))].sort(),
    },
    {
      name: 'no missing seed/mode/order combinations',
      passed: countMissingCombinations(raw.runs) === 0,
      expected: 0,
      actual: countMissingCombinations(raw.runs),
    },
    {
      name: 'aggregate finalQuality mean recomputes by mode',
      passed: modeMeanMatches(raw, aggregates, 'finalQuality'),
      expected: 'byMode finalQuality mean from raw matrix',
      actual: 'matched',
    },
    {
      name: 'aggregate coordinationCost mean recomputes by mode',
      passed: modeMeanMatches(raw, aggregates, 'coordinationCost'),
      expected: 'byMode coordinationCost mean from raw matrix',
      actual: 'matched',
    },
    {
      name: 'detected findings separated from latent risk',
      passed: raw.runs.some((r) => r.detectedOverclaimFindings !== r.latentRiskEstimate),
      expected: 'detectedOverclaimFindings is not treated as latentRiskEstimate',
      actual: 'distinct values observed',
    },
  ]

  return {
    meta: {
      sourceMatrix: 'verification/G27/ORG_MULTI_SEED_MATRIX.json',
      sourceAggregates: 'verification/G27/FLAT_VS_HIERARCHY_AGGREGATES.json',
      expectedRuns: raw.meta.expectedRuns,
      actualRuns: raw.runs.length,
    },
    checks,
    verdict: checks.every((c) => c.passed) ? 'PASS' : 'FAIL',
  }
}

export function buildG27SealArtifacts(matrix: StudyMatrix, generatedAt: string) {
  const raw = buildG27RawMatrixArtifact(matrix, generatedAt)
  const aggregates = buildG27AggregateArtifact(raw)
  const complexityBreakdown = buildG27ComplexityBreakdownArtifact(raw)
  const coordinationCostCurve = buildG27CoordinationCostCurveArtifact(raw)
  const recomputeCheck = buildG27AggregateRecomputeCheckArtifact(raw, aggregates)
  const findings = generateFindings(matrix)

  return {
    raw,
    aggregates,
    complexityBreakdown,
    coordinationCostCurve,
    recomputeCheck,
    findings,
  }
}

function flattenRun(run: StudyRunRecord, matrix: StudyMatrix): G27SealRunRecord {
  const matchingFlat = matrix.runs.find(
    (candidate) =>
      candidate.seed === run.seed &&
      candidate.orderId === run.orderId &&
      candidate.mode === 'flat'
  )
  const metric = run.result.metrics
  const orderClassInstances = ORG_STUDY_ORDERS.filter((order) => order.class === run.orderClass)
  const orderClassInstanceIndex = orderClassInstances.findIndex((order) => order.id === run.orderId) + 1
  const auditCoverageRate = estimateAuditCoverage(run)
  const mergeQualityGain = run.mode === 'hierarchical'
    ? round2((metric.finalQuality ?? 0) - (matchingFlat?.result.metrics.finalQuality ?? 0))
    : 0

  return {
    seed: run.seed,
    mode: run.mode,
    orderClass: run.orderClass,
    orderClassInstanceIndex,
    orderClassInstanceCount: orderClassInstances.length,
    orderId: run.orderId,
    orderTitle: run.orderTitle,
    orderComplexity: run.orderComplexity,
    deliveryTicks: metric.totalTicks,
    finalQuality: metric.finalQuality,
    finalEvidenceStrength: metric.finalEvidenceStrength,
    finalClaimLevel: metric.finalClaimLevel,
    claimEvidenceGap: metric.overclaimGap,
    detectedOverclaimFindings: metric.detectedOverclaimFindings,
    latentRiskEstimate: metric.latentRiskEstimate,
    undetectedOverclaimExposure: round2(metric.latentRiskEstimate * (1 - auditCoverageRate)),
    auditCoverageRate,
    coordinationCost: metric.coordinationCost,
    handoffCount: metric.handoffCount,
    fanoutCount: metric.fanoutCount,
    subtaskCount: metric.subtaskCount,
    mergeDelay: metric.mergeDelay,
    leadUtilization: metric.leadUtilization,
    workerUtilization: metric.workerUtilization,
    bottleneckUnitId: metric.bottleneckUnitId,
    parallelWaste: metric.parallelWaste,
    mergeQualityGain,
    qualityPerTick: metric.finalQuality === null ? 0 : round2(metric.finalQuality / Math.max(1, metric.totalTicks)),
    riskAdjustedQuality: riskAdjustedQuality(run.result),
    coordinationEfficiency: round2(mergeQualityGain / Math.max(1, metric.coordinationCost)),
  }
}

function estimateAuditCoverage(run: StudyRunRecord): number {
  const metric = run.result.metrics
  if (metric.artifactsProduced <= 0) return 0
  if (run.mode === 'flat') {
    return round2(1 / metric.artifactsProduced)
  }
  const structuralReviewEvents = Math.max(1, metric.fanoutCount + 1)
  return round2(Math.min(1, structuralReviewEvents / metric.artifactsProduced))
}

function groupBy(runs: G27SealRunRecord[], getKey: (run: G27SealRunRecord) => string): G27AggregateGroup[] {
  const groups = new Map<string, G27SealRunRecord[]>()
  for (const run of runs) {
    const key = getKey(run)
    const bucket = groups.get(key) ?? []
    bucket.push(run)
    groups.set(key, bucket)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupRuns]) => ({
      key,
      count: groupRuns.length,
      stats: computeStats(groupRuns),
    }))
}

function computeStats(runs: G27SealRunRecord[]): Record<string, NumericStats> {
  const stats: Record<string, NumericStats> = {}
  for (const field of NUMERIC_FIELDS) {
    const values = runs
      .map((run) => run[field])
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    if (values.length === 0) continue
    stats[String(field)] = statsFor(values)
  }
  return stats
}

function statsFor(values: number[]): NumericStats {
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

function meanFlat(runs: G27SealRunRecord[], field: keyof G27SealRunRecord): number {
  return round2(meanOf(runs, (run) => {
    const value = run[field]
    return typeof value === 'number' ? value : null
  }))
}

function buildComplexityNote(
  orderClass: string,
  qualityDelta: number,
  riskAdjustedQualityDelta: number,
  coordinationDelta: number
): string {
  if (riskAdjustedQualityDelta > 0 && qualityDelta >= 0) {
    return `${orderClass}: hierarchy improves risk-adjusted quality in this deterministic matrix, with ${coordinationDelta} added coordination cost.`
  }
  return `${orderClass}: hierarchy adds ${coordinationDelta} coordination cost without a positive risk-adjusted quality delta.`
}

function setEquals<T>(left: Set<T>, right: Set<T>): boolean {
  if (left.size !== right.size) return false
  for (const value of left) {
    if (!right.has(value)) return false
  }
  return true
}

function countMissingCombinations(runs: G27SealRunRecord[]): number {
  let missing = 0
  for (const seed of STUDY_SEEDS) {
    for (const order of ORG_STUDY_ORDERS) {
      for (const mode of STUDY_MODES) {
        const match = runs.find((run) => (
          run.seed === seed &&
          run.orderId === order.id &&
          run.mode === mode
        ))
        if (!match) missing++
      }
    }
  }
  return missing
}

function modeMeanMatches(
  raw: G27RawMatrixArtifact,
  aggregates: G27AggregateArtifact,
  field: keyof G27SealRunRecord
): boolean {
  for (const mode of STUDY_MODES) {
    const rawMean = meanFlat(raw.runs.filter((run) => run.mode === mode), field)
    const aggregateMean = aggregates.byMode.find((group) => group.key === mode)?.stats[String(field)]?.mean
    if (aggregateMean !== rawMean) return false
  }
  return true
}

export function assertG27SealArtifactsComplete(artifacts: ReturnType<typeof buildG27SealArtifacts>): void {
  if (artifacts.raw.runs.length !== artifacts.raw.meta.expectedRuns) {
    throw new Error(`Expected ${artifacts.raw.meta.expectedRuns} raw runs, got ${artifacts.raw.runs.length}`)
  }
  if (artifacts.recomputeCheck.verdict !== 'PASS') {
    throw new Error('G27 aggregate recompute check failed')
  }
  if (artifacts.complexityBreakdown.classes.length !== 3) {
    throw new Error('Expected simple, medium, and complex order breakdowns')
  }
  if (artifacts.coordinationCostCurve.points.length !== ORG_STUDY_ORDERS.length * STUDY_MODES.length) {
    throw new Error('Coordination cost curve does not cover every order/mode pair')
  }
  const detectedAsRisk = artifacts.raw.runs.every((run) => (
    run.detectedOverclaimFindings === run.latentRiskEstimate
  ))
  if (detectedAsRisk) {
    throw new Error('Risk semantics check failed: detected findings collapsed into latent risk')
  }
}
