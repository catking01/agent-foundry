import { describe, it, expect } from 'vitest'
import { scriptValidate, agentSemanticValidate, runValidation } from '../../src/sim/validation'
import type { Artifact, Agent } from '../../src/sim/types'

function makeTestArtifact(overrides: Partial<Artifact> = {}): Artifact {
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

function makeTestAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'test-agent',
    name: 'TestAgent',
    role: 'validator',
    salaryPerTick: 30,
    planning: 5,
    coding: 5,
    validation: 9,
    auditing: 5,
    creativity: 5,
    reliability: 9,
    speed: 5,
    overclaimRisk: 1,
    fatigue: 0,
    specialization: ['web'],
    currentTaskId: null,
    status: 'idle',
    ...overrides,
  }
}

describe('scriptValidate', () => {
  it('passes a good artifact', () => {
    const result = scriptValidate(makeTestArtifact())
    expect(result.passed).toBe(true)
    expect(result.defectsFound).toBe(1)
  })

  it('fails an artifact with very low quality', () => {
    const result = scriptValidate(makeTestArtifact({ quality: 1 }))
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('Quality')
  })

  it('fails an artifact with too many defects', () => {
    const result = scriptValidate(makeTestArtifact({ defectCount: 5 }))
    expect(result.passed).toBe(false)
    expect(result.reason).toContain('defects')
  })

  it('returns a numeric score', () => {
    const result = scriptValidate(makeTestArtifact())
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})

describe('agentSemanticValidate', () => {
  it('detects overclaim with a skilled validator', () => {
    const artifact = makeTestArtifact({
      claimLevel: 9,
      evidenceStrength: 2,
      quality: 7,
    })
    const agent = makeTestAgent({ validation: 9 })

    // Run multiple times to check detection probability > 0
    let detections = 0
    for (let tick = 0; tick < 50; tick++) {
      const result = agentSemanticValidate(42, tick, artifact, agent)
      if (!result.passed) detections++
    }

    // Should detect at least some of the time with high-skill validator
    expect(detections).toBeGreaterThan(0)
  })

  it('passes a well-evidenced artifact', () => {
    const artifact = makeTestArtifact({
      claimLevel: 7,
      evidenceStrength: 8,
      quality: 8,
    })
    const agent = makeTestAgent({ validation: 9 })

    const result = agentSemanticValidate(42, 0, artifact, agent)
    // Should generally pass for high-quality artifacts
    // (probabilistic, but high-skill validator on good artifact usually passes)
    expect(result.score).toBeGreaterThan(50)
  })

  it('unskilled validator misses issues', () => {
    const artifact = makeTestArtifact({
      claimLevel: 9,
      evidenceStrength: 2,
      quality: 5,
    })
    const poorAgent = makeTestAgent({ validation: 2 })

    // Run multiple times
    let detections = 0
    for (let tick = 0; tick < 50; tick++) {
      const result = agentSemanticValidate(42, tick, artifact, poorAgent)
      if (!result.passed) detections++
    }

    // Low-skill validator should detect less often than high-skill
    // (We can't guarantee, but the rate should be lower)
    expect(detections).toBeLessThan(45)
  })
})

describe('runValidation', () => {
  it('combines script and agent validation', () => {
    const artifact = makeTestArtifact({ quality: 8, evidenceStrength: 8, defectCount: 0 })
    const agent = makeTestAgent({ validation: 9 })

    const result = runValidation(42, 0, artifact, agent)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.reason).toContain('[Script]')
    expect(result.reason).toContain('[Agent]')
  })

  it('script validation alone works without agent', () => {
    const artifact = makeTestArtifact({ defectCount: 5 })
    const result = runValidation(42, 0, artifact, null)
    expect(result.passed).toBe(false)
  })
})
