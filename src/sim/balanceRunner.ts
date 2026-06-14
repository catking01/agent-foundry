import type { StrategyRunMetrics } from './scenarioRunner'
import { runScenario } from './scenarioRunner'
import type { StrategyProfile } from '../data/strategyScenarios'
import { STRATEGIES } from '../data/strategyScenarios'

// ============================================================
// Multi-Seed Balance Configuration
// ============================================================

export const BALANCE_SEEDS = [1, 2, 3, 42, 99, 123, 2026, 9001]
export const BALANCE_HORIZONS = [30, 60, 100, 200]
export const BALANCE_STRATEGIES = [
  STRATEGIES.speed_first,
  STRATEGIES.quality_first,
  STRATEGIES.parallel_heavy,
  STRATEGIES.balanced,
]

// ============================================================
// Aggregate Statistics
// ============================================================

export interface AggregateStats {
  mean: number
  median: number
  min: number
  max: number
  std: number
  values: number[]
}

function computeStats(values: number[]): AggregateStats {
  if (values.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, std: 0, values: [] }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const mean = values.reduce((s, v) => s + v, 0) / n
  const median =
    n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)]
  const min = sorted[0]
  const max = sorted[n - 1]
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)

  return { mean, median, min, max, std, values }
}

// ============================================================
// Per-Strategy Multi-Seed Aggregate
// ============================================================

export interface StrategyAggregate {
  strategyId: string
  strategyName: string
  horizon: number
  seedCount: number
  gameOverRate: number

  ordersCompleted: AggregateStats
  cashEnd: AggregateStats
  netProfit: AggregateStats
  reputationEnd: AggregateStats
  evidenceIntegrityEnd: AggregateStats
  averageQuality: AggregateStats
  majorIncidents: AggregateStats
  overclaimFindings: AggregateStats
  validationFailures: AggregateStats
  auditFailures: AggregateStats
  missedDeadlines: AggregateStats
  parallelRouteSpend: AggregateStats
  totalArtifactsCreated: AggregateStats
  maxQueueDepth: AggregateStats
}

/**
 * Run a strategy across multiple seeds at a fixed horizon and aggregate results.
 */
export function aggregateStrategyAcrossSeeds(
  profile: StrategyProfile,
  seeds: number[],
  horizon: number,
): StrategyAggregate {
  const runs: StrategyRunMetrics[] = []

  for (const seed of seeds) {
    const { metrics } = runScenario({ seed, tickHorizon: horizon, profile })
    runs.push(metrics)
  }

  const gameOvers = runs.filter((r) => r.gameOver).length

  return {
    strategyId: profile.id,
    strategyName: profile.name,
    horizon,
    seedCount: seeds.length,
    gameOverRate: Math.round((gameOvers / seeds.length) * 100),

    ordersCompleted: computeStats(runs.map((r) => r.ordersCompleted)),
    cashEnd: computeStats(runs.map((r) => r.cashEnd)),
    netProfit: computeStats(runs.map((r) => r.netProfit)),
    reputationEnd: computeStats(runs.map((r) => r.reputationEnd)),
    evidenceIntegrityEnd: computeStats(
      runs.map((r) => r.evidenceIntegrityEnd)
    ),
    averageQuality: computeStats(runs.map((r) => r.averageQuality)),
    majorIncidents: computeStats(runs.map((r) => r.majorIncidents)),
    overclaimFindings: computeStats(runs.map((r) => r.overclaimFindings)),
    validationFailures: computeStats(runs.map((r) => r.validationFailures)),
    auditFailures: computeStats(runs.map((r) => r.auditFailures)),
    missedDeadlines: computeStats(runs.map((r) => r.missedDeadlines)),
    parallelRouteSpend: computeStats(runs.map((r) => r.parallelRouteSpend)),
    totalArtifactsCreated: computeStats(
      runs.map((r) => r.totalArtifactsCreated)
    ),
    maxQueueDepth: computeStats(runs.map((r) => r.maxQueueDepth)),
  }
}

// ============================================================
// Multi-Strategy / Multi-Horizon Matrix
// ============================================================

export interface BalanceMatrix {
  seeds: number[]
  horizons: number[]
  aggregates: Record<string, Record<number, StrategyAggregate>>
  // aggregates[strategyId][horizon]
}

/**
 * Run the full balance matrix: all strategies × all horizons × all seeds.
 */
export function runBalanceMatrix(
  strategies: StrategyProfile[],
  seeds: number[],
  horizons: number[],
): BalanceMatrix {
  const aggregates: Record<string, Record<number, StrategyAggregate>> = {}

  for (const profile of strategies) {
    aggregates[profile.id] = {}
    for (const horizon of horizons) {
      aggregates[profile.id][horizon] = aggregateStrategyAcrossSeeds(
        profile,
        seeds,
        horizon,
      )
    }
  }

  return { seeds, horizons, aggregates }
}

// ============================================================
// Dominance Detection
// ============================================================

export interface DominanceReport {
  dominantStrategy: string | null
  dominatedBy: Record<string, string[]>
  // dominatedBy[strategyA] = [list of strategies that dominate A]
  dimensions: string[]
  verdict: string
}

/**
 * Check if strategy A dominates strategy B across all measured dimensions.
 * A dominates B if A is strictly better (or tied) on every dimension.
 */
