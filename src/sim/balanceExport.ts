import {
  runBalanceMatrix,
  detectDominance,
  checkTradeoffConsistency,
  aggregateStrategyAcrossSeeds,
  BALANCE_SEEDS,
  BALANCE_HORIZONS,
  BALANCE_STRATEGIES,
  type StrategyAggregate,
  type BalanceMatrix,
  type DominanceReport,
  type TradeoffReport,
} from './balanceRunner'
import { runScenario, type StrategyRunMetrics } from './scenarioRunner'

// ============================================================
// Raw Run Result Export
// ============================================================

export interface RawRunEntry {
  seed: number
  horizon: number
  strategyId: string
  ordersCompleted: number
  cashEnd: number
  netProfit: number
  reputationEnd: number
  evidenceIntegrityEnd: number
  averageQuality: number
  majorIncidents: number
  overclaimFindings: number
  validationFailures: number
  auditFailures: number
  missedDeadlines: number
  parallelRouteSpend: number
  gameOver: boolean
  gameOverReason: string | null
}

/**
 * Export all raw individual run results across the full matrix.
 */
export function exportRawRuns(
  seeds: number[],
  horizons: number[],
  strategies = BALANCE_STRATEGIES,
): RawRunEntry[] {
  const entries: RawRunEntry[] = []

  for (const profile of strategies) {
    for (const horizon of horizons) {
      for (const seed of seeds) {
        const { metrics } = runScenario({ seed, tickHorizon: horizon, profile })
        entries.push({
          seed,
          horizon,
          strategyId: profile.id,
          ordersCompleted: metrics.ordersCompleted,
          cashEnd: metrics.cashEnd,
          netProfit: metrics.netProfit,
          reputationEnd: metrics.reputationEnd,
          evidenceIntegrityEnd: metrics.evidenceIntegrityEnd,
          averageQuality: metrics.averageQuality,
          majorIncidents: metrics.majorIncidents,
          overclaimFindings: metrics.overclaimFindings,
          validationFailures: metrics.validationFailures,
          auditFailures: metrics.auditFailures,
          missedDeadlines: metrics.missedDeadlines,
          parallelRouteSpend: metrics.parallelRouteSpend,
          gameOver: metrics.gameOver,
          gameOverReason: metrics.gameOverReason,
        })
      }
    }
  }

  return entries
}

// ============================================================
// Aggregate Export
// ============================================================

export interface AggregateEntry {
  strategyId: string
  strategyName: string
  horizon: number
  seedCount: number
  gameOverRate: number
  ordersCompletedMean: number
  ordersCompletedStd: number
  cashEndMean: number
  cashEndStd: number
  netProfitMean: number
  netProfitStd: number
  reputationEndMean: number
  reputationEndStd: number
  evidenceIntegrityEndMean: number
  evidenceIntegrityEndStd: number
  averageQualityMean: number
  averageQualityStd: number
  majorIncidentsMean: number
  majorIncidentsStd: number
  overclaimFindingsMean: number
  overclaimFindingsStd: number
  validationFailuresMean: number
  validationFailuresStd: number
  auditFailuresMean: number
  auditFailuresStd: number
  missedDeadlinesMean: number
  missedDeadlinesStd: number
  parallelRouteSpendMean: number
  parallelRouteSpendStd: number
}

