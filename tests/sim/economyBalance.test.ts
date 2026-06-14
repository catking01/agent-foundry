import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { advanceTicks } from '../../src/sim/tick'
import { applyPlayerAction } from '../../src/game/actions'
import { STARTING_CASH } from '../../src/sim/constants'

/**
 * G7.1: Economy balance tests.
 *
 * Verifies that the default economy allows at least one order to
 * complete before bankruptcy.
 */
describe('Economy Balance', () => {
  it('default starting cash is sufficient to survive first delivery', () => {
    expect(STARTING_CASH).toBeGreaterThanOrEqual(20000)
  })

  it('first starter order can complete without bankruptcy', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    // Advance until delivery or game over (up to 50 ticks max)
    for (let i = 0; i < 50; i++) {
      next = advanceTicks(next, 1)
      if (next.orders[order.id].status === 'delivered') break
      if (next.gameOver) break
    }

    // The order should be delivered before game over
    expect(next.orders[order.id].status).toBe('delivered')

    // Should NOT be game over at delivery point
    expect(next.gameOver).toBe(false)

    // Cash should be above bankruptcy threshold
    expect(next.cash).toBeGreaterThan(-3000)
  })

  it('bankruptcy check triggers only below threshold', () => {
    const state = createInitialState(42)
    state.cash = -2000
    state.gameOver = false

    // Above threshold — should not trigger
    const result1 = advanceTicks(state, 1)
    // -2000 - ~518 = ~-2518 — still above -3000
    // But if the order generator creates orders and the workshop processes,
    // costs accumulate. Let's just check that -2000 doesn't immediately kill.
    expect(result1.gameOver).toBe(false)
  })

  it('severe negative cash triggers bankruptcy', () => {
    const state = createInitialState(42)
    state.cash = -5000
    state.gameOver = false

    const result = advanceTicks(state, 1)
    expect(result.gameOver).toBe(true)
    expect(result.gameOverReason).toContain('Bankruptcy')
  })

  it('reputation collapse triggers game over', () => {
    const state = createInitialState(42)
    state.reputation = 5

    const result = advanceTicks(state, 1)
    expect(result.gameOver).toBe(true)
    expect(result.gameOverReason).toContain('Reputation')
  })

  it('evidence integrity failure triggers game over', () => {
    const state = createInitialState(42)
    state.evidenceIntegrity = 15

    const result = advanceTicks(state, 1)
    expect(result.gameOver).toBe(true)
    expect(result.gameOverReason).toContain('Evidence')
  })
})
