// ============================================================
// G27: Flat vs Hierarchy Multi-Seed Study
// ============================================================
//
// Runs flat and hierarchical organization scenarios across
// multiple seeds, order classes, and modes. Computes aggregates
// and produces a machine-readable study matrix.
//
// Total runs: 8 seeds × 9 orders × 2 modes = 144
// ============================================================

import {
  ORG_STUDY_ORDERS,
  STUDY_SEEDS,
  STUDY_MODES,
  getOrdersByClass,
  type OrgStudyOrder,
  type StudyMode,
} from '../data/orgStudyOrders'
import { runFlatOrgScenario, runHierarchicalOrgScenario } from './orgScenarioRunner'
import type { OrgRunResult, OrgRunMetrics } from './orgModel'

// ============================================================
// Study Run Record
// ============================================================

export interface StudyRunRecord {
  seed: number
  mode: StudyMode
  orderId: string
  orderTitle: string
  orderClass: 'simple' | 'medium' | 'complex'
  orderComplexity: number
  result: OrgRunResult
}

// ============================================================
// Aggregate Types
// ============================================================

export interface MetricAggregate {
  mean: number
  min: number
  max: number
  std: number
  count: number
}

export type MetricField = keyof OrgRunMetrics

export interface ClassModeAggregates {
  orderClass: string
  mode: string
  count: number
  aggregates: Partial<Record<MetricField, MetricAggregate>>
}

export interface StudyMatrix {
  meta: {
    totalRuns: number
    seeds: number[]
    orderClasses: string[]
    modes: string[]
    generatedAt: string
  }
  runs: StudyRunRecord[]
  byClass: Record<string, ClassModeAggregates[]>
  summary: {
    flatMeanQuality: number
    hierarchicalMeanQuality: number
    flatMeanCoordinationCost: number
    hierarchicalMeanCoordinationCost: number
    flatMeanHandoffCount: number
    hierarchicalMeanHandoffCount: number
    flatMeanTicks: number
    hierarchicalMeanTicks: number
    flatMeanLatentRisk: number
    hierarchicalMeanLatentRisk: number
    qualityDelta: number
    coordinationDelta: number
    tickDelta: number
  }
}

// ============================================================
// Study Runner
// ============================================================

/**
 * Run the full multi-seed study matrix.
 * 8 seeds × 9 orders × 2 modes = 144 runs.
 */
export function runMultiSeedStudy(): StudyMatrix {
  const runs: StudyRunRecord[] = []

  for (const seed of STUDY_SEEDS) {
    for (const order of ORG_STUDY_ORDERS) {
      for (const mode of STUDY_MODES) {
        const orderParams = {
          id: order.id,
          title: order.title,
          complexity: order.complexity,
        }

        const result = mode === 'flat'
          ? runFlatOrgScenario(seed, orderParams)
          : runHierarchicalOrgScenario(seed, orderParams)

        runs.push({
          seed,
          mode,
          orderId: order.id,
          orderTitle: order.title,
          orderClass: order.class,
          orderComplexity: order.complexity,
          result,
        })
      }
    }
  }

  // Compute per-class aggregates
  const byClass: Record<string, ClassModeAggregates[]> = {}
  for (const cls of ['simple', 'medium', 'complex'] as const) {
    byClass[cls] = STUDY_MODES.map((mode) => {
      const classRuns = runs.filter((r) => r.orderClass === cls && r.mode === mode)
      return {
        orderClass: cls,
        mode,
        count: classRuns.length,
        aggregates: computeAggregates(classRuns.map((r) => r.result)),
      }
    })
  }

  // Summary across all runs
  const flatRuns = runs.filter((r) => r.mode === 'flat').map((r) => r.result)
  const hierarchicalRuns = runs.filter((r) => r.mode === 'hierarchical').map((r) => r.result)

  const flatQualityMean = meanOf(flatRuns, (r) => r.metrics.finalQuality)
  const hierQualityMean = meanOf(hierarchicalRuns, (r) => r.metrics.finalQuality)
  const flatCoordMean = meanOf(flatRuns, (r) => r.metrics.coordinationCost)
  const hierCoordMean = meanOf(hierarchicalRuns, (r) => r.metrics.coordinationCost)

  const summary = {
    flatMeanQuality: round2(flatQualityMean),
    hierarchicalMeanQuality: round2(hierQualityMean),
    flatMeanCoordinationCost: round2(flatCoordMean),
    hierarchicalMeanCoordinationCost: round2(hierCoordMean),
    flatMeanHandoffCount: round2(meanOf(flatRuns, (r) => r.metrics.handoffCount)),
    hierarchicalMeanHandoffCount: round2(meanOf(hierarchicalRuns, (r) => r.metrics.handoffCount)),
    flatMeanTicks: round2(meanOf(flatRuns, (r) => r.metrics.totalTicks)),
    hierarchicalMeanTicks: round2(meanOf(hierarchicalRuns, (r) => r.metrics.totalTicks)),
    flatMeanLatentRisk: round2(meanOf(flatRuns, (r) => r.metrics.latentRiskEstimate)),
    hierarchicalMeanLatentRisk: round2(meanOf(hierarchicalRuns, (r) => r.metrics.latentRiskEstimate)),
    qualityDelta: round2(hierQualityMean - flatQualityMean),
    coordinationDelta: round2(hierCoordMean - flatCoordMean),
    tickDelta: round2(
      meanOf(hierarchicalRuns, (r) => r.metrics.totalTicks) -
      meanOf(flatRuns, (r) => r.metrics.totalTicks)
    ),
  }

  return {
    meta: {
      totalRuns: runs.length,
      seeds: STUDY_SEEDS,
      orderClasses: ['simple', 'medium', 'complex'],
      modes: [...STUDY_MODES],
      generatedAt: new Date().toISOString(),
    },
    runs,
    byClass,
    summary,
  }
}

