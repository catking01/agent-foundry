import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import { startParallelRoutes, judgeParallelRoutes } from '../../src/sim/workshops'

describe('Parallel Routes', () => {
  it('starting parallel routes creates multiple engineering tasks', () => {
    const state = createInitialState(42)

    // First accept an order
    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    // Start 3 parallel routes
    next = applyPlayerAction(next, {
      type: 'START_PARALLEL_ROUTES',
      orderId: order!.id,
      routeCount: 3,
      tick: next.tick,
    })

    // Should have 3 route-specific engineering tasks
    const routeTasks = Object.values(next.tasks).filter(
      (t) => t.orderId === order!.id && t.routeId !== null
    )
    expect(routeTasks.length).toBe(3)

    // Each should have a unique routeId
    const routeIds = routeTasks.map((t) => t.routeId)
    expect(new Set(routeIds).size).toBe(3)
  })

  it('parallel routes cost cash', () => {
    const state = createInitialState(42)

    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    const cashBefore = next.cash

    next = applyPlayerAction(next, {
      type: 'START_PARALLEL_ROUTES',
      orderId: order!.id,
      routeCount: 2,
      tick: next.tick,
    })

    expect(next.cash).toBeLessThan(cashBefore)
  })

  it('judge can select a winning artifact', () => {
    const state = createInitialState(42)

    // Accept and start routes
    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    next = applyPlayerAction(next, {
      type: 'START_PARALLEL_ROUTES',
      orderId: order!.id,
      routeCount: 2,
      tick: next.tick,
    })

    // Manually create artifacts for testing judge
    // (simulate engineering completion)
    const routeTask1 = Object.values(next.tasks).find(
      (t) => t.orderId === order!.id && t.routeId === `${order!.id}-route-1`
    )
    const routeTask2 = Object.values(next.tasks).find(
      (t) => t.orderId === order!.id && t.routeId === `${order!.id}-route-2`
    )

    expect(routeTask1).toBeDefined()
    expect(routeTask2).toBeDefined()

    // Add two artifacts
    next.artifacts = {
      ...next.artifacts,
      'test-art-1': {
        id: 'test-art-1',
        orderId: order!.id,
        taskId: routeTask1!.id,
        routeId: routeTask1!.routeId,
        kind: 'code',
        quality: 8,
        evidenceStrength: 7,
        defectCount: 1,
        claimLevel: 7,
        createdByAgentIds: ['agent-fastcoder'],
        createdAtTick: next.tick,
        hash: 'abc12345',
        validationPassed: null,
        validationScore: null,
        auditPassed: null,
        auditResult: null,
      },
      'test-art-2': {
        id: 'test-art-2',
        orderId: order!.id,
        taskId: routeTask2!.id,
        routeId: routeTask2!.routeId,
        kind: 'code',
        quality: 5,
        evidenceStrength: 9,
        defectCount: 3,
        claimLevel: 5,
        createdByAgentIds: ['agent-quick-scripter'],
        createdAtTick: next.tick,
        hash: 'def67890',
        validationPassed: null,
        validationScore: null,
        auditPassed: null,
        auditResult: null,
      },
    }

    const { winner, losers } = judgeParallelRoutes(next, order!.id)
    expect(winner).not.toBeNull()
    expect(losers.length).toBe(1)
  })

  it('losers remain in the system for audit visibility', () => {
    const state = createInitialState(42)

    const order = Object.values(state.orders).find((o) => o.status === 'available')
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    next = applyPlayerAction(next, {
      type: 'START_PARALLEL_ROUTES',
      orderId: order!.id,
      routeCount: 2,
      tick: next.tick,
    })

    // Add artifacts
    const routeTask1 = Object.values(next.tasks).find(
      (t) => t.routeId === `${order!.id}-route-1`
    )
    const routeTask2 = Object.values(next.tasks).find(
      (t) => t.routeId === `${order!.id}-route-2`
    )

    next.artifacts = {
      ...next.artifacts,
      'art-a': {
        id: 'art-a',
        orderId: order!.id,
        taskId: routeTask1!.id,
        routeId: routeTask1!.routeId,
        kind: 'code',
        quality: 8,
        evidenceStrength: 8,
        defectCount: 0,
        claimLevel: 8,
        createdByAgentIds: ['agent-steady-builder'],
        createdAtTick: next.tick,
        hash: 'abc',
        validationPassed: null,
        validationScore: null,
        auditPassed: null,
        auditResult: null,
      },
      'art-b': {
        id: 'art-b',
        orderId: order!.id,
        taskId: routeTask2!.id,
        routeId: routeTask2!.routeId,
        kind: 'code',
        quality: 3,
        evidenceStrength: 2,
        defectCount: 5,
        claimLevel: 9,
        createdByAgentIds: ['agent-quick-scripter'],
        createdAtTick: next.tick,
        hash: 'def',
        validationPassed: null,
        validationScore: null,
        auditPassed: null,
        auditResult: null,
      },
    }

    const { winner, losers } = judgeParallelRoutes(next, order!.id)

    // Winner should be art-a (higher quality)
    expect(winner!.id).toBe('art-a')

    // Loser art-b remains accessible
    expect(losers.length).toBe(1)
    expect(losers[0].id).toBe('art-b')
    // Loser has high overclaim (claim 9 but evidence 2)
    const loserGap = Math.max(0, losers[0].claimLevel - losers[0].evidenceStrength)
    expect(loserGap).toBeGreaterThan(3)
  })
})
