import { describe, it, expect } from 'vitest'
import { explainRun } from '../../src/sim/explainRun'
import { validateAttributionReasons } from '../../src/sim/explanationConsistency'
import { STRATEGIES } from '../../src/data/strategyScenarios'

/**
 * G12-S1: Attribution reason hygiene tests.
 *
 * Verifies:
 *  - Reputation penalties do NOT use AGENT_ASSIGNED or similar non-causal reasons
 *  - Evidence drops use proper event type reasons
 *  - Seed 3 balanced trace has meaningful attribution
 */
describe('Attribution Reason Hygiene', () => {
  it('no reputation penalty uses AGENT_ASSIGNED as reason', () => {
    for (const profile of Object.values(STRATEGIES)) {
      const exp = explainRun(42, 100, profile)
      const issues = validateAttributionReasons(exp)
      expect(issues).toEqual([])
    }
  })

  it('seed=3 balanced explanation has valid attribution reasons', () => {
    const exp = explainRun(3, 100, STRATEGIES.balanced)

    // Should have some evidence drops or reputation penalties
    const totalAttribution =
      exp.evidenceDrops.length + exp.reputationPenalties.length
    expect(totalAttribution).toBeGreaterThan(0)

    // Every penalty should have a valid reason
    for (const penalty of exp.reputationPenalties) {
      expect(penalty.delta).toBeLessThan(0)
      // Reason should not be attributable to innocent events
      expect(penalty.reason).not.toBe('AGENT_ASSIGNED')
      expect(penalty.reason).not.toBe('PLANNING_COMPLETED')
      expect(penalty.reason).not.toBe('ENGINEERING_COMPLETED')
      expect(penalty.reason).not.toBe('ORDER_ACCEPTED')
    }
  })

  it('speed-first seed=42 evidence drops are from real causes', () => {
    const exp = explainRun(42, 100, STRATEGIES.speed_first)

    for (const drop of exp.evidenceDrops) {
      // Should be one of: AUDIT_COMPLETED, ORDER_DELIVERED, etc.
      // or METRIC_DELTA_UNATTRIBUTED if no event could be matched
      const validReasons = [
        'AUDIT_COMPLETED',
        'ORDER_DELIVERED',
        'ORDER_DELIVERED_MANUAL',
        'MANUAL_AUDIT_RUN',
        'METRIC_DELTA_UNATTRIBUTED',
      ]
      expect(validReasons).toContain(drop.reason)
    }
  })

  it('critical artifacts for seed=3 balanced includes overclaimed artifacts', () => {
    const exp = explainRun(3, 100, STRATEGIES.balanced)

    // Seed 3 has evidence collapse — should have critical artifacts
    const highOverclaim = exp.criticalArtifacts.filter(
      (a) => a.overclaimGap > 4
    )
    expect(highOverclaim.length).toBeGreaterThan(0)
  })
})
