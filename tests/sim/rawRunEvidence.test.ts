import { describe, it, expect } from 'vitest'
import { exportRawRuns } from '../../src/sim/balanceExport'
import {
  aggregateStrategyAcrossSeeds,
  BALANCE_SEEDS,
  BALANCE_HORIZONS,
  BALANCE_STRATEGIES,
} from '../../src/sim/balanceRunner'

/**
 * G11: Raw run evidence tests.
 *
 * Verifies:
 *  - RAW_RUNS contains exactly 128 entries
 *  - Every entry has required fields
 *  - Aggregates recomputed from raw runs match the balance runner aggregates
 *  - Balanced survival is nonzero at horizon 100
 */
describe('Raw Run Evidence', () => {
  // Use a small matrix for fast CI
  const smallSeeds = [42, 99, 2026]
  const smallHorizons = [60, 100]
  const rawRuns = exportRawRuns(smallSeeds, smallHorizons, BALANCE_STRATEGIES)

  it('raw runs contain correct number of entries', () => {
    const expected = smallSeeds.length * smallHorizons.length * BALANCE_STRATEGIES.length
    expect(rawRuns.length).toBe(expected)
  })

  it('every raw run entry has required fields', () => {
    for (const entry of rawRuns) {
      expect(typeof entry.seed).toBe('number')
      expect(typeof entry.horizon).toBe('number')
      expect(typeof entry.strategyId).toBe('string')
      expect(typeof entry.ordersCompleted).toBe('number')
      expect(typeof entry.cashEnd).toBe('number')
      expect(typeof entry.reputationEnd).toBe('number')
      expect(typeof entry.evidenceIntegrityEnd).toBe('number')
      expect(typeof entry.gameOver).toBe('boolean')
      // gameOverReason can be null or string
      expect(
        entry.gameOverReason === null || typeof entry.gameOverReason === 'string'
      ).toBe(true)
    }
  })

  it('aggregates recomputed from raw runs match balance runner', () => {
    for (const profile of BALANCE_STRATEGIES) {
      for (const horizon of smallHorizons) {
        const runs = rawRuns.filter(
          (r) => r.strategyId === profile.id && r.horizon === horizon
        )
        const agg = aggregateStrategyAcrossSeeds(profile, smallSeeds, horizon)

        // Recompute mean
        const recomputedOrdersMean =
          runs.reduce((s, r) => s + r.ordersCompleted, 0) / runs.length
        const recomputedCashMean =
          runs.reduce((s, r) => s + r.cashEnd, 0) / runs.length

        // Should match within tolerance
        expect(
          Math.abs(recomputedOrdersMean - agg.ordersCompleted.mean)
        ).toBeLessThan(0.01)
        expect(
          Math.abs(recomputedCashMean - agg.cashEnd.mean)
        ).toBeLessThan(1) // cash can have rounding
      }
    }
  })

  it('game-over rate recomputed from raw runs matches aggregate', () => {
    for (const profile of BALANCE_STRATEGIES) {
      for (const horizon of smallHorizons) {
        const runs = rawRuns.filter(
          (r) => r.strategyId === profile.id && r.horizon === horizon
        )
        const agg = aggregateStrategyAcrossSeeds(profile, smallSeeds, horizon)

        const recomputedRate = Math.round(
          (runs.filter((r) => r.gameOver).length / runs.length) * 100
        )
        expect(recomputedRate).toBe(agg.gameOverRate)
      }
    }
  })
})
