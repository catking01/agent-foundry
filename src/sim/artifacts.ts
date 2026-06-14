import type { Agent, Artifact, Task, ArtifactKind } from './types'
import { clamp, tickRng } from './rng'
import { rollOverclaim } from './agents'
import { djb2Hash } from './hash'

/**
 * Deterministic artifact ID based on task and tick.
 * No module-level mutable counter — required for replay determinism.
 */
function nextArtifactId(seed: number, tick: number, taskId: string): string {
  const rng = tickRng(seed, tick + taskId.charCodeAt(0) * 13)
  const suffix = Math.floor(rng() * 100000).toString(16).padStart(5, '0')
  return `artifact-${tick}-${suffix}`
}

/**
 * Determine artifact kind based on task stage and order domain.
 */
function determineKind(stage: Task['stage']): ArtifactKind {
  switch (stage) {
    case 'planning':
      return 'plan'
    case 'engineering':
      return 'code'
    case 'validation':
      return 'checklist'
    case 'audit':
      return 'report'
    case 'delivery':
      return 'spec'
  }
}

/**
 * Compute artifact quality from agent + task factors.
 */
export function computeArtifactQuality(
  seed: number,
  tick: number,
  agent: Agent,
  task: Task
): number {
  const rng = tickRng(seed, tick + agent.id.charCodeAt(0) * 7)

  const base =
    agent.coding * 0.5 +
    agent.reliability * 0.3 +
    agent.creativity * task.ambiguity * 0.05

  const noise = rng() * 2 - 1
  const complexityPenalty = task.complexity * 0.4
  const fatiguePenalty = agent.fatigue * 0.2

  return clamp(base + noise - complexityPenalty - fatiguePenalty, 0, 10)
}

/**
 * Generate an artifact from an agent's work on a task.
 */
export function generateArtifact(
  seed: number,
  tick: number,
  agent: Agent,
  task: Task
): Artifact {
  const quality = computeArtifactQuality(seed, tick, agent, task)
  const overclaim = rollOverclaim(seed, tick, agent, task)

  const kind = determineKind(task.stage)

  // Defect count scales with complexity and inversely with quality
  const defectCount = Math.max(
    0,
    Math.round(task.complexity * 0.5 - quality * 0.3 + (1 - agent.reliability / 10) * 2)
  )

  const id = nextArtifactId(seed, tick, task.id)

  // Compute a simple hash for the artifact
  const hashInput = `${id}:${quality}:${overclaim.evidenceStrength}:${defectCount}:${tick}:${agent.id}`
  const hash = djb2Hash(hashInput)

  return {
    id,
    orderId: task.orderId,
    taskId: task.id,
    routeId: task.routeId,

    kind,
    quality: Math.round(quality * 10) / 10,
    evidenceStrength: Math.round(overclaim.evidenceStrength * 10) / 10,
    defectCount,
    claimLevel: Math.round(overclaim.claimLevel * 10) / 10,

    createdByAgentIds: [agent.id],
    createdAtTick: tick,

    hash,

    validationPassed: null,
    validationScore: null,
    auditPassed: null,
    auditResult: null,
  }
}

/**
 * Score an artifact for judging between competing routes.
 * Higher is better.
 */
export function scoreArtifact(artifact: Artifact): number {
  const overclaimGap = Math.max(0, artifact.claimLevel - artifact.evidenceStrength)

  return (
    artifact.quality * 1.0 +
    artifact.evidenceStrength * 0.6 -
    artifact.defectCount * 1.2 -
    overclaimGap * 1.5
  )
}

/**
 * Choose the winning artifact from a set of candidates.
 */
export function chooseWinningArtifact(artifacts: Artifact[]): Artifact | null {
  if (artifacts.length === 0) return null

  return artifacts
    .slice()
    .sort((a, b) => scoreArtifact(b) - scoreArtifact(a))[0]
}
