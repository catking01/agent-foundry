import type { GameState, PlayerAction } from './types'
import { createInitialState } from './createInitialState'
import { advanceTick } from './tick'
import { applyPlayerAction } from '../game/actions'
import type { StrategyProfile } from '../data/strategyScenarios'
import { generateStrategyActions } from '../data/strategyScenarios'

// ============================================================
// Extended Strategy Metrics
// ============================================================

export interface StrategyRunMetrics {
  strategyId: string
  strategyName: string
  seed: number
  tickHorizon: number
  finalTick: number

  // Core outcomes
  gameOver: boolean
  gameOverReason: string | null
  ordersCompleted: number
  ordersFailed: number
  ordersAccepted: number

  // Financial
  cashStart: number
  cashEnd: number
  totalRevenue: number
  totalCost: number
  netProfit: number

  // Quality & evidence
  reputationEnd: number
  evidenceIntegrityEnd: number
  averageQuality: number
  minQuality: number
  maxQuality: number

  // Risk & incidents
  majorIncidents: number
  overclaimFindings: number
  validationFailures: number
  auditFailures: number
  missedDeadlines: number

  // Operations
  parallelRouteCount: number
  parallelRouteSpend: number
  totalArtifactsCreated: number
  totalLedgerEvents: number
  agentUtilization: number

  // Bottlenecks — which stage had most queued tasks
  bottleneckStage: string | null
  maxQueueDepth: number
}

// ============================================================
// Scenario Runner
// ============================================================

export interface ScenarioConfig {
  seed: number
  tickHorizon: number
  profile: StrategyProfile
}

/**
 * Run a full strategy scenario and collect metrics.
 *
 * The runner advances the simulation tick by tick. At each tick:
 * 1. Generate strategy actions based on the profile
 * 2. Apply those actions
 * 3. Advance the simulation by one tick
 * 4. Collect snapshot metrics
 *
 * Returns the final state + detailed metrics.
 */
