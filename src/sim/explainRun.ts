import type { GameState, LedgerEvent, Artifact } from './types'
import { createInitialState } from './createInitialState'
import { advanceTick } from './tick'
import { applyPlayerAction } from '../game/actions'
import type { StrategyProfile } from '../data/strategyScenarios'
import { generateStrategyActions } from '../data/strategyScenarios'

// ============================================================
// Explanation Types
// ============================================================

export interface CashBreakdown {
  totalSalaries: number
  totalMaintenance: number
  totalParallelRouteCost: number
  totalUpgradeCost: number
  totalCost: number
  totalRevenue: number
  netPosition: number
}

export interface NegativeEvent {
  tick: number
  eventType: string
  severity: 'high' | 'medium' | 'low'
  detail: string
  actorId: string
  targetId: string
}

export interface EvidenceDrop {
  tick: number
  fromLevel: number
  delta: number
  reason: string
}

export interface ReputationPenalty {
  tick: number
  delta: number
  reason: string
}

export interface BottleneckInfo {
  stage: string
  maxQueueDepth: number
  totalQueuedTicks: number
}

export interface CriticalArtifact {
  id: string
  quality: number
  evidenceStrength: number
  claimLevel: number
  overclaimGap: number
  validationPassed: boolean | null
  auditPassed: boolean | null
  riskLevel: string | null
}

export interface RunExplanation {
  seed: number
  horizon: number
  strategyId: string
  strategyName: string

  outcome: string
  gameOver: boolean
  gameOverReason: string | null
  finalTick: number

  ordersCompleted: number
  cashEnd: number
  reputationEnd: number
  evidenceIntegrityEnd: number
  averageQuality: number

  cashBreakdown: CashBreakdown
  topNegativeEvents: NegativeEvent[]
  evidenceDrops: EvidenceDrop[]
  reputationPenalties: ReputationPenalty[]
  bottlenecks: BottleneckInfo[]
  criticalArtifacts: CriticalArtifact[]

  overclaimCount: number
  validationFailureCount: number
  auditFailureCount: number
  missedDeadlineCount: number
  totalLedgerEvents: number
}

// ============================================================
// Explanation Engine
// ============================================================

/**
 * Run a strategy and produce a detailed traceable explanation
 * of what happened, why metrics changed, and what went wrong.
 */
export function explainRun(
  seed: number,
  horizon: number,
  profile: StrategyProfile,
): RunExplanation {
  let state = createInitialState(seed)
  const cashInitial = state.cash

  // Accumulators
  let totalSalaries = 0
  let totalMaintenance = 0
  let totalParallelRouteCost = 0
  let totalUpgradeCost = 0
  const negativeEvents: NegativeEvent[] = []
  const evidenceDrops: EvidenceDrop[] = []
  const reputationPenalties: ReputationPenalty[] = []
  const stageQueues: Record<string, number[]> = {
    planning: [],
    engineering: [],
    validation: [],
    audit: [],
    delivery: [],
  }

  let prevEvidence = state.evidenceIntegrity
  let prevReputation = state.reputation

  // Run tick by tick, collecting per-event data
  for (let tick = 0; tick < horizon; tick++) {
    if (state.gameOver) break

    // Apply strategy actions
    const actions = generateStrategyActions(state, profile)
    for (const action of actions) {
      state = applyPlayerAction(state, action)
      if (action.type === 'START_PARALLEL_ROUTES') {
        totalParallelRouteCost += 150 * action.routeCount
      }
      if (action.type === 'UPGRADE_WORKSHOP') {
        const ws = state.workshops[action.workshopId]
        if (ws) totalUpgradeCost += ws.upgradeCost
      }
    }

    // Advance one tick
    state = advanceTick(state)

    // Track evidence/reputation changes from ledger
    for (const event of state.ledger.slice(-20)) {
      if (event.tick !== state.tick) continue // only events from this tick

      // Evidence drops
      if (
        event.eventType === 'ORDER_ACCEPTED' ||
        event.eventType === 'ORDER_DELIVERED' ||
        event.eventType === 'ORDER_DELIVERED_MANUAL'
      ) {
        const newEvidence = state.evidenceIntegrity
        if (newEvidence < prevEvidence) {
          evidenceDrops.push({
            tick: state.tick,
            fromLevel: prevEvidence,
            delta: newEvidence - prevEvidence,
            reason: `Evidence drop after ${event.eventType}`,
          })
        }
        prevEvidence = newEvidence
      }

      // Reputation changes
      if (state.reputation < prevReputation) {
        reputationPenalties.push({
          tick: state.tick,
          delta: state.reputation - prevReputation,
          reason: event.eventType,
        })
      }
      prevReputation = state.reputation

      // Negative events from ledger
      const neg = classifyLedgerEvent(event)
      if (neg) negativeEvents.push(neg)
    }

    // Snapshot queue depths
    for (const stage of Object.keys(stageQueues)) {
      const queued = Object.values(state.tasks).filter(
        (t) => t.stage === stage && t.status === 'queued',
      ).length
      stageQueues[stage].push(queued)
    }
  }

  // Compute cost breakdown
  for (const agent of Object.values(state.agents)) {
    totalSalaries += agent.salaryPerTick * state.tick
  }
  for (const ws of Object.values(state.workshops)) {
    totalMaintenance += ws.maintenanceCost * state.tick
  }

  // Bottleneck analysis
  const bottlenecks: BottleneckInfo[] = Object.entries(stageQueues).map(
    ([stage, depths]) => ({
      stage,
      maxQueueDepth: Math.max(...depths, 0),
      totalQueuedTicks: depths.reduce((s, d) => s + d, 0),
    }),
  )
  bottlenecks.sort((a, b) => b.totalQueuedTicks - a.totalQueuedTicks)

  // Critical artifacts (low quality, high overclaim, or failed audit)
  const criticalArtifacts: CriticalArtifact[] = Object.values(state.artifacts)
    .map((a) => ({
      id: a.id,
      quality: a.quality,
      evidenceStrength: a.evidenceStrength,
      claimLevel: a.claimLevel,
      overclaimGap: Math.max(0, a.claimLevel - a.evidenceStrength),
      validationPassed: a.validationPassed,
      auditPassed: a.auditPassed,
      riskLevel: a.auditResult?.riskLevel ?? null,
    }))
    .filter(
      (a) =>
        a.overclaimGap > 1 ||
        a.quality < 4 ||
        a.auditPassed === false ||
        a.validationPassed === false,
    )
    .sort((a, b) => b.overclaimGap - a.overclaimGap)
    .slice(0, 10)

  // Sort negative events by severity
  negativeEvents.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })

  const totalCost = totalSalaries + totalMaintenance + totalParallelRouteCost + totalUpgradeCost

  return {
    seed,
    horizon,
    strategyId: profile.id,
    strategyName: profile.name,

    outcome: state.gameOver
      ? `GAME OVER: ${state.gameOverReason}`
      : 'Active',
    gameOver: state.gameOver,
    gameOverReason: state.gameOverReason,
    finalTick: state.tick,

    ordersCompleted: state.metrics.totalOrdersCompleted,
    cashEnd: state.cash,
    reputationEnd: state.reputation,
    evidenceIntegrityEnd: state.evidenceIntegrity,
    averageQuality: state.metrics.averageQuality,

    cashBreakdown: {
      totalSalaries,
      totalMaintenance,
      totalParallelRouteCost,
      totalUpgradeCost,
      totalCost,
      totalRevenue: state.metrics.totalRevenue,
      netPosition: state.cash - cashInitial,
    },

    topNegativeEvents: negativeEvents.slice(0, 20),
    evidenceDrops,
    reputationPenalties,
    bottlenecks,
    criticalArtifacts,

    overclaimCount: criticalArtifacts.filter((a) => a.overclaimGap > 1).length,
    validationFailureCount: criticalArtifacts.filter(
      (a) => a.validationPassed === false,
    ).length,
    auditFailureCount: criticalArtifacts.filter(
      (a) => a.auditPassed === false,
    ).length,
    missedDeadlineCount: Object.values(state.orders).filter(
      (o) =>
        (o.status === 'accepted' || o.status === 'in_progress') &&
        state.tick > o.deadlineTick,
    ).length,
    totalLedgerEvents: state.ledger.length,
  }
}

