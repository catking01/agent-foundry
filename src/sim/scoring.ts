import type { GameState, CompanyMetrics } from './types'

/**
 * Compute current company metrics from game state.
 */
export function computeMetrics(state: GameState): CompanyMetrics {
  const orders = Object.values(state.orders)
  const artifacts = Object.values(state.artifacts)
  const agents = Object.values(state.agents)

  const completedOrders = orders.filter((o) => o.status === 'delivered')
  const failedOrders = orders.filter((o) => o.status === 'failed')
  const inProgress = orders.filter(
    (o) => o.status === 'accepted' || o.status === 'in_progress'
  )

  // Average quality from delivered artifacts
  const deliveredArtifacts = artifacts.filter(
    (a) => a.validationPassed !== null
  )
  const avgQuality =
    deliveredArtifacts.length > 0
      ? deliveredArtifacts.reduce((sum, a) => sum + a.quality, 0) /
        deliveredArtifacts.length
      : 0

  // Rework rate: artifacts that failed validation
  const failedValidation = artifacts.filter(
    (a) => a.validationPassed === false
  ).length
  const reworkRate =
    artifacts.length > 0 ? failedValidation / artifacts.length : 0

  // Agent utilization
  const workingAgents = agents.filter((a) => a.status === 'working').length
  const agentUtilization =
    agents.length > 0 ? workingAgents / agents.length : 0

  // Evidence integrity from state
  const evidenceIntegrity = state.evidenceIntegrity

  return {
    totalOrdersCompleted: completedOrders.length,
    totalOrdersFailed: failedOrders.length,
    totalRevenue: state.metrics.totalRevenue,
    totalCost: state.metrics.totalCost,
    averageQuality: Math.round(avgQuality * 10) / 10,
    reworkRate: Math.round(reworkRate * 100) / 100,
    evidenceIntegrity,
    majorIncidents: state.metrics.majorIncidents,
    ordersInProgress: inProgress.length,
    agentUtilization: Math.round(agentUtilization * 100) / 100,
  }
}

/**
 * Compute a final score for the game run.
 */
export function computeFinalScore(state: GameState): number {
  const m = state.metrics

  const profitScore = Math.max(0, (state.cash / 5000) * 25)
  const reputationScore = (state.reputation / 100) * 25
  const evidenceScore = (state.evidenceIntegrity / 100) * 20
  const completionScore = Math.min(m.totalOrdersCompleted * 3, 15)
  const qualityScore = Math.min(m.averageQuality * 1.5, 15)
  const incidentPenalty = m.majorIncidents * 10

  return Math.round(
    profitScore +
      reputationScore +
      evidenceScore +
      completionScore +
      qualityScore -
      incidentPenalty
  )
}
