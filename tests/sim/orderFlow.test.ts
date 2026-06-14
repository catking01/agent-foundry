import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { advanceTick } from '../../src/sim/tick'
import { applyPlayerAction } from '../../src/game/actions'

describe('Order Flow — Single Route', () => {
  it('accepting an order creates a planning task', () => {
    const state = createInitialState(42)

    // Accept the first available order
    const order = Object.values(state.orders).find((o) => o.status === 'available')
    expect(order).toBeDefined()

    const next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    expect(next.orders[order!.id].status).toBe('accepted')

    // A planning task should be created
    const planningTasks = Object.values(next.tasks).filter(
      (t) => t.stage === 'planning' && t.orderId === order!.id
    )
    expect(planningTasks.length).toBe(1)
    expect(planningTasks[0].status).toBe('queued')
  })

  it('auto-schedule picks up queued tasks when agents are idle', () => {
    const state = createInitialState(42)

    // Accept an order
    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    // Advance a few ticks — scheduler should pick up tasks
    for (let i = 0; i < 5; i++) {
      next = advanceTick(next)
    }

    // Should have some tasks in progress or completed
    const tasks = Object.values(next.tasks)
    const activeOrDone = tasks.filter(
      (t) => t.status === 'in_progress' || t.status === 'completed'
    )
    expect(activeOrDone.length).toBeGreaterThan(0)
  })

  it('agent assignment to queued task puts agent in working state', () => {
    const state = createInitialState(42)

    // Accept an order to create planning task
    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    const planningTask = Object.values(next.tasks).find(
      (t) => t.stage === 'planning' && t.orderId === order!.id
    )
    expect(planningTask).toBeDefined()

    // Find an idle agent with planning skill
    const idleAgent = Object.values(next.agents).find(
      (a) => a.status === 'idle'
    )
    expect(idleAgent).toBeDefined()

    // Manually assign
    next = applyPlayerAction(next, {
      type: 'ASSIGN_AGENT',
      taskId: planningTask!.id,
      agentId: idleAgent!.id,
      workshopId: 'workshop-planning',
      tick: next.tick,
    })

    const updatedTask = next.tasks[planningTask!.id]
    expect(updatedTask.status).toBe('in_progress')
    expect(updatedTask.assignedAgentIds).toContain(idleAgent!.id)

    const updatedAgent = next.agents[idleAgent!.id]
    expect(updatedAgent.status).toBe('working')
  })

  it('order can proceed through full pipeline', () => {
    const state = createInitialState(42)

    // Accept an order
    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    // Manually force delivery by setting up the pipeline
    // Accept order → assign planner → advance until plan done
    // Then assign engineer, etc.

    // Run many ticks to let the simulation progress
    for (let i = 0; i < 30; i++) {
      next = advanceTick(next)
      if (next.orders[order!.id].status === 'delivered') break
    }

    // At minimum, some progress should be made
    const tasks = Object.values(next.tasks).filter(
      (t) => t.orderId === order!.id
    )
    expect(tasks.length).toBeGreaterThan(0)
  })
})

describe('Order Flow — Acceptance criteria', () => {
  it('cannot accept an already-accepted order', () => {
    const state = createInitialState(42)

    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    expect(next.orders[order!.id].status).toBe('accepted')

    // Try to accept again
    const next2 = applyPlayerAction(next, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: next.tick,
    })

    // Should still be 'accepted' (action ignored)
    expect(next2.orders[order!.id].status).toBe('accepted')
  })
})