// ============================================================
// Ledger Event Classifier
// ============================================================

function classifyLedgerEvent(event: LedgerEvent): NegativeEvent | null {
  const detail = String(event.details?.reason ?? event.eventType)

  // High severity
  if (
    event.eventType === 'ORDER_DELIVERED' &&
    event.details &&
    event.details.onTime === false
  ) {
    return {
      tick: event.tick,
      eventType: 'LATE_DELIVERY',
      severity: 'high',
      detail: `Late delivery of ${event.targetId}`,
      actorId: event.actorId,
      targetId: event.targetId,
    }
  }

  if (
    event.eventType === 'AUDIT_COMPLETED' &&
    event.details &&
    event.details.passed === false
  ) {
    return {
      tick: event.tick,
      eventType: 'AUDIT_FAILED',
      severity: event.details.riskLevel === 'high' ? 'high' : 'medium',
      detail: detail,
      actorId: event.actorId,
      targetId: event.targetId,
    }
  }

  if (
    event.eventType === 'VALIDATION_COMPLETED' &&
    event.details &&
    event.details.passed === false
  ) {
    return {
      tick: event.tick,
      eventType: 'VALIDATION_FAILED',
      severity: 'medium',
      detail: detail,
      actorId: event.actorId,
      targetId: event.targetId,
    }
  }

  // Medium severity
  if (event.eventType === 'TASK_FAILED') {
    return {
      tick: event.tick,
      eventType: 'TASK_FAILED',
      severity: 'medium',
      detail: detail,
      actorId: event.actorId,
      targetId: event.targetId,
    }
  }

  if (
    event.eventType === 'MANUAL_AUDIT_RUN' &&
    event.details &&
    event.details.passed === false
  ) {
    return {
      tick: event.tick,
      eventType: 'MANUAL_AUDIT_FAILED',
      severity: 'medium',
      detail: detail,
      actorId: event.actorId,
      targetId: event.targetId,
    }
  }

  // Low severity
  if (event.eventType === 'MANUAL_VALIDATION_RUN') {
    if (event.details && event.details.passed === false) {
      return {
        tick: event.tick,
        eventType: 'MANUAL_VALIDATION_FAILED',
        severity: 'low',
        detail: detail,
        actorId: event.actorId,
        targetId: event.targetId,
      }
    }
  }

  return null
}
