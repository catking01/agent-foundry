import { explainRun, type RunExplanation } from './explainRun'
import { STRATEGIES } from '../data/strategyScenarios'

/**
 * Check that two explanations are consistent (same seed/horizon/strategy).
 * Returns list of inconsistencies, empty if consistent.
 */
export function checkConsistency(
  a: RunExplanation,
  b: RunExplanation,
): string[] {
  const issues: string[] = []

  if (a.seed !== b.seed) issues.push('seed mismatch')
  if (a.horizon !== b.horizon) issues.push('horizon mismatch')
  if (a.strategyId !== b.strategyId) issues.push('strategyId mismatch')
  if (a.gameOver !== b.gameOver)
    issues.push(
      `gameOver mismatch: ${a.gameOver} vs ${b.gameOver}`,
    )
  if (a.gameOverReason !== b.gameOverReason)
    issues.push(
      `gameOverReason mismatch: ${a.gameOverReason} vs ${b.gameOverReason}`,
    )
  if (a.cashEnd !== b.cashEnd)
    issues.push(`cashEnd mismatch: ${a.cashEnd} vs ${b.cashEnd}`)
  if (a.reputationEnd !== b.reputationEnd)
    issues.push(
      `reputationEnd mismatch: ${a.reputationEnd} vs ${b.reputationEnd}`,
    )
  if (a.evidenceIntegrityEnd !== b.evidenceIntegrityEnd)
    issues.push(
      `evidenceIntegrityEnd mismatch: ${a.evidenceIntegrityEnd} vs ${b.evidenceIntegrityEnd}`,
    )
  if (a.ordersCompleted !== b.ordersCompleted)
    issues.push(
      `ordersCompleted mismatch: ${a.ordersCompleted} vs ${b.ordersCompleted}`,
    )

  return issues
}

/**
 * Verify that no reputation penalty reason is a non-causal event type.
 */
export function validateAttributionReasons(
  exp: RunExplanation,
): string[] {
  const issues: string[] = []
  const invalidReasons = [
    'AGENT_ASSIGNED',
    'AGENT_MANUALLY_ASSIGNED',
    'WORKSHOP_UPGRADED',
    'PARALLEL_ROUTES_STARTED',
    'PLANNING_COMPLETED',
    'ENGINEERING_COMPLETED',
    'ORDER_ACCEPTED',
  ]

  for (const penalty of exp.reputationPenalties) {
    if (invalidReasons.includes(penalty.reason)) {
      issues.push(
        `Invalid reputation penalty reason "${penalty.reason}" at tick ${penalty.tick}`,
      )
    }
  }

  for (const drop of exp.evidenceDrops) {
    if (invalidReasons.includes(drop.reason)) {
      issues.push(
        `Invalid evidence drop reason "${drop.reason}" at tick ${drop.tick}`,
      )
    }
  }

  return issues
}

/**
 * Generate a cross-strategy report directly from explainRun,
 * guaranteeing consistency between report and JSON data.
 */
export function generateAttributionReport(
  seed: number,
  horizon: number,
): RunExplanation[] {
  return Object.values(STRATEGIES).map((profile) =>
    explainRun(seed, horizon, profile),
  )
}
