import { describe, it, expect } from 'vitest'
import {
  runBalanceMatrix,
  checkTradeoffConsistency,
  BALANCE_SEEDS,
  BALANCE_HORIZONS,
  BALANCE_STRATEGIES,
} from '../../src/sim/balanceRunner'

/**
 * G11: Trade-off preservation tests.
 *
 * Verifies that economy tuning did not destroy strategic trade-offs:
 *  - Speed-first still has lower evidence than balanced
 *  - Quality-first still has incident advantage over speed
 *  - Parallel-heavy still costs more
 *  - Balanced still maintains best trust metrics
 */
describe('Trade-off Preservation', () => {
  const matrix = runBalanceMatrix(BALANCE_STRATEGIES, BALANCE_SEEDS, BALANCE_HORIZONS)

  it('speed-first risk is higher than balanced at horizon 60', () => {
    const report = checkTradeoffConsistency(matrix, 60)
    expect(report.speedFirstRiskHigher).toBe(true)
  })

  it('speed-first risk is higher than balanced at horizon 100', () => {
    const report = checkTradeoffConsistency(matrix, 100)
    expect(report.speedFirstRiskHigher).toBe(true)
  })

  it('quality-first is cleaner than speed-first at horizon 60', () => {
    const report = checkTradeoffConsistency(matrix, 60)
    expect(report.qualityFirstCleaner).toBe(true)
  })

  it('quality-first is cleaner than speed-first at horizon 100', () => {
    const report = checkTradeoffConsistency(matrix, 100)
    expect(report.qualityFirstCleaner).toBe(true)
  })

  it('parallel-heavy costs more at all horizons', () => {
    for (const h of [60, 100]) {
      const report = checkTradeoffConsistency(matrix, h)
      expect(report.parallelHeavyCostlier).toBe(true)
    }
  })

  it('balanced trust is best or near-best at horizon 60', () => {
    const report = checkTradeoffConsistency(matrix, 60)
    expect(report.balancedTrustBest).toBe(true)
  })

  it('balanced trust is best or near-best at horizon 100', () => {
    const report = checkTradeoffConsistency(matrix, 100)
    expect(report.balancedTrustBest).toBe(true)
  })

  it('all trade-offs consistent at horizon 100', () => {
    const report = checkTradeoffConsistency(matrix, 100)
    expect(report.consistent).toBe(true)
  })
})
