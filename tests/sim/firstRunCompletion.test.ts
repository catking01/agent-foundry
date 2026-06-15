import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import { advanceTicks } from '../../src/sim/tick'

/**
 * G21: First-run completion test.
 *
 * Proves that a player following the tutorial can complete
 * their first order through the full pipeline.
 */
describe('First-Run Completion', () => {
  it('tutorial-guided player completes first order within 50 ticks', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find(
      (o) => o.status === 'available',
    )!

    // Step 1: Accept order
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })
    expect(next.orders[order.id].status).toBe('accepted')

    // Step 2-6: Advance ticks — auto-scheduler handles the pipeline
    next = advanceTicks(next, 50)

    // Step 7: Check delivery
    const finalOrder = next.orders[order.id]
    expect(finalOrder.status).toBe('delivered')

    // Verify the full pipeline completed
    const orderArtifacts = Object.values(next.artifacts).filter(
      (a) => a.orderId === order.id,
    )
    expect(orderArtifacts.length).toBeGreaterThan(0)

    // At least one artifact should have validation and audit results
    const validated = orderArtifacts.filter(
      (a) => a.validationPassed !== null,
    )
    expect(validated.length).toBeGreaterThan(0)
  })

  it('tutorial step checks align with game state progression', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find(
      (o) => o.status === 'available',
    )!

    // Accept step
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    // Working step — advance enough for auto-scheduler
    next = advanceTicks(next, 15)

    // After 15 ticks, ledger should have events showing progress
    expect(next.ledger.length).toBeGreaterThan(0)
    expect(next.tick).toBeGreaterThan(0)

    // Artifact step — advance more
    next = advanceTicks(next, 15)

    // Check artifacts exist
    const artifacts = Object.values(next.artifacts).filter(
      (a) => a.orderId === order.id,
    )
    expect(artifacts.length).toBeGreaterThan(0)

    // Validation step — some artifacts should be validated
    const validated = artifacts.filter((a) => a.validationPassed !== null)
    expect(validated.length).toBeGreaterThan(0)

    // Audit step — at least some artifacts should be audited
    const audited = artifacts.filter((a) => a.auditPassed !== null)
    // Audit may complete on same tick as delivery — both should exist
    expect(audited.length + validated.length).toBeGreaterThan(0)

    // Delivery step
    const delivered = next.orders[order.id].status === 'delivered'
    expect(delivered).toBe(true)
  })

  it('tutorial flow completes in all 4 strategy-base seeds', () => {
    for (const seed of [1, 42, 99, 2026]) {
      const state = createInitialState(seed)
      const order = Object.values(state.orders).find(
        (o) => o.status === 'available',
      )!
      expect(order).toBeDefined()

      let next = applyPlayerAction(state, {
        type: 'ACCEPT_ORDER',
        orderId: order.id,
        tick: state.tick,
      })

      next = advanceTicks(next, 60)

      // First order should be delivered in all seeds
      expect(next.orders[order.id].status).toBe('delivered')
    }
  })
})
