import { describe, it, expect } from 'vitest'
import { explainRun } from '../../src/sim/explainRun'
import {
  checkConsistency,
  validateAttributionReasons,
} from '../../src/sim/explanationConsistency'
import { STRATEGIES } from '../../src/data/strategyScenarios'

/**
 * G12-S1: Explanation consistency tests.
 */
describe('Explanation Consistency', () => {
  it('two explainRun calls with same params are consistent', () => {
    const a = explainRun(42, 100, STRATEGIES.speed_first)
    const b = explainRun(42, 100, STRATEGIES.speed_first)

    const issues = checkConsistency(a, b)
    expect(issues).toEqual([])
  })

  it('different seeds produce different explanations', () => {
    const a = explainRun(42, 100, STRATEGIES.balanced)
    const b = explainRun(99, 100, STRATEGIES.balanced)

    // At least one metric should differ
    const differs =
      a.ordersCompleted !== b.ordersCompleted ||
      a.cashEnd !== b.cashEnd ||
      a.evidenceIntegrityEnd !== b.evidenceIntegrityEnd
    expect(differs).toBe(true)
  })

  it('all 4 strategy explanations at seed=42 have valid attribution', () => {
    for (const profile of Object.values(STRATEGIES)) {
      const exp = explainRun(42, 100, profile)
      const issues = validateAttributionReasons(exp)
      expect(issues).toEqual([])
    }
  })

  it('seed=3 balanced explanation reports evidence integrity failure', () => {
    const exp = explainRun(3, 100, STRATEGIES.balanced)

    expect(exp.gameOver).toBe(true)
    expect(exp.gameOverReason).toBeTruthy()
    if (exp.gameOverReason) {
      expect(exp.gameOverReason.toLowerCase()).toContain('evidence')
    }
  })

  it('cash breakdown is consistent with net position', () => {
    const exp = explainRun(42, 100, STRATEGIES.balanced)

    const { totalSalaries, totalMaintenance, totalParallelRouteCost, totalUpgradeCost, totalRevenue, netPosition } =
      exp.cashBreakdown
    const costSum =
      totalSalaries + totalMaintenance + totalParallelRouteCost + totalUpgradeCost
    const expectedNet = totalRevenue - costSum
    expect(Math.abs(netPosition - expectedNet)).toBeLessThan(100)
  })

  it('bottleneck stages are sorted by totalQueuedTicks descending', () => {
    const exp = explainRun(42, 100, STRATEGIES.parallel_heavy)

    for (let i = 1; i < exp.bottlenecks.length; i++) {
      expect(
        exp.bottlenecks[i - 1].totalQueuedTicks
      ).toBeGreaterThanOrEqual(exp.bottlenecks[i].totalQueuedTicks)
    }
  })
})
