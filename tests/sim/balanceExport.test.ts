import { describe, it, expect } from 'vitest'
import {
  generateBalanceExport,
  exportRawRuns,
  exportAggregateMatrix,
  exportHorizonComparison,
} from '../../src/sim/balanceExport'
import {
  runBalanceMatrix,
  BALANCE_SEEDS,
  BALANCE_HORIZONS,
  BALANCE_STRATEGIES,
} from '../../src/sim/balanceRunner'

/**
 * G10: Balance export tests.
 *
 * Verifies:
 *  - Full balance export generates all required sections
 *  - Raw runs cover all seed × horizon × strategy combinations
 *  - Aggregate means match raw run recomputed values
 *  - Horizon comparison covers all strategy × horizon pairs
 */
describe('Balance Export', () => {
  // Use a small matrix for fast tests
  const smallSeeds = [42, 99]
  const smallHorizons = [60, 100]
  const matrix = runBalanceMatrix(BALANCE_STRATEGIES, smallSeeds, smallHorizons)
  const rawRuns = exportRawRuns(smallSeeds, smallHorizons, BALANCE_STRATEGIES)

  it('raw runs cover all seed × horizon × strategy combinations', () => {
    const expected = smallSeeds.length * smallHorizons.length * BALANCE_STRATEGIES.length
    expect(rawRuns.length).toBe(expected)
  })

  it('aggregate means match recomputed raw values', () => {
    const aggregates = exportAggregateMatrix(matrix)

    for (const agg of aggregates) {
      const matchingRuns = rawRuns.filter(
        (r) =>
          r.strategyId === agg.strategyId && r.horizon === agg.horizon,
      )

      // Recompute mean from raw runs
      const recomputedMean =
        matchingRuns.reduce((s, r) => s + r.ordersCompleted, 0) /
        matchingRuns.length

      // Should match within floating point tolerance
      expect(Math.abs(agg.ordersCompletedMean - recomputedMean)).toBeLessThan(0.01)
    }
  })

  it('horizon comparison covers all strategy × horizon pairs', () => {
    const hc = exportHorizonComparison(matrix)
    const expected = BALANCE_STRATEGIES.length * smallHorizons.length
    expect(hc.length).toBe(expected)
  })

  it('full balance export includes all sections', () => {
    const exp = generateBalanceExport(smallSeeds, smallHorizons, BALANCE_STRATEGIES)

    // All sections must exist
    expect(exp.rawRuns.length).toBeGreaterThan(0)
    expect(exp.aggregates.length).toBeGreaterThan(0)
    expect(exp.horizonComparison.length).toBeGreaterThan(0)
    expect(Object.keys(exp.dominanceReports).length).toBe(smallHorizons.length)
    expect(Object.keys(exp.tradeoffReports).length).toBe(smallHorizons.length)
    expect(exp.hardGates.length).toBeGreaterThan(0)
    expect(exp.seeds).toEqual(smallSeeds)
    expect(exp.horizons).toEqual(smallHorizons)
    expect(exp.strategies.length).toBe(BALANCE_STRATEGIES.length)
    expect(exp.generatedAt).toBeTruthy()
    expect(exp.repo).toBe('catking01/agent-factory')
  })

  it('full balance export is valid JSON when serialized', () => {
    const exp = generateBalanceExport(smallSeeds, smallHorizons, BALANCE_STRATEGIES)
    const json = JSON.stringify(exp)
    const parsed = JSON.parse(json)
    expect(parsed.rawRuns.length).toBe(exp.rawRuns.length)
    expect(parsed.hardGates.length).toBe(exp.hardGates.length)
  })
})