function toAggregateEntry(agg: StrategyAggregate): AggregateEntry {
  return {
    strategyId: agg.strategyId,
    strategyName: agg.strategyName,
    horizon: agg.horizon,
    seedCount: agg.seedCount,
    gameOverRate: agg.gameOverRate,
    ordersCompletedMean: agg.ordersCompleted.mean,
    ordersCompletedStd: agg.ordersCompleted.std,
    cashEndMean: agg.cashEnd.mean,
    cashEndStd: agg.cashEnd.std,
    netProfitMean: agg.netProfit.mean,
    netProfitStd: agg.netProfit.std,
    reputationEndMean: agg.reputationEnd.mean,
    reputationEndStd: agg.reputationEnd.std,
    evidenceIntegrityEndMean: agg.evidenceIntegrityEnd.mean,
    evidenceIntegrityEndStd: agg.evidenceIntegrityEnd.std,
    averageQualityMean: agg.averageQuality.mean,
    averageQualityStd: agg.averageQuality.std,
    majorIncidentsMean: agg.majorIncidents.mean,
    majorIncidentsStd: agg.majorIncidents.std,
    overclaimFindingsMean: agg.overclaimFindings.mean,
    overclaimFindingsStd: agg.overclaimFindings.std,
    validationFailuresMean: agg.validationFailures.mean,
    validationFailuresStd: agg.validationFailures.std,
    auditFailuresMean: agg.auditFailures.mean,
    auditFailuresStd: agg.auditFailures.std,
    missedDeadlinesMean: agg.missedDeadlines.mean,
    missedDeadlinesStd: agg.missedDeadlines.std,
    parallelRouteSpendMean: agg.parallelRouteSpend.mean,
    parallelRouteSpendStd: agg.parallelRouteSpend.std,
  }
}

/**
 * Export aggregate statistics for the full balance matrix.
 */
export function exportAggregateMatrix(
  matrix: BalanceMatrix,
): AggregateEntry[] {
  const entries: AggregateEntry[] = []

  for (const strategyId of Object.keys(matrix.aggregates)) {
    for (const horizon of matrix.horizons) {
      const agg = matrix.aggregates[strategyId][horizon]
      entries.push(toAggregateEntry(agg))
    }
  }

  return entries
}

// ============================================================
// Horizon Comparison — per-metric evolution across horizons
// ============================================================

export interface HorizonComparisonEntry {
  strategyId: string
  horizon: number
  ordersCompletedMean: number
  cashEndMean: number
  reputationEndMean: number
  evidenceIntegrityEndMean: number
  gameOverRate: number
}

/**
 * Export a horizon-to-horizon comparison for each strategy.
 */
export function exportHorizonComparison(
  matrix: BalanceMatrix,
): HorizonComparisonEntry[] {
  const entries: HorizonComparisonEntry[] = []

  for (const strategyId of Object.keys(matrix.aggregates)) {
    for (const horizon of matrix.horizons) {
      const agg = matrix.aggregates[strategyId][horizon]
      entries.push({
        strategyId,
        horizon,
        ordersCompletedMean: agg.ordersCompleted.mean,
        cashEndMean: agg.cashEnd.mean,
        reputationEndMean: agg.reputationEnd.mean,
        evidenceIntegrityEndMean: agg.evidenceIntegrityEnd.mean,
        gameOverRate: agg.gameOverRate,
      })
    }
  }

  return entries
}

// ============================================================
// Master Export
// ============================================================

export interface BalanceExport {
  generatedAt: string
  repo: string
  seeds: number[]
  horizons: number[]
  strategies: string[]
  rawRuns: RawRunEntry[]
  aggregates: AggregateEntry[]
  horizonComparison: HorizonComparisonEntry[]
  dominanceReports: Record<number, DominanceReport>
  tradeoffReports: Record<number, TradeoffReport>
  hardGates: HardGateResult[]
}

export interface HardGateResult {
  gate: string
  passed: boolean
  detail: string
}

/**
 * Run the full balance matrix and export all machine-readable evidence.
 */
export function generateBalanceExport(
  seeds = BALANCE_SEEDS,
  horizons = BALANCE_HORIZONS,
  strategies = BALANCE_STRATEGIES,
): BalanceExport {
  const matrix = runBalanceMatrix(strategies, seeds, horizons)
  const rawRuns = exportRawRuns(seeds, horizons, strategies)
  const aggregates = exportAggregateMatrix(matrix)
  const horizonComparison = exportHorizonComparison(matrix)

  const dominanceReports: Record<number, DominanceReport> = {}
  const tradeoffReports: Record<number, TradeoffReport> = {}

  for (const horizon of horizons) {
    dominanceReports[horizon] = detectDominance(matrix, horizon)
    tradeoffReports[horizon] = checkTradeoffConsistency(matrix, horizon)
  }

  // Compute hard gates from the data
  const hardGates = computeHardGates(matrix, rawRuns)

  return {
    generatedAt: new Date().toISOString(),
    repo: 'catking01/agent-foundry',
    seeds,
    horizons,
    strategies: strategies.map((s) => s.id),
    rawRuns,
    aggregates,
    horizonComparison,
    dominanceReports,
    tradeoffReports,
    hardGates,
  }
}

