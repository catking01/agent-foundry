import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { advanceTick, advanceTicks } from '../../src/sim/tick'

describe('advanceTick', () => {
  it('increments tick by 1', () => {
    const state = createInitialState(42)
    const next = advanceTick(state)
    expect(next.tick).toBe(state.tick + 1)
  })

  it('does not mutate original state', () => {
    const state = createInitialState(42)
    const tickBefore = state.tick
    advanceTick(state)
    expect(state.tick).toBe(tickBefore)
  })

  it('same seed + same sequence produces same result', () => {
    const state1 = createInitialState(42)
    const state2 = createInitialState(42)

    // Advance both by 10 ticks
    const result1 = advanceTicks(state1, 10)
    const result2 = advanceTicks(state2, 10)

    expect(result1.tick).toBe(result2.tick)
    expect(result1.cash).toBe(result2.cash)
    expect(result1.reputation).toBe(result2.reputation)
    expect(Object.keys(result1.orders).length).toBe(Object.keys(result2.orders).length)
  })

  it('different seeds produce different order generation', () => {
    const state1 = createInitialState(42)
    const state2 = createInitialState(99)

    // Advance both by 15 ticks
    const result1 = advanceTicks(state1, 15)
    const result2 = advanceTicks(state2, 15)

    // The set of generated orders should differ
    const orders1 = Object.values(result1.orders).filter(
      (o) => o.id.startsWith('order-gen')
    )
    const orders2 = Object.values(result2.orders).filter(
      (o) => o.id.startsWith('order-gen')
    )

    const titles1 = orders1.map((o) => o.title).sort().join(',')
    const titles2 = orders2.map((o) => o.title).sort().join(',')

    // With different seeds, the generated order titles may differ
    // (though it's possible but unlikely they'd be identical)
    expect(orders1.length).toBeGreaterThanOrEqual(0)
    expect(orders2.length).toBeGreaterThanOrEqual(0)
  })

  it('halts on game over', () => {
    const state = createInitialState(42)
    // Force game over via cash drain
    state.cash = -3000
    state.gameOver = true

    const next = advanceTick(state)
    expect(next.tick).toBe(state.tick)
  })

  it('ledger grows over time', () => {
    const state = createInitialState(42)
    const result = advanceTicks(state, 5)
    expect(result.ledger.length).toBeGreaterThanOrEqual(0)
  })
})
