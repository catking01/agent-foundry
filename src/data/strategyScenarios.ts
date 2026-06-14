import type { GameState, Order, Artifact, PlayerAction } from '../sim/types'

// ============================================================
// Strategy Profiles
// ============================================================

export interface StrategyProfile {
  id: string
  name: string
  description: string

  /** Maximum complexity the strategy will accept */
  maxComplexity: number
  /** Maximum risk the strategy will accept */
  maxRisk: number
  /** Minimum reward-to-complexity ratio to accept */
  minRewardRatio: number

  /** How many parallel routes based on order complexity */
  routeCount: (complexity: number) => number

  /** Whether to manually run validation on artifacts */
  manualValidate: boolean
  /** Whether to manually run audit on artifacts */
  manualAudit: boolean

  /** Minimum quality to deliver */
  minDeliveryQuality: number
  /** Require audit pass before delivery */
  requireAuditForDelivery: boolean

  /** Whether to upgrade workshops when cash allows */
  upgradeWorkshops: boolean
}

/**
 * Generate player actions for a given tick based on the strategy profile.
 * Returns the actions the strategy would take at this tick.
 */
export type StrategyActionGenerator = (
  state: GameState,
  profile: StrategyProfile
) => PlayerAction[]

// ============================================================
// Strategy Definitions
// ============================================================

export const STRATEGIES: Record<string, StrategyProfile> = {

  speed_first: {
    id: 'speed_first',
    name: 'Speed First',
    description: 'Accept everything, minimal validation, single route, deliver fast. High throughput, high risk.',
    maxComplexity: 10,
    maxRisk: 10,
    minRewardRatio: 0,
    routeCount: (_c: number) => 0, // single route always
    manualValidate: false,
    manualAudit: false,
    minDeliveryQuality: 3,
    requireAuditForDelivery: false,
    upgradeWorkshops: false,
  },

  quality_first: {
    id: 'quality_first',
    name: 'Quality First',
    description: 'Selective acceptance, heavy validation and audit, single route, high quality bar.',
    maxComplexity: 9,
    maxRisk: 6,
    minRewardRatio: 100, // at least 100 reward per complexity point
    routeCount: (_c: number) => 0, // single route — let quality agents handle it
    manualValidate: true,
    manualAudit: true,
    minDeliveryQuality: 6,
    requireAuditForDelivery: true,
    upgradeWorkshops: true,
  },

  parallel_heavy: {
    id: 'parallel_heavy',
    name: 'Parallel Heavy',
    description: 'Accept challenging orders, always use 2-3 parallel routes, competitive artifact selection.',
    maxComplexity: 10,
    maxRisk: 8,
    minRewardRatio: 100,
    routeCount: (c: number) => (c >= 5 ? 3 : c >= 3 ? 2 : 1),
    manualValidate: true,
    manualAudit: true,
    minDeliveryQuality: 5,
    requireAuditForDelivery: true,
    upgradeWorkshops: false,
  },

  balanced: {
    id: 'balanced',
    name: 'Balanced',
    description: 'Moderate acceptance, 2 routes for complex orders, validate and audit high-risk work.',
    maxComplexity: 9,
    maxRisk: 7,
    minRewardRatio: 50,
    routeCount: (c: number) => (c >= 6 ? 2 : 1),
    manualValidate: true,
    manualAudit: true,
    minDeliveryQuality: 5,
    requireAuditForDelivery: true,
    upgradeWorkshops: false,
  },
}

// ============================================================
// Strategy Action Generator
// ============================================================

/**
 * Generate player actions for a tick based on the strategy profile.
 * This is the bridge between "strategy parameters" and "game mechanics".
 */
export function generateStrategyActions(
  state: GameState,
  profile: StrategyProfile
): PlayerAction[] {
  const actions: PlayerAction[] = []
  const tick = state.tick

  // 1. Accept available orders that match the strategy
  for (const order of Object.values(state.orders)) {
    if (order.status !== 'available') continue
    if (order.complexity > profile.maxComplexity) continue
    if (order.risk > profile.maxRisk) continue

    const rewardRatio = order.complexity > 0 ? order.reward / order.complexity : 0
    if (rewardRatio < profile.minRewardRatio) continue

    // Don't accept too many at once — limit to 3 active orders
    const activeCount = Object.values(state.orders).filter(
      (o) => o.status === 'accepted' || o.status === 'in_progress'
    ).length
    if (activeCount >= 3) break

    actions.push({ type: 'ACCEPT_ORDER', orderId: order.id, tick })
  }

  // 2. Start parallel routes for accepted orders
  for (const order of Object.values(state.orders)) {
    if (order.status !== 'accepted') continue
    const count = profile.routeCount(order.complexity)
    if (count <= 1) {
      // Single route — order stays accepted, auto-scheduler handles it.
      // Transition to in_progress when work begins (handled by workshop).
      continue
    }
    // Parallel routes — start them
    actions.push({
      type: 'START_PARALLEL_ROUTES',
      orderId: order.id,
      routeCount: count,
      tick,
    })
  }

  // 3. Manual validation for artifacts that need it
  if (profile.manualValidate) {
    for (const artifact of Object.values(state.artifacts)) {
      if (artifact.validationPassed !== null) continue // already validated
      // Find an idle validator
      const validator = Object.values(state.agents).find(
        (a) => a.status === 'idle' && a.validation >= 5
      )
      if (!validator) continue

      actions.push({
        type: 'RUN_VALIDATION',
        artifactId: artifact.id,
        validatorAgentId: validator.id,
        tick,
      })
      // Only validate one artifact per tick to avoid spamming
      break
    }
  }

  // 4. Manual audit for artifacts that need it
  if (profile.manualAudit) {
    for (const artifact of Object.values(state.artifacts)) {
      if (artifact.auditPassed !== null) continue // already audited
      if (artifact.validationPassed === false) continue // failed validation, skip
      // Find an idle auditor
      const auditor = Object.values(state.agents).find(
        (a) => a.status === 'idle' && a.auditing >= 5
      )
      if (!auditor) continue

      actions.push({
        type: 'RUN_AUDIT',
        artifactId: artifact.id,
        auditorAgentId: auditor.id,
        tick,
      })
      break
    }
  }

  // 5. Deliver orders that are ready
  for (const order of Object.values(state.orders)) {
    if (order.status !== 'in_progress') continue

    // Find the best artifact for this order
    const orderArtifacts = Object.values(state.artifacts).filter(
      (a) => a.orderId === order.id
    )

    // Check if any artifact meets delivery criteria
    const deliverable = orderArtifacts.find((a) => {
      if (a.quality < profile.minDeliveryQuality) return false
      if (profile.requireAuditForDelivery && a.auditPassed !== true) return false
      return true
    })

    if (!deliverable) continue

    // Speed-first: deliver as soon as there's any artifact
    // Others: wait for audit pass
    const shouldDeliver =
      profile.id === 'speed_first'
        ? orderArtifacts.length > 0
        : deliverable !== undefined

    if (shouldDeliver) {
      actions.push({ type: 'DELIVER_ORDER', orderId: order.id, tick })
    }
  }

  // 6. Upgrade workshops if strategy calls for it (only when well-funded)
  if (profile.upgradeWorkshops && state.cash > 8000) {
    for (const ws of Object.values(state.workshops)) {
      if (state.cash < ws.upgradeCost * 2) continue // keep a large buffer
      actions.push({
        type: 'UPGRADE_WORKSHOP',
        workshopId: ws.id,
        upgradeId: `upgrade-${ws.id}-${ws.level + 1}`,
        tick,
      })
      break // one upgrade per tick
    }
  }

  return actions
}