export function runScenario(config: ScenarioConfig): {
  finalState: GameState
  metrics: StrategyRunMetrics
} {
  const { seed, tickHorizon, profile } = config

  let state = createInitialState(seed)
  const cashStart = state.cash

  // Metric accumulators
  let validationFailures = 0
  let auditFailures = 0
  let overclaimFindings = 0
  let parallelRouteCount = 0
  let parallelRouteSpend = 0
  let queueSnapshots: Array<{ stage: string; depth: number }> = []

  // Run the simulation
  for (let tick = 0; tick < tickHorizon; tick++) {
    if (state.gameOver) break

    // Generate and apply strategy actions
    const actions = generateStrategyActions(state, profile)
    for (const action of actions) {
      state = applyPlayerAction(state, action)

      // Track parallel route usage
      if (action.type === 'START_PARALLEL_ROUTES') {
        parallelRouteCount++
        // Cost is 200 per route, applied in startParallelRoutes
        parallelRouteSpend += 200 * action.routeCount
      }
    }

    // Advance one tick
    state = advanceTick(state)

    // Collect per-tick metrics
    const ledgerEvents = state.ledger.slice(-10)
    for (const event of ledgerEvents) {
      if (event.eventType === 'VALIDATION_COMPLETED' && event.details.passed === false) {
        validationFailures++
      }
      if (event.eventType === 'AUDIT_COMPLETED') {
        if (event.details.passed === false) auditFailures++
        if (event.details.reason && String(event.details.reason).includes('Overclaim')) {
          overclaimFindings++
        }
      }
    }

    // Snapshot queue depths for bottleneck analysis
    for (const stage of ['planning', 'engineering', 'validation', 'audit', 'delivery'] as const) {
      const queued = Object.values(state.tasks).filter(
        (t) => t.stage === stage && t.status === 'queued'
      ).length
      queueSnapshots.push({ stage, depth: queued })
    }
  }

  // Compute final metrics
  const deliveredArtifacts = Object.values(state.artifacts).filter(
    (a) => a.validationPassed !== null
  )
  const qualities = deliveredArtifacts.map((a) => a.quality)

  // Find bottleneck stage (most cumulative queued)
  const stageQueues: Record<string, number> = {}
  for (const snap of queueSnapshots) {
    stageQueues[snap.stage] = (stageQueues[snap.stage] || 0) + snap.depth
  }
  let bottleneckStage: string | null = null
  let maxQueueSum = 0
  for (const [stage, sum] of Object.entries(stageQueues)) {
    if (sum > maxQueueSum) {
      maxQueueSum = sum
      bottleneckStage = stage
    }
  }
  const maxQueueDepth = Math.max(...queueSnapshots.map((s) => s.depth), 0)

  const missedDeadlines = Object.values(state.orders).filter(
    (o) => o.status === 'in_progress' && state.tick > o.deadlineTick
  ).length

  const metrics: StrategyRunMetrics = {
    strategyId: profile.id,
    strategyName: profile.name,
    seed,
    tickHorizon,
    finalTick: state.tick,

    gameOver: state.gameOver,
    gameOverReason: state.gameOverReason,
    ordersCompleted: state.metrics.totalOrdersCompleted,
    ordersFailed: state.metrics.totalOrdersFailed,
    ordersAccepted: Object.values(state.orders).filter(
      (o) => o.status !== 'available'
    ).length,

    cashStart,
    cashEnd: state.cash,
    totalRevenue: state.metrics.totalRevenue,
    totalCost: state.metrics.totalCost,
    netProfit: state.metrics.totalRevenue - state.metrics.totalCost,

    reputationEnd: state.reputation,
    evidenceIntegrityEnd: state.evidenceIntegrity,
    averageQuality: qualities.length > 0
      ? Math.round((qualities.reduce((s, q) => s + q, 0) / qualities.length) * 10) / 10
      : 0,
    minQuality: qualities.length > 0 ? Math.min(...qualities) : 0,
    maxQuality: qualities.length > 0 ? Math.max(...qualities) : 0,

    majorIncidents: state.metrics.majorIncidents,
    overclaimFindings,
    validationFailures,
    auditFailures,
    missedDeadlines,

    parallelRouteCount,
    parallelRouteSpend,
    totalArtifactsCreated: Object.keys(state.artifacts).length,
    totalLedgerEvents: state.ledger.length,
    agentUtilization: state.metrics.agentUtilization,

    bottleneckStage,
    maxQueueDepth,
  }

  return { finalState: state, metrics }
}

// ============================================================
// Strategy Comparison
// ============================================================

export interface StrategyComparison {
  seed: number
  tickHorizon: number
  runs: Record<string, StrategyRunMetrics>
  summary: string
}

/**
 * Run multiple strategies with the same seed and horizon,
 * producing a comparable set of metrics.
 */
export function compareStrategies(
  profiles: StrategyProfile[],
  seed: number,
  tickHorizon: number,
): StrategyComparison {
  const runs: Record<string, StrategyRunMetrics> = {}

  for (const profile of profiles) {
    const { metrics } = runScenario({ seed, tickHorizon, profile })
    runs[profile.id] = metrics
  }

  // Generate a summary
  const lines: string[] = [
    `Strategy Comparison — seed=${seed} horizon=${tickHorizon}`,
    '',
  ]

  for (const profile of profiles) {
    const m = runs[profile.id]
    lines.push(
      `${m.strategyName}: completed=${m.ordersCompleted} ` +
      `cash=$${m.cashEnd} rep=${m.reputationEnd} evi=${m.evidenceIntegrityEnd} ` +
      `avgQ=${m.averageQuality} incidents=${m.majorIncidents} ` +
      `overclaims=${m.overclaimFindings} missed=${m.missedDeadlines} ` +
      `parallelSpend=$${m.parallelRouteSpend} ` +
      `${m.gameOver ? 'GAME_OVER' : 'active'}`
    )
  }

  return { seed, tickHorizon, runs, summary: lines.join('\n') }
}