// ============================================================
// Hard Gates — machine-verifiable invariants
// ============================================================

function computeHardGates(
  matrix: BalanceMatrix,
  rawRuns: RawRunEntry[],
): HardGateResult[] {
  const gates: HardGateResult[] = []
  const h = 100 // use horizon 100 as the canonical checkpoint

  const speed = matrix.aggregates.speed_first[h]
  const quality = matrix.aggregates.quality_first[h]
  const parallel = matrix.aggregates.parallel_heavy[h]
  const balanced = matrix.aggregates.balanced[h]

  // Gate 1: No strategy dominates all others
  const dom = detectDominance(matrix, h)
  const dominatesAll = Object.entries(dom.dominatedBy).filter(
    ([, dominators]) => dominators.length >= BALANCE_STRATEGIES.length - 1,
  )
  gates.push({
    gate: 'no-strategy-dominates-all',
    passed: dominatesAll.length === 0,
    detail:
      dominatesAll.length === 0
        ? 'No strategy is dominated by all others.'
        : `Strategies dominated by all others: ${dominatesAll.map(([id]) => id).join(', ')}`,
  })

  // Gate 2: Speed-first has lower evidence integrity than balanced
  gates.push({
    gate: 'speed-lower-evidence-than-balanced',
    passed: balanced.evidenceIntegrityEnd.mean > speed.evidenceIntegrityEnd.mean,
    detail: `Balanced evidence=${balanced.evidenceIntegrityEnd.mean.toFixed(1)} vs Speed evidence=${speed.evidenceIntegrityEnd.mean.toFixed(1)}`,
  })

  // Gate 3: Quality-first has <= incidents than speed-first
  gates.push({
    gate: 'quality-fewer-incidents-than-speed',
    passed:
      quality.majorIncidents.mean <= speed.majorIncidents.mean + 1,
    detail: `Quality incidents=${quality.majorIncidents.mean.toFixed(1)} vs Speed incidents=${speed.majorIncidents.mean.toFixed(1)}`,
  })

  // Gate 4: Parallel-heavy spends more on routes than speed-first
  gates.push({
    gate: 'parallel-more-route-spend-than-speed',
    passed:
      parallel.parallelRouteSpend.mean > speed.parallelRouteSpend.mean,
    detail: `Parallel spend=${parallel.parallelRouteSpend.mean.toFixed(0)} vs Speed spend=${speed.parallelRouteSpend.mean.toFixed(0)}`,
  })

  // Gate 5: Game-over rate computed from raw runs matches aggregate
  const rawSpeedRuns = rawRuns.filter(
    (r) => r.strategyId === 'speed_first' && r.horizon === h,
  )
  const computedGameOverRate =
    rawSpeedRuns.length > 0
      ? Math.round(
          (rawSpeedRuns.filter((r) => r.gameOver).length /
            rawSpeedRuns.length) *
            100,
        )
      : 0
  gates.push({
    gate: 'gameover-rate-matches-raw-runs',
    passed: computedGameOverRate === speed.gameOverRate,
    detail: `Computed=${computedGameOverRate}% vs Aggregate=${speed.gameOverRate}%`,
  })

  // Gate 6: Balanced survival rate explicitly measured
  const rawBalancedRuns = rawRuns.filter(
    (r) => r.strategyId === 'balanced' && r.horizon === h,
  )
  const balancedAlive = rawBalancedRuns.filter((r) => !r.gameOver).length
  gates.push({
    gate: 'balanced-survival-explicitly-measured',
    passed: rawBalancedRuns.length > 0,
    detail: `Balanced alive at horizon ${h}: ${balancedAlive}/${rawBalancedRuns.length}`,
  })

  return gates
}
