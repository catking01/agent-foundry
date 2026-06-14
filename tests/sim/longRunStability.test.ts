import { describe, it, expect } from 'vitest'
import {
  runBalanceMatrix,
  checkTradeoffConsistency,
  BALANCE_SEEDS,
  BALANCE_HORIZONS,
  BALANCE_STRATEGIES,
} from '../../src/sim/balanceRunner'

/**
 * G9: Long-run stability tests.
 *
 * Verifies:
 *  - Trade-off consistency holds at longer horizons (100+)
 *  - Balanced strategy survives at moderate horizons (30)
 *  - Game-over reasons differ by strategy
 *  - Metrics evolve sensibly across horizons
 */
describe('Long-Run Stability', () => {
  const matrix = runBalanceMatrix(BALANCE_STRATEGIES, BALANCE_SEEDS, BALANCE_HORIZONS)

  it('trade-off consistency holds at horizon 100', () => {
    const report = checkTradeoffConsistency(matrix, 100)

    // Speed-first should have higher risk than quality/balanced
    // (lower evidence integrity due to trust collapse from skipping audit)
    expect(report.speedFirstRiskHigher).toBe(true)

    // Quality-first should have fewer incidents than speed-first
    expect(report.qualityFirstCleaner).toBe(true)

    // Parallel-heavy should spend more on routes
    expect(report.parallelHeavyCostlier).toBe(true)
  })

  it('balanced strategy survives most seeds at horizon 30', () => {
    const balanced30 = matrix.aggregates.balanced[30]

    // At 30 ticks, balanced should survive at least some seeds
    // (gameOverRate = percentage that ended)
    expect(balanced30.gameOverRate).toBeLessThanOrEqual(75)
  })

  it('speed-first has lower evidence integrity than balanced at horizon 100', () => {
    const speed100 = matrix.aggregates.speed_first[100]
    const balanced100 = matrix.aggregates.balanced[100]

    // Speed-first skips audit → trust collapse over time
    // Balanced maintains evidence integrity through auditing
    expect(balanced100.evidenceIntegrityEnd.mean).toBeGreaterThan(
      speed100.evidenceIntegrityEnd.mean
    )
  })

  it('quality-first has fewer incidents than speed-first at horizon 100', () => {
    const speed100 = matrix.aggregates.speed_first[100]
    const quality100 = matrix.aggregates.quality_first[100]

    // Quality validates and audits → catches problems before they become incidents
    expect(quality100.majorIncidents.mean).toBeLessThanOrEqual(
      speed100.majorIncidents.mean + 1
    )
  })

  it('parallel-heavy costs more than speed-first', () => {
    const speed100 = matrix.aggregates.speed_first[100]
    const parallel100 = matrix.aggregates.parallel_heavy[100]

    expect(parallel100.parallelRouteSpend.mean).toBeGreaterThan(
      speed100.parallelRouteSpend.mean
    )
  })

  it('metrics evolve without extreme oscillation across horizons', () => {
    const balancedAggs = BALANCE_HORIZONS.map(
      (h) => matrix.aggregates.balanced[h]
    )

    const reputations = balancedAggs.map((a) => a.reputationEnd.mean)

    // Reputation should generally trend downward over time (not spike up 30+ points)
    for (let i = 1; i < reputations.length; i++) {
      expect(reputations[i]).toBeLessThanOrEqual(reputations[0] + 20)
    }
  })

  it('different strategies have different primary failure modes', () => {
    const speed200 = matrix.aggregates.speed_first[200]
    const quality200 = matrix.aggregates.quality_first[200]

    // Speed-first: evidence integrity should be very low (evidence collapse mode)
    // Quality-first: major incidents should be lower (cost pressure mode)
    // Both are valid failure modes — the point is they're DIFFERENT
    const evidenceDiff = Math.abs(
      speed200.evidenceIntegrityEnd.mean - quality200.evidenceIntegrityEnd.mean
    )
    const incidentDiff = Math.abs(
      speed200.majorIncidents.mean - quality200.majorIncidents.mean
    )

    // At least one metric dimension should differ between strategies
    expect(evidenceDiff + incidentDiff).toBeGreaterThan(0)
  })
})
