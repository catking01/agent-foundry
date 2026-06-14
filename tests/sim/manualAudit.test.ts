import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import type { Artifact } from '../../src/sim/types'

/**
 * G7.1: Manual audit action test.
 *
 * Verifies that RUN_AUDIT is NOT a no-op:
 *  - It updates artifact.auditPassed
 *  - It updates artifact.auditResult
 *  - It writes a meaningful ledger entry
 */
describe('Manual Audit Action', () => {
  function makeArtifact(): Artifact {
    return {
      id: 'test-manual-audit-art',
      orderId: 'order-landing-page',
      taskId: 'some-task',
      routeId: null,
      kind: 'code',
      quality: 5,
      evidenceStrength: 8,
      defectCount: 1,
      claimLevel: 5,
      createdByAgentIds: ['agent-fastcoder'],
      createdAtTick: 0,
      hash: 'test-hash-manual',
      validationPassed: true,
      validationScore: 75,
      auditPassed: null,
      auditResult: null,
    }
  }

  it('RUN_AUDIT mutates artifact.auditPassed', () => {
    const state = createInitialState(42)

    // Manually insert a test artifact
    const artifact = makeArtifact()
    const next = {
      ...state,
      artifacts: { ...state.artifacts, [artifact.id]: artifact },
    }

    const auditor = next.agents['agent-auditor-prime']
    expect(auditor).toBeDefined()

    const result = applyPlayerAction(next, {
      type: 'RUN_AUDIT',
      artifactId: artifact.id,
      auditorAgentId: auditor.id,
      tick: next.tick,
    })

    const updated = result.artifacts[artifact.id]
    expect(updated.auditPassed).not.toBeNull()
    expect(updated.auditResult).not.toBeNull()
  })

  it('RUN_AUDIT writes a meaningful ledger entry', () => {
    const state = createInitialState(42)
    const artifact = makeArtifact()
    const next = {
      ...state,
      artifacts: { ...state.artifacts, [artifact.id]: artifact },
    }

    const auditor = next.agents['agent-auditor-prime']

    const result = applyPlayerAction(next, {
      type: 'RUN_AUDIT',
      artifactId: artifact.id,
      auditorAgentId: auditor.id,
      tick: next.tick,
    })

    const auditEvents = result.ledger.filter(
      (e) => e.eventType === 'MANUAL_AUDIT_RUN'
    )
    expect(auditEvents.length).toBe(1)
    expect(auditEvents[0].details.passed).not.toBeUndefined()
    expect(auditEvents[0].details.riskLevel).not.toBeUndefined()
    expect(auditEvents[0].details.reason).not.toBeUndefined()
    expect(auditEvents[0].details.auditorId).toBe(auditor.id)
  })

  it('RUN_AUDIT with missing artifact returns state unchanged', () => {
    const state = createInitialState(42)
    const auditor = state.agents['agent-auditor-prime']

    const result = applyPlayerAction(state, {
      type: 'RUN_AUDIT',
      artifactId: 'non-existent-artifact',
      auditorAgentId: auditor.id,
      tick: state.tick,
    })

    // Should be identical to original state (no crash)
    expect(result).toBe(state)
  })

  it('RUN_AUDIT with missing auditor returns state unchanged', () => {
    const state = createInitialState(42)
    const artifact = makeArtifact()
    const next = {
      ...state,
      artifacts: { ...state.artifacts, [artifact.id]: artifact },
    }

    const result = applyPlayerAction(next, {
      type: 'RUN_AUDIT',
      artifactId: artifact.id,
      auditorAgentId: 'non-existent-auditor',
      tick: next.tick,
    })

    expect(result).toBe(next)
  })
})
