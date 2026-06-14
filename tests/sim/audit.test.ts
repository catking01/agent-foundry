import { describe, it, expect } from 'vitest'
import { runAudit } from '../../src/sim/audit'
import type { Artifact, Agent } from '../../src/sim/types'

function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    id: 'test-art',
    orderId: 'order-1',
    taskId: 'task-1',
    routeId: null,
    kind: 'code',
    quality: 7,
    evidenceStrength: 7,
    defectCount: 1,
    claimLevel: 7,
    createdByAgentIds: ['agent-1'],
    createdAtTick: 0,
    hash: 'abc12345',
    validationPassed: null,
    validationScore: null,
    auditPassed: null,
    auditResult: null,
    ...overrides,
  }
}

function makeAuditor(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'auditor-1',
    name: 'TestAuditor',
    role: 'auditor',
    salaryPerTick: 50,
    planning: 3,
    coding: 2,
    validation: 7,
    auditing: 9,
    creativity: 2,
    reliability: 9,
    speed: 3,
    overclaimRisk: 0,
    fatigue: 0,
    specialization: ['runtime'],
    currentTaskId: null,
    status: 'idle',
    ...overrides,
  }
}

describe('runAudit', () => {
  it('passes a clean artifact', () => {
    const artifact = makeArtifact({ quality: 8, evidenceStrength: 8, claimLevel: 8 })
    const auditor = makeAuditor({ auditing: 9 })
    const result = runAudit(42, 0, artifact, auditor, false)

    expect(result.passed).toBe(true)
    expect(result.riskLevel).toBe('low')
  })

  it('detects overclaim with skilled auditor', () => {
    const artifact = makeArtifact({
      claimLevel: 9,
      evidenceStrength: 3,
    })
    const auditor = makeAuditor({ auditing: 9 })

    let detections = 0
    for (let tick = 0; tick < 50; tick++) {
      const result = runAudit(42, tick, artifact, auditor, false)
      if (result.overclaimDetected) detections++
    }

    expect(detections).toBeGreaterThan(0)
  })

  it('detects evidence gaps', () => {
    const artifact = makeArtifact({
      evidenceStrength: 2,
      claimLevel: 5,
    })
    const auditor = makeAuditor({ auditing: 9 })

    let detections = 0
    for (let tick = 0; tick < 50; tick++) {
      const result = runAudit(42, tick, artifact, auditor, false)
      if (result.evidenceGapDetected) detections++
    }

    expect(detections).toBeGreaterThan(0)
  })

  it('detects hidden failures when present', () => {
    const artifact = makeArtifact({ quality: 7 })
    const auditor = makeAuditor({ auditing: 9 })

    let detections = 0
    for (let tick = 0; tick < 50; tick++) {
      const result = runAudit(42, tick, artifact, auditor, true)
      if (result.hiddenFailureDetected) detections++
    }

    expect(detections).toBeGreaterThan(0)
  })

  it('does not detect hidden failures when none exist', () => {
    const artifact = makeArtifact({ quality: 8 })
    const auditor = makeAuditor({ auditing: 9 })

    const result = runAudit(42, 0, artifact, auditor, false)
    // Without hidden failures, this flag should always be false
    expect(result.hiddenFailureDetected).toBe(false)
  })

  it('poor auditor misses issues', () => {
    const artifact = makeArtifact({
      claimLevel: 9,
      evidenceStrength: 2,
    })
    const poorAuditor = makeAuditor({ auditing: 2 })

    let detections = 0
    for (let tick = 0; tick < 50; tick++) {
      const result = runAudit(42, tick, artifact, poorAuditor, true)
      if (!result.passed) detections++
    }

    // Low-skill auditor should detect less often
    expect(detections).toBeLessThan(40)
  })

  it('risk level increases with multiple issues', () => {
    const artifact = makeArtifact({
      claimLevel: 9,
      evidenceStrength: 2,
    })
    const auditor = makeAuditor({ auditing: 9 })

    // Run and check if risk levels can be high
    const results: string[] = []
    for (let tick = 0; tick < 100; tick++) {
      const result = runAudit(42, tick, artifact, auditor, true)
      results.push(result.riskLevel)
    }

    // Should have some medium or high risk results
    const hasNonLow = results.some((r) => r !== 'low')
    expect(hasNonLow).toBe(true)
  })
})