// ============================================================
// Aggregate Computation
// ============================================================

function computeAggregates(results: OrgRunResult[]): Partial<Record<MetricField, MetricAggregate>> {
  if (results.length === 0) return {}

  const fields: MetricField[] = [
    'finalQuality', 'finalEvidenceStrength', 'finalClaimLevel',
    'overclaimGap', 'detectedOverclaimFindings', 'latentRiskEstimate',
    'evidenceIntegrityDelta', 'coordinationCost', 'handoffCount',
    'fanoutCount', 'subtaskCount', 'mergeDelay', 'totalTicks',
    'leadUtilization', 'workerUtilization', 'artifactDiversity',
    'parallelWaste', 'artifactsProduced',
  ]

  const agg: Partial<Record<MetricField, MetricAggregate>> = {}
  for (const field of fields) {
    const values = results
      .map((r) => r.metrics[field])
      .filter((v): v is number => v !== null && v !== undefined)

    if (values.length === 0) continue

    const n = values.length
    const mean = values.reduce((s, v) => s + v, 0) / n
    const sorted = [...values].sort((a, b) => a - b)
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n

    agg[field] = {
      mean: round2(mean),
      min: round2(sorted[0]),
      max: round2(sorted[sorted.length - 1]),
      std: round2(Math.sqrt(variance)),
      count: n,
    }
  }

  return agg
}

// ============================================================
// Analysis Helpers
// ============================================================

/**
 * Compute efficiency ratio: quality per coordination cost.
 * Higher = more quality per unit of coordination overhead.
 */
export function qualityPerCoordinationCost(result: OrgRunResult): number {
  const cost = Math.max(1, result.metrics.coordinationCost)
  if (result.metrics.finalQuality === null) return 0
  return round2(result.metrics.finalQuality / cost)
}

/**
 * Risk-adjusted quality: quality minus latent risk estimate.
 * Higher = better true quality after accounting for hidden risk.
 */
export function riskAdjustedQuality(result: OrgRunResult): number {
  if (result.metrics.finalQuality === null) return 0
  return round2(result.metrics.finalQuality - result.metrics.latentRiskEstimate)
}

