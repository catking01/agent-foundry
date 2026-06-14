import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { advanceTick, advanceTicks } from '../../src/sim/tick'
import { applyPlayerAction } from '../../src/game/actions'
import { selectDeliverableArtifact, judgeParallelRoutes } from '../../src/sim/workshops'
import { scoreArtifact } from '../../src/sim/artifacts'
import type { Artifact } from '../../src/sim/types'

/**
 * G7.1: Parallel route delivery integration tests.
 *
 * Verifies:
 *  - Parallel routes create multiple competing artifacts
 *  - Winner is selected by scoreArtifact (quality + evidence - defects - overclaim)
 *  - Delivery uses the scoreArtifact winner
 *  - Losers remain archived
 */
describe('Parallel Route Delivery Integration', () => {
  function makeArtifact(
    id: string,
    orderId: string,
    routeId: string | null,
    taskId: string,
    quality: number,
    evidenceStrength: number,
    defectCount: number,
    claimLevel: number,
  ): Artifact {
    return {
      id,
      orderId,
      taskId,
      routeId,
      kind: 'code',
      quality,
      evidenceStrength,
      defectCount,
      claimLevel,
      createdByAgentIds: ['agent-1'],
      createdAtTick: 0,
      hash: 'test-hash-' + id,
      validationPassed: true,
      validationScore: 80,
      auditPassed: true,
      auditResult: { passed: true, overclaimDetected: false, evidenceGapDetected: false, hiddenFailureDetected: false, riskLevel: 'low', reason: 'ok' },
    }
  }

  it('selectDeliverableArtifact picks winner by scoreArtifact among routes', () => {
    const state = createInitialState(42)
    const orderId = 'order-landing-page'

    // Accept order + start parallel routes
    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId,
      tick: state.tick,
    })
    next = applyPlayerAction(next, {
      type: 'START_PARALLEL_ROUTES',
      orderId,
      routeCount: 3,
      tick: next.tick,
    })

    // Manually add 3 artifacts to simulate route completion
    const task1 = Object.values(next.tasks).find((t) => t.routeId === `${orderId}-route-1`)!
    const task2 = Object.values(next.tasks).find((t) => t.routeId === `${orderId}-route-2`)!
    const task3 = Object.values(next.tasks).find((t) => t.routeId === `${orderId}-route-3`)!

    next.artifacts = {
      ...next.artifacts,
      'r1': makeArtifact('r1', orderId, `${orderId}-route-1`, task1.id, 9, 3, 0, 9),
      'r2': makeArtifact('r2', orderId, `${orderId}-route-2`, task2.id, 6, 9, 1, 6),
      'r3': makeArtifact('r3', orderId, `${orderId}-route-3`, task3.id, 7, 7, 2, 7),
    }

    // r1: quality=9, evidence=3, defects=0, claim=9
    //   overclaimGap = max(0, 9-3) = 6
    //   score = 9*1.0 + 3*0.6 - 0*1.2 - 6*1.5 = 9 + 1.8 - 0 - 9 = 1.8
    // r2: quality=6, evidence=9, defects=1, claim=6
    //   overclaimGap = max(0, 6-9) = 0
    //   score = 6 + 5.4 - 1.2 - 0 = 10.2
    // r3: quality=7, evidence=7, defects=2, claim=7
    //   overclaimGap = 0
    //   score = 7 + 4.2 - 2.4 - 0 = 8.8

    expect(scoreArtifact(next.artifacts['r1'])).toBeCloseTo(1.8, 1)
    expect(scoreArtifact(next.artifacts['r2'])).toBeCloseTo(10.2, 1)
    expect(scoreArtifact(next.artifacts['r3'])).toBeCloseTo(8.8, 1)

    // r2 should win (highest score by scoreArtifact) despite lower quality than r1
    const winner = selectDeliverableArtifact(next, orderId)
    expect(winner).not.toBeNull()
    expect(winner!.id).toBe('r2')

    // Verify losers
    const { losers } = judgeParallelRoutes(next, orderId)
    expect(losers.length).toBe(2)
    const loserIds = losers.map((l) => l.id)
    expect(loserIds).toContain('r1')
    expect(loserIds).toContain('r3')
    // Loser r1 has high quality (9) but huge overclaim — correctly rejected
  })

  it('manual DELIVER_ORDER uses selectDeliverableArtifact', () => {
    const state = createInitialState(42)
    const orderId = 'order-landing-page'

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId,
      tick: state.tick,
    })
    next = applyPlayerAction(next, {
      type: 'START_PARALLEL_ROUTES',
      orderId,
      routeCount: 2,
      tick: next.tick,
    })

    // Add artifacts with different score properties
    const task1 = Object.values(next.tasks).find((t) => t.routeId === `${orderId}-route-1`)!
    const task2 = Object.values(next.tasks).find((t) => t.routeId === `${orderId}-route-2`)!

    next.artifacts = {
      ...next.artifacts,
      'high-q-low-ev': makeArtifact('high-q-low-ev', orderId, `${orderId}-route-1`, task1.id, 10, 1, 0, 10),
      'moderate-q-high-ev': makeArtifact('moderate-q-high-ev', orderId, `${orderId}-route-2`, task2.id, 6, 10, 0, 6),
    }

    // high-q-low-ev: score = 10*1 + 1*0.6 - 0 - (10-1)*1.5 = 10 + 0.6 - 13.5 = -2.9
    // moderate-q-high-ev: score = 6 + 6 - 0 - 0 = 12.0
    // moderate-q-high-ev should win

    const winner = selectDeliverableArtifact(next, orderId)
    expect(winner).not.toBeNull()
    expect(winner!.id).toBe('moderate-q-high-ev')
  })

  it('loser artifacts remain archived after delivery', () => {
    const state = createInitialState(42)
    const orderId = 'order-landing-page'

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId,
      tick: state.tick,
    })
    next = applyPlayerAction(next, {
      type: 'START_PARALLEL_ROUTES',
      orderId,
      routeCount: 2,
      tick: next.tick,
    })

    const task1 = Object.values(next.tasks).find((t) => t.routeId === `${orderId}-route-1`)!
    const task2 = Object.values(next.tasks).find((t) => t.routeId === `${orderId}-route-2`)!

    next.artifacts = {
      ...next.artifacts,
      'winner-art': makeArtifact('winner-art', orderId, `${orderId}-route-1`, task1.id, 8, 8, 0, 8),
      'loser-art': makeArtifact('loser-art', orderId, `${orderId}-route-2`, task2.id, 3, 2, 5, 9),
    }

    const { winner, losers } = judgeParallelRoutes(next, orderId)

    expect(winner!.id).toBe('winner-art')
    expect(losers.length).toBe(1)
    expect(losers[0].id).toBe('loser-art')

    // After delivery, losers should still exist in state.artifacts
    expect(next.artifacts['loser-art']).toBeDefined()
    expect(next.artifacts['winner-art']).toBeDefined()
  })
})