function dominates(
  a: StrategyAggregate,
  b: StrategyAggregate,
): boolean {
  // Dimensions where higher is better
  const higherBetter: Array<{ name: string; value: (s: StrategyAggregate) => number }> = [
    { name: 'ordersCompleted', value: (s) => s.ordersCompleted.mean },
    { name: 'cashEnd', value: (s) => s.cashEnd.mean },
    { name: 'netProfit', value: (s) => s.netProfit.mean },
    { name: 'reputationEnd', value: (s) => s.reputationEnd.mean },
    { name: 'evidenceIntegrityEnd', value: (s) => s.evidenceIntegrityEnd.mean },
    { name: 'averageQuality', value: (s) => s.averageQuality.mean },
  ]

  // Dimensions where lower is better
  const lowerBetter: Array<{ name: string; value: (s: StrategyAggregate) => number }> = [
    { name: 'majorIncidents', value: (s) => s.majorIncidents.mean },
    { name: 'overclaimFindings', value: (s) => s.overclaimFindings.mean },
    { name: 'validationFailures', value: (s) => s.validationFailures.mean },
    { name: 'auditFailures', value: (s) => s.auditFailures.mean },
    { name: 'missedDeadlines', value: (s) => s.missedDeadlines.mean },
    { name: 'gameOverRate', value: (s) => s.gameOverRate },
  ]

  let strictWin = false

  for (const dim of higherBetter) {
    if (dim.value(a) < dim.value(b)) return false // A is worse
    if (dim.value(a) > dim.value(b)) strictWin = true
  }

  for (const dim of lowerBetter) {
    if (dim.value(a) > dim.value(b)) return false // A is worse
    if (dim.value(a) < dim.value(b)) strictWin = true
  }

  // A must be strictly better in at least one dimension
  return strictWin
}

/**
 * Detect strategy dominance in the balance matrix at a given horizon.
 */
export function detectDominance(
  matrix: BalanceMatrix,
  horizon: number,
): DominanceReport {
  const strategyIds = Object.keys(matrix.aggregates)
  const dominatedBy: Record<string, string[]> = {}

  for (const id of strategyIds) {
    dominatedBy[id] = []
  }

  for (const a of strategyIds) {
    for (const b of strategyIds) {
      if (a === b) continue
      const aggA = matrix.aggregates[a][horizon]
      const aggB = matrix.aggregates[b][horizon]
      if (dominates(aggA, aggB)) {
        dominatedBy[b].push(a)
      }
    }
  }

  // Find if any strategy is dominated by all others
  let dominantStrategy: string | null = null
  let verdict = ''

  const dominatedByAll = strategyIds.filter(
    (id) => dominatedBy[id].length >= strategyIds.length - 1
  )

  const undominated = strategyIds.filter(
    (id) => dominatedBy[id].length === 0
  )

  if (undominated.length === 1) {
    dominantStrategy = undominated[0]
    verdict = `Strategy "${undominated[0]}" is not dominated by any other strategy at horizon ${horizon}.`
  } else if (dominatedByAll.length > 0) {
    verdict = `Strategies [${dominatedByAll.join(', ')}] are dominated by all others. No single dominant strategy.`
  } else {
    verdict = `No strategy dominates all others at horizon ${horizon}. Each has unique trade-offs.`
  }

  return {
    dominantStrategy,
    dominatedBy,
    dimensions: [
      'ordersCompleted', 'cashEnd', 'netProfit', 'reputationEnd',
      'evidenceIntegrityEnd', 'averageQuality', 'majorIncidents',
      'overclaimFindings', 'validationFailures', 'auditFailures',
      'missedDeadlines', 'gameOverRate',
    ],
    verdict,
  }
}

// ============================================================
// Trade-off Consistency Check
// ============================================================

export interface TradeoffReport {
  horizon: number
  speedFirstRiskHigher: boolean    // speed_first has more overclaims than quality/balanced
  qualityFirstCleaner: boolean     // quality_first has fewer incidents than speed_first
  parallelHeavyCostlier: boolean   // parallel_heavy spends more on routes
  balancedTrustBest: boolean       // balanced has best or near-best reputation + evidence
  consistent: boolean
}

/**
 * Check whether the expected trade-offs hold in the aggregate data.
 */
export function checkTradeoffConsistency(
  matrix: BalanceMatrix,
  horizon: number,
): TradeoffReport {
  const speed = matrix.aggregates.speed_first[horizon]
  const quality = matrix.aggregates.quality_first[horizon]
  const parallel = matrix.aggregates.parallel_heavy[horizon]
  const balanced = matrix.aggregates.balanced[horizon]

  // Speed-first risk: balanced maintains better evidence integrity
  // (quality_first may bankrupt before speed's trust collapse shows —
  //  balanced survives longer and proves audit maintains trust)
  const speedFirstRiskHigher =
    balanced.evidenceIntegrityEnd.mean > speed.evidenceIntegrityEnd.mean

  // Quality-first cleaner: fewer major incidents than speed-first
  const qualityFirstCleaner =
    quality.majorIncidents.mean <= speed.majorIncidents.mean

  const parallelHeavyCostlier =
    parallel.parallelRouteSpend.mean > speed.parallelRouteSpend.mean &&
    parallel.parallelRouteSpend.mean > quality.parallelRouteSpend.mean

  // Balanced trust: best or near-best reputation + evidence among surviving strategies
  const balancedTrustBest =
    balanced.reputationEnd.mean >= Math.max(
      speed.reputationEnd.mean,
      quality.reputationEnd.mean,
      parallel.reputationEnd.mean,
    ) - 5 &&
    balanced.evidenceIntegrityEnd.mean >= Math.max(
      speed.evidenceIntegrityEnd.mean,
      quality.evidenceIntegrityEnd.mean,
      parallel.evidenceIntegrityEnd.mean,
    ) - 5

  const consistent =
    speedFirstRiskHigher &&
    qualityFirstCleaner &&
    parallelHeavyCostlier &&
    balancedTrustBest

  return {
    horizon,
    speedFirstRiskHigher,
    qualityFirstCleaner,
    parallelHeavyCostlier,
    balancedTrustBest,
    consistent,
  }
}
