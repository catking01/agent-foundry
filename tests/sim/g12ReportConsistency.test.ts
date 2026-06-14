import { describe, it, expect } from 'vitest'
import { explainRun } from '../../src/sim/explainRun'
import { generateAttributionReport } from '../../src/sim/explanationConsistency'
import { STRATEGIES } from '../../src/data/strategyScenarios'

/**
 * G12-S1: Report consistency tests.
 *
 * Verifies:
 *  - The attribution report is machine-reproducible from explainRun
 *  - Report data is consistent across re-runs
 *  - All entries have valid, complete data
 */
describe('G12 Report Consistency', () => {
  const regenerated = generateAttributionReport(42, 100)

  it('explainRun regenerates consistent results (deterministic)', () => {
    const a = explainRun(42, 100, STRATEGIES.balanced)
    const b = explainRun(42, 100, STRATEGIES.balanced)

    expect(a.gameOver).toBe(b.gameOver)
    expect(a.gameOverReason).toBe(b.gameOverReason)
    expect(a.evidenceIntegrityEnd).toBe(b.evidenceIntegrityEnd)
    expect(a.reputationEnd).toBe(b.reputationEnd)
    expect(a.ordersCompleted).toBe(b.ordersCompleted)
  })

  it('regenerated report covers all 4 strategies', () => {
    expect(regenerated.length).toBe(4)
    const ids = regenerated.map((r) => r.strategyId).sort()
    expect(ids).toEqual([
      'balanced',
      'parallel_heavy',
      'quality_first',
      'speed_first',
    ])
  })

  it('balanced seed=42 data is consistent across regenerated report and direct call', () => {
    const direct = explainRun(42, 100, STRATEGIES.balanced)
    const fromReport = regenerated.find(
      (r) => r.strategyId === 'balanced'
    )!

    expect(direct.gameOver).toBe(fromReport.gameOver)
    expect(direct.gameOverReason).toBe(fromReport.gameOverReason)
    expect(direct.evidenceIntegrityEnd).toBe(
      fromReport.evidenceIntegrityEnd
    )
    expect(direct.reputationEnd).toBe(fromReport.reputationEnd)
    expect(direct.ordersCompleted).toBe(fromReport.ordersCompleted)
  })

  it('two independent report generations produce identical results', () => {
    const report1 = generateAttributionReport(42, 100)
    const report2 = generateAttributionReport(42, 100)

    for (let i = 0; i < report1.length; i++) {
      expect(report1[i].gameOver).toBe(report2[i].gameOver)
      expect(report1[i].gameOverReason).toBe(report2[i].gameOverReason)
      expect(report1[i].evidenceIntegrityEnd).toBe(report2[i].evidenceIntegrityEnd)
      expect(report1[i].reputationEnd).toBe(report2[i].reputationEnd)
      expect(report1[i].ordersCompleted).toBe(report2[i].ordersCompleted)
      expect(report1[i].cashEnd).toBe(report2[i].cashEnd)
    }
  })

  it('cross-strategy values are well-formed and reproducible', () => {
    for (const entry of regenerated) {
      expect(entry.evidenceIntegrityEnd).toBeGreaterThanOrEqual(0)
      expect(entry.reputationEnd).toBeGreaterThanOrEqual(0)
      expect(entry.ordersCompleted).toBeGreaterThanOrEqual(0)
      expect(entry.cashBreakdown.totalCost).toBeGreaterThan(0)
      expect(entry.bottlenecks.length).toBeGreaterThan(0)
      expect(typeof entry.outcome).toBe('string')
    }
  })
})
