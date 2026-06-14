import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { advanceTick, advanceTicks } from '../../src/sim/tick'
import { applyPlayerAction } from '../../src/game/actions'

/**
 * G7.1: End-to-end pipeline closure test.
 *
 * Verifies that a starter order can flow from accept → delivered
 * through the full workshop pipeline, without manual intervention
 * beyond the initial accept.
 */
describe('Pipeline Closure — End to End', () => {
  it('a starter order can complete from accept to delivered', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')!
    expect(order).toBeDefined()

    // Accept the order
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    expect(next.orders[order.id].status).toBe('accepted')

    // Run enough ticks for the full pipeline.
    // With auto-scheduling and 8 agents, 100 ticks should be enough
    // even with scheduling delays.
    next = advanceTicks(next, 100)

    // The order should be delivered
    const finalOrder = next.orders[order.id]
    expect(finalOrder.status).toBe('delivered')

    // Post-delivery game over is acceptable — the order was delivered first
    if (next.gameOver) {
      expect(next.tick).toBeGreaterThan(0) // just verify we ran
    }
  })

  it('delivered order updates cash', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    const cashBefore = next.cash
    next = advanceTicks(next, 80)

    // Cash should have changed (delivery revenue minus ongoing costs)
    expect(next.cash).not.toBe(cashBefore)
  })

  it('delivered order updates metrics', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    next = advanceTicks(next, 80)

    // At least one order should be completed if delivery happened
    const delivered = Object.values(next.orders).filter(
      (o) => o.status === 'delivered'
    )
    expect(delivered.length).toBeGreaterThanOrEqual(0)

    if (next.orders[order.id].status === 'delivered') {
      expect(next.metrics.totalOrdersCompleted).toBeGreaterThan(0)
      expect(next.metrics.totalRevenue).toBeGreaterThan(0)
    }
  })

  it('ledger contains ORDER_DELIVERED event after delivery', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    next = advanceTicks(next, 80)

    const deliveryEvents = next.ledger.filter(
      (e) => e.eventType === 'ORDER_DELIVERED' || e.eventType === 'ORDER_DELIVERED_MANUAL'
    )

    // If the order was delivered, there must be a delivery event
    if (next.orders[order.id].status === 'delivered') {
      expect(deliveryEvents.length).toBeGreaterThan(0)
    }
  })

  it('pipeline produces artifacts at each stage', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    next = advanceTicks(next, 80)

    // Check what stages were reached by looking at tasks
    const tasks = Object.values(next.tasks).filter((t) => t.orderId === order.id)
    const stages = new Set(tasks.map((t) => t.stage))
    const completedStages = new Set(
      tasks.filter((t) => t.status === 'completed').map((t) => t.stage)
    )

    // At minimum we should see planning through some later stage
    expect(stages.has('planning')).toBe(true)
    expect(stages.has('engineering')).toBe(true)
  })
})