export function meanOf<T>(items: T[], fn: (item: T) => number | null): number {
  let sum = 0
  let count = 0
  for (const item of items) {
    const v = fn(item)
    if (v !== null && v !== undefined) {
      sum += v
      count++
    }
  }
  return count > 0 ? sum / count : 0
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Get all runs for a specific mode and order class.
 */
export function filterRuns(
  matrix: StudyMatrix,
  mode?: StudyMode,
  orderClass?: 'simple' | 'medium' | 'complex'
): StudyRunRecord[] {
  return matrix.runs.filter((r) => {
    if (mode && r.mode !== mode) return false
    if (orderClass && r.orderClass !== orderClass) return false
    return true
  })
}

/**
 * Simple finding: does hierarchy improve quality at the cost of coordination?
 */
export interface StudyFinding {
  claim: string
  metric: string
  flatValue: number
  hierarchicalValue: number
  delta: number
  direction: 'hierarchy_better' | 'flat_better' | 'neutral'
  confidence: 'high' | 'medium' | 'low'
  note: string
}

/**
 * Generate structured findings from the study matrix.
 */
export function generateFindings(matrix: StudyMatrix): StudyFinding[] {
  const flat = filterRuns(matrix, 'flat')
  const hier = filterRuns(matrix, 'hierarchical')

  const findings: StudyFinding[] = []

  // 1. Coordination cost comparison
  const flatCoord = meanOf(flat, (r) => r.result.metrics.coordinationCost)
  const hierCoord = meanOf(hier, (r) => r.result.metrics.coordinationCost)
  findings.push({
    claim: 'Hierarchical organization has higher coordination cost than flat',
    metric: 'coordinationCost',
    flatValue: round2(flatCoord),
    hierarchicalValue: round2(hierCoord),
    delta: round2(hierCoord - flatCoord),
    direction: 'flat_better',
    confidence: hierCoord > flatCoord ? 'high' : 'low',
    note: hierCoord > flatCoord
      ? `Hierarchy adds ${round2(hierCoord - flatCoord)} coordination cost on average`
      : 'Unexpected: hierarchy did not increase coordination cost',
  })

  // 2. Handoff count comparison
  const flatHandoff = meanOf(flat, (r) => r.result.metrics.handoffCount)
  const hierHandoff = meanOf(hier, (r) => r.result.metrics.handoffCount)
  findings.push({
    claim: 'Hierarchical organization has more handoff events',
    metric: 'handoffCount',
    flatValue: round2(flatHandoff),
    hierarchicalValue: round2(hierHandoff),
    delta: round2(hierHandoff - flatHandoff),
    direction: 'flat_better',
    confidence: hierHandoff > flatHandoff ? 'high' : 'low',
    note: `Hierarchy has ${round2(hierHandoff - flatHandoff)} more handoffs on average`,
  })

  // 3. Quality comparison
  const flatQual = meanOf(flat, (r) => r.result.metrics.finalQuality)
  const hierQual = meanOf(hier, (r) => r.result.metrics.finalQuality)
  findings.push({
    claim: 'Hierarchical organization quality vs flat',
    metric: 'finalQuality',
    flatValue: round2(flatQual),
    hierarchicalValue: round2(hierQual),
    delta: round2(hierQual - flatQual),
    direction: hierQual > flatQual ? 'hierarchy_better' : hierQual < flatQual ? 'flat_better' : 'neutral',
    confidence: Math.abs(hierQual - flatQual) > 0.5 ? 'medium' : 'low',
    note: `Quality delta: ${round2(hierQual - flatQual)}`,
  })

  // 4. Risk comparison (latent risk, not detected findings!)
  const flatRisk = meanOf(flat, (r) => r.result.metrics.latentRiskEstimate)
  const hierRisk = meanOf(hier, (r) => r.result.metrics.latentRiskEstimate)
  findings.push({
    claim: 'Hierarchical organization latent risk vs flat (lower risk = better)',
    metric: 'latentRiskEstimate',
    flatValue: round2(flatRisk),
    hierarchicalValue: round2(hierRisk),
    delta: round2(hierRisk - flatRisk),
    direction: hierRisk < flatRisk ? 'hierarchy_better' : hierRisk > flatRisk ? 'flat_better' : 'neutral',
    confidence: Math.abs(hierRisk - flatRisk) > 0.3 ? 'medium' : 'low',
    note: hierRisk < flatRisk
      ? 'Hierarchy reduces latent risk (better evidence discipline via merge/select)'
      : 'Hierarchy does not reduce latent risk in this study',
  })

  // 5. Complexity breakdown — complex orders
  const flatComplex = filterRuns(matrix, 'flat', 'complex')
  const hierComplex = filterRuns(matrix, 'hierarchical', 'complex')
  const flatComplexQual = meanOf(flatComplex, (r) => r.result.metrics.finalQuality)
  const hierComplexQual = meanOf(hierComplex, (r) => r.result.metrics.finalQuality)
  findings.push({
    claim: 'For complex orders, hierarchy quality vs flat',
    metric: 'finalQuality (complex only)',
    flatValue: round2(flatComplexQual),
    hierarchicalValue: round2(hierComplexQual),
    delta: round2(hierComplexQual - flatComplexQual),
    direction: hierComplexQual > flatComplexQual ? 'hierarchy_better' : 'flat_better',
    confidence: Math.abs(hierComplexQual - flatComplexQual) > 0.5 ? 'medium' : 'low',
    note: `Complex order quality delta: ${round2(hierComplexQual - flatComplexQual)}`,
  })

  // 6. Simple orders — hierarchy might not help
  const flatSimple = filterRuns(matrix, 'flat', 'simple')
  const hierSimple = filterRuns(matrix, 'hierarchical', 'simple')
  const flatSimpleQual = meanOf(flatSimple, (r) => r.result.metrics.finalQuality)
  const hierSimpleQual = meanOf(hierSimple, (r) => r.result.metrics.finalQuality)
  const flatSimpleTicks = meanOf(flatSimple, (r) => r.result.metrics.totalTicks)
  const hierSimpleTicks = meanOf(hierSimple, (r) => r.result.metrics.totalTicks)
  findings.push({
    claim: 'For simple orders, hierarchy adds overhead without quality benefit',
    metric: 'finalQuality (simple only)',
    flatValue: round2(flatSimpleQual),
    hierarchicalValue: round2(hierSimpleQual),
    delta: round2(hierSimpleQual - flatSimpleQual),
    direction: Math.abs(hierSimpleQual - flatSimpleQual) < 0.5 && hierSimpleTicks > flatSimpleTicks ? 'flat_better' : 'neutral',
    confidence: 'medium',
    note: `Simple order: quality delta=${round2(hierSimpleQual - flatSimpleQual)}, tick delta=${round2(hierSimpleTicks - flatSimpleTicks)}`,
  })

  return findings
}

/**
 * Export the full study matrix as a JSON-serializable object.
 */
export function exportStudyMatrix(matrix: StudyMatrix): string {
  return JSON.stringify(matrix, null, 2)
}
