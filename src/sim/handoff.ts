// ============================================================
// G26: Handoff Recording and Cost Calculation
// ============================================================
//
// Handoff events track transitions of work between org units.
// Each handoff has a clarity score (from the sender's communication
// profile) and a delay cost. These accumulate into coordinationCost.
// ============================================================

import type { HandoffEvent, HandoffType } from './orgModel'

let handoffCounter = 0

export function resetHandoffCounter(): void {
  handoffCounter = 0
}

/**
 * Record a handoff event between two org units.
 *
 * @param fromUnitId - Source unit
 * @param toUnitId - Destination unit
 * @param handoffType - Type of handoff
 * @param clarityScore - 0-10, from sender's CommunicationProfile.handoffClarity
 * @param seed - For deterministic ID generation
 * @param tick - Current tick
 * @param orderId - Related order
 * @param packageId - Related work package
 */
export function recordHandoff(params: {
  fromUnitId: string
  toUnitId: string
  handoffType: HandoffType
  clarityScore: number
  seed: number
  tick: number
  orderId: string
  packageId: string
}): HandoffEvent {
  handoffCounter++

  // Delay cost: low clarity = more ticks lost
  // Base cost = 1 tick, additional cost = (10 - clarity) / 3 ticks
  const delayCost = Math.max(0, Math.round(1 + (10 - params.clarityScore) / 3))

  const summaries: Record<HandoffType, string> = {
    assign: `Work assigned from ${params.fromUnitId} to ${params.toUnitId}`,
    split: `Work package split: ${params.fromUnitId} → ${params.toUnitId}`,
    merge: `Artifacts merged: ${params.fromUnitId} → ${params.toUnitId}`,
    escalate: `Issue escalated from ${params.fromUnitId} to ${params.toUnitId}`,
    review: `Review requested: ${params.fromUnitId} → ${params.toUnitId}`,
  }

  return {
    id: `handoff-${params.seed}-${handoffCounter}`,
    tick: params.tick,
    fromUnitId: params.fromUnitId,
    toUnitId: params.toUnitId,
    orderId: params.orderId,
    packageId: params.packageId,
    handoffType: params.handoffType,
    summary: summaries[params.handoffType],
    clarityScore: params.clarityScore,
    delayCost,
  }
}

/**
 * Calculate total coordination cost from a list of handoff events.
 * Coordination cost = sum of all delay costs across all handoffs.
 */
export function calculateCoordinationCost(handoffs: HandoffEvent[]): number {
  return handoffs.reduce((sum, h) => sum + h.delayCost, 0)
}

/**
 * Calculate average handoff clarity across events.
 */
export function averageHandoffClarity(handoffs: HandoffEvent[]): number {
  if (handoffs.length === 0) return 10 // no handoffs = perfect clarity
  return handoffs.reduce((sum, h) => sum + h.clarityScore, 0) / handoffs.length
}

/**
 * Estimate latent risk from handoff quality.
 * More handoffs with low clarity → higher risk of lost information.
 */
export function estimateHandoffRisk(handoffs: HandoffEvent[]): number {
  if (handoffs.length === 0) return 0
  const avgClarity = averageHandoffClarity(handoffs)
  return Math.max(0, (10 - avgClarity) * handoffs.length * 0.5)
}
