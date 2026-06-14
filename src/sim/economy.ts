import type { GameState } from './types'
import { clamp } from './rng'
import {
  REPUTATION_MAX,
  REPUTATION_MIN,
  REPUTATION_WEIGHTS,
  BANKRUPTCY_THRESHOLD,
} from './constants'

/**
 * Calculate per-tick costs and apply them.
 */
export function applyEconomy(state: GameState): GameState {
  const next = { ...state }

  // Agent salaries
  let salaryTotal = 0
  for (const agent of Object.values(next.agents)) {
    salaryTotal += agent.salaryPerTick
  }

  // Workshop maintenance
  let workshopTotal = 0
  for (const ws of Object.values(next.workshops)) {
    workshopTotal += ws.maintenanceCost
  }

  const totalCost = salaryTotal + workshopTotal
  next.cash -= totalCost
  next.metrics = { ...next.metrics, totalCost: next.metrics.totalCost + totalCost }

  return next
}

/**
 * Compute delivery profit and update state.
 */
export function processDeliveryEconomics(
  state: GameState,
  orderId: string,
  quality: number,
  onTime: boolean,
  auditPassed: boolean
): GameState {
  const next = { ...state }
  const order = next.orders[orderId]
  if (!order) return next

  const baseReward = order.reward
  const qualityMultiplier = 0.7 + (quality / 10) * 0.6
  const onTimeBonus = onTime ? 1.0 : 0.7
  const penalty = onTime ? 0 : order.penalty

  const actualReward = Math.round(baseReward * qualityMultiplier * onTimeBonus - penalty)
  next.cash += actualReward
  next.metrics = {
    ...next.metrics,
    totalRevenue: next.metrics.totalRevenue + actualReward,
    totalOrdersCompleted: next.metrics.totalOrdersCompleted + 1,
    averageQuality:
      (next.metrics.averageQuality * next.metrics.totalOrdersCompleted + quality) /
      (next.metrics.totalOrdersCompleted + 1),
  }

  // Reputation update
  let repDelta = 0
  repDelta += quality * REPUTATION_WEIGHTS.deliveryQuality
  if (onTime) repDelta += REPUTATION_WEIGHTS.onTimeBonus
  else repDelta -= REPUTATION_WEIGHTS.missedDeadlinePenalty
  if (auditPassed) repDelta += REPUTATION_WEIGHTS.auditIntegrityBonus

  next.reputation = clamp(next.reputation + repDelta, REPUTATION_MIN, REPUTATION_MAX)

  return next
}

/**
 * Apply reputation penalty for failed/hidden routes.
 */
export function applyReputationPenalty(
  state: GameState,
  reason: 'overclaim' | 'evidence_gap' | 'hidden_failure' | 'defect'
): GameState {
  const next = { ...state }
  let penalty = 0

  switch (reason) {
    case 'overclaim':
      penalty = REPUTATION_WEIGHTS.overclaimPenalty
      next.evidenceIntegrity = clamp(next.evidenceIntegrity - 10, 0, 100)
      break
    case 'evidence_gap':
      penalty = REPUTATION_WEIGHTS.overclaimPenalty / 2
      next.evidenceIntegrity = clamp(next.evidenceIntegrity - 5, 0, 100)
      break
    case 'hidden_failure':
      penalty = REPUTATION_WEIGHTS.defectPenalty
      next.evidenceIntegrity = clamp(next.evidenceIntegrity - 8, 0, 100)
      break
    case 'defect':
      penalty = REPUTATION_WEIGHTS.defectPenalty
      break
  }

  next.reputation = clamp(next.reputation - penalty, REPUTATION_MIN, REPUTATION_MAX)

  // Track major incidents
  if (penalty >= REPUTATION_WEIGHTS.overclaimPenalty) {
    next.metrics = {
      ...next.metrics,
      majorIncidents: next.metrics.majorIncidents + 1,
    }
  }

  return next
}

/**
 * Check game-over conditions.
 */
export function checkGameOver(state: GameState): GameState {
  if (state.gameOver) return state

  // Bankruptcy
  if (state.cash <= BANKRUPTCY_THRESHOLD) {
    return { ...state, gameOver: true, gameOverReason: 'Bankruptcy: ran out of cash.' }
  }

  // Reputation collapse
  if (state.reputation <= 10) {
    return {
      ...state,
      gameOver: true,
      gameOverReason: 'Reputation collapse: clients lost all trust.',
    }
  }

  // Evidence integrity collapse
  if (state.evidenceIntegrity <= 20) {
    return {
      ...state,
      gameOver: true,
      gameOverReason: 'Evidence integrity failure: unable to prove any claims.',
    }
  }

  return state
}
