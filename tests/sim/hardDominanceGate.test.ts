import { describe, it, expect } from 'vitest'
import {
  generateBalanceExport,
  type HardGateResult,
} from '../../src/sim/balanceExport'
import { BALANCE_SEEDS, BALANCE_STRATEGIES } from '../../src/sim/balanceRunner'

/**
 * G10: Hard dominance gate tests.
 *
 * These tests HARD FAIL if any of the following are true:
 *  - A strategy dominates all others across all dimensions
 *  - Speed-first does NOT have higher trust risk than balanced
 *  - Quality-first does NOT have <= incidents than speed-first
 *  - Parallel-heavy does NOT spend more on routes than speed-first
 *
 * These are the "regression gates" that must never break.
 */
describe('Hard Dominance Gate', () => {
  const exp = generateBalanceExport(BALANCE_SEEDS, [60, 100], BALANCE_STRATEGIES)

  function findGate(name: string): HardGateResult {
    const gate = exp.hardGates.find((g) => g.gate === name)
    if (!gate) throw new Error(`Gate not found: ${name}`)
    return gate
  }

  it('HARD GATE: no strategy dominates all others at horizon 60', () => {
    const gate = findGate('no-strategy-dominates-all')
    // Re-check at horizon 60 specifically
    const dom60 = exp.dominanceReports[60]
    const dominatesAll60 = Object.entries(dom60.dominatedBy).filter(
      ([, dominators]) => dominators.length >= BALANCE_STRATEGIES.length - 1,
    )
    expect(dominatesAll60.length).toBe(0)
  })

  it('HARD GATE: no strategy dominates all others at horizon 100', () => {
    const gate = findGate('no-strategy-dominates-all')
    expect(gate.passed).toBe(true)
  })

  it('HARD GATE: speed-first has lower evidence integrity than balanced', () => {
    const gate = findGate('speed-lower-evidence-than-balanced')
    expect(gate.passed).toBe(true)
  })

  it('HARD GATE: quality-first has fewer or equal incidents vs speed-first', () => {
    const gate = findGate('quality-fewer-incidents-than-speed')
    expect(gate.passed).toBe(true)
  })

  it('HARD GATE: parallel-heavy spends more on routes than speed-first', () => {
    const gate = findGate('parallel-more-route-spend-than-speed')
    expect(gate.passed).toBe(true)
  })

  it('HARD GATE: game-over rate is computed from raw runs', () => {
    const gate = findGate('gameover-rate-matches-raw-runs')
    expect(gate.passed).toBe(true)
  })

  it('HARD GATE: balanced survival rate is explicitly measured', () => {
    const gate = findGate('balanced-survival-explicitly-measured')
    expect(gate.passed).toBe(true)
  })

  it('all hard gates are present and have detail strings', () => {
    expect(exp.hardGates.length).toBeGreaterThanOrEqual(6)
    for (const gate of exp.hardGates) {
      expect(gate.gate).toBeTruthy()
      expect(typeof gate.passed).toBe('boolean')
      expect(gate.detail.length).toBeGreaterThan(0)
    }
  })
})
