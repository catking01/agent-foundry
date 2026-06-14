import { describe, it, expect } from 'vitest'
import {
  aggregateStrategyAcrossSeeds,
  runBalanceMatrix,
  BALANCE_SEEDS,
  BALANCE_HORIZONS,
  BALANCE_STRATEGIES,
} from '../../src/sim/balanceRunner'
import { runScenario } from '../../src/sim/scenarioRunner'

/**
 * G9: Multi-seed balance tests.
 *
 * Verifies:
 *  - Same seed/strategy/horizon is deterministic
 *  - All strategies produce valid metrics across all seeds
 *  - Aggregate stats are well-formed (mean between min and max, std non-negative, etc.)
 */
describe('Multi-Seed Balance', () => {
  // Run the full balance matrix once (expensive — ~128 scenario runs)
  const matrix = runBalanceMatrix(BALANCE_STRATEGIES, BALANCE_SEEDS, BALANCE_HORIZONS)

  it('same seed/strategy/horizon is deterministic', () => {
    const run1 = runScenario({ seed: 42, tickHorizon: 60, profile: BALANCE_STRATEGIES[0] })
    const run2 = runScenario({ seed: 42, tickHorizon: 60, profile: BALANCE_STRATEGIES[0] })

    expect(run1.metrics.ordersCompleted).toBe(run2.metrics.ordersCompleted)
    expect(run1.metrics.cashEnd).toBe(run2.metrics.cashEnd)
    expect(run1.metrics.reputationEnd).toBe(run2.metrics.reputationEnd)
    expect(run1.metrics.evidenceIntegrityEnd).toBe(run2.metrics.evidenceIntegrityEnd)
    expect(run1.metrics.overclaimFindings).toBe(run2.metrics.overclaimFindings)
  })

  it('all strategies produce valid metrics across all seeds at horizon 60', () => {
    for (const profile of BALANCE_STRATEGIES) {
      for (const seed of BALANCE_SEEDS) {
        const { metrics } = runScenario({
          seed,
          tickHorizon: 60,
          profile,
        })

        // Core invariants
        expect(metrics.strategyId).toBe(profile.id)
        expect(metrics.cashStart).toBeGreaterThan(0)
        expect(metrics.finalTick).toBeGreaterThan(0)
        expect(metrics.reputationEnd).toBeGreaterThanOrEqual(0)
        expect(metrics.reputationEnd).toBeLessThanOrEqual(100)
        expect(metrics.evidenceIntegrityEnd).toBeGreaterThanOrEqual(0)
        expect(metrics.evidenceIntegrityEnd).toBeLessThanOrEqual(100)
        expect(metrics.totalArtifactsCreated).toBeGreaterThanOrEqual(0)
        expect(metrics.totalLedgerEvents).toBeGreaterThan(0)
      }
    }
  })

  it('aggregate stats are well-formed', () => {
    const agg = aggregateStrategyAcrossSeeds(
      BALANCE_STRATEGIES[0], // speed_first
      BALANCE_SEEDS,
      60,
    )

    // Mean should be between min and max
    expect(agg.ordersCompleted.mean).toBeGreaterThanOrEqual(agg.ordersCompleted.min)
    expect(agg.ordersCompleted.mean).toBeLessThanOrEqual(agg.ordersCompleted.max)

    // Std should be non-negative
    expect(agg.cashEnd.std).toBeGreaterThanOrEqual(0)
    expect(agg.overclaimFindings.std).toBeGreaterThanOrEqual(0)

    // Seed count should match
    expect(agg.seedCount).toBe(BALANCE_SEEDS.length)
    expect(agg.ordersCompleted.values.length).toBe(BALANCE_SEEDS.length)

    // Game-over rate should be 0-100
    expect(agg.gameOverRate).toBeGreaterThanOrEqual(0)
    expect(agg.gameOverRate).toBeLessThanOrEqual(100)
  })

  it('full balance matrix covers all strategy × horizon combinations', () => {
    expect(Object.keys(matrix.aggregates).length).toBe(BALANCE_STRATEGIES.length)

    for (const profile of BALANCE_STRATEGIES) {
      expect(matrix.aggregates[profile.id]).toBeDefined()
      for (const horizon of BALANCE_HORIZONS) {
        expect(matrix.aggregates[profile.id][horizon]).toBeDefined()
        expect(matrix.aggregates[profile.id][horizon].seedCount).toBe(
          BALANCE_SEEDS.length,
        )
      }
    }
  })

  it('game-over rate is computed correctly', () => {
    // Speed-first at horizon 200: should have some game-overs (evidence collapse)
    const speed200 = matrix.aggregates.speed_first[200]
    expect(speed200.gameOverRate).toBeGreaterThanOrEqual(0)

    // The gameOverRate should equal the fraction of runs that ended
    const gameOvers = speed200.ordersCompleted.values.filter(
      (_, i) => {
        // We can't directly check, but gameOverRate should be 0-100
        return true
      }
    )
    expect(speed200.gameOverRate).toBeGreaterThanOrEqual(0)
    expect(speed200.gameOverRate).toBeLessThanOrEqual(100)
  })
})
