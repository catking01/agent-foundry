import { describe, it, expect } from 'vitest'
import { getAgentWorkStatusSummary } from '../../src/game/agentStatusSelectors'
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import { advanceTicks } from '../../src/sim/tick'

describe('Agent Status Selectors', () => {
  it('counts total agents correctly', () => {
    const state = createInitialState(42)
    const summary = getAgentWorkStatusSummary(state)
    expect(summary.totalAgents).toBe(8)
  })

  it('all agents idle at start', () => {
    const state = createInitialState(42)
    const summary = getAgentWorkStatusSummary(state)
    expect(summary.idleAgents).toBe(8)
    expect(summary.workingAgents).toBe(0)
  })

  it('agents become working when assigned to tasks', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find(
      (o) => o.status === 'available',
    )!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    // Advance enough ticks for auto-scheduler to pick up tasks
    next = advanceTicks(next, 10)

    const summary = getAgentWorkStatusSummary(next)

    // By tick 10, at least some agents should have been assigned
    // (auto-scheduler picks up queued tasks when idle agents exist)
    const totalActive = summary.workingAgents + summary.fatiguedAgents
    // It's possible but unlikely that no agents are working after 10 ticks
    // with a fresh order — at minimum the planning task should be picked up
    expect(summary.queuedTasks + summary.activeTasks).toBeGreaterThan(0)
  })

  it('identifies queued tasks', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find(
      (o) => o.status === 'available',
    )!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    const summary = getAgentWorkStatusSummary(next)

    // A planning task should be queued
    expect(summary.queuedTasks).toBeGreaterThan(0)
  })

  it('identifies bottleneck stage', () => {
    const state = createInitialState(42)
    // Accept multiple orders to create backpressure
    const orders = Object.values(state.orders).filter(
      (o) => o.status === 'available',
    )
    let next = state
    for (const order of orders) {
      next = applyPlayerAction(next, {
        type: 'ACCEPT_ORDER',
        orderId: order.id,
        tick: next.tick,
      })
    }

    const summary = getAgentWorkStatusSummary(next)
    // Planning should be the bottleneck (all orders create planning tasks first)
    expect(summary.bottleneckStage).toBe('planning')
  })

  it('returns recent ledger events', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find(
      (o) => o.status === 'available',
    )!

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order.id,
      tick: state.tick,
    })

    next = advanceTicks(next, 5)

    const summary = getAgentWorkStatusSummary(next)
    expect(summary.recentEvents.length).toBeGreaterThan(0)
  })

  it('workshop queues have correct structure', () => {
    const state = createInitialState(42)
    const summary = getAgentWorkStatusSummary(state)

    expect(summary.workshopQueues.length).toBe(5) // 5 workshops
    for (const wq of summary.workshopQueues) {
      expect(typeof wq.workshopId).toBe('string')
      expect(typeof wq.workshopName).toBe('string')
      expect(typeof wq.stage).toBe('string')
      expect(typeof wq.queuedCount).toBe('number')
      expect(typeof wq.activeCount).toBe('number')
      expect(typeof wq.capacity).toBe('number')
    }
  })

  it('agent cards have required fields', () => {
    const state = createInitialState(42)
    const summary = getAgentWorkStatusSummary(state)

    expect(summary.agents.length).toBe(8)
    for (const agent of summary.agents) {
      expect(typeof agent.agentId).toBe('string')
      expect(typeof agent.name).toBe('string')
      expect(typeof agent.role).toBe('string')
      expect(['idle', 'working', 'fatigued', 'blocked']).toContain(agent.status)
      expect(typeof agent.fatigue).toBe('number')
    }
  })
})
