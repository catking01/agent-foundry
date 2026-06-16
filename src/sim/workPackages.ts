// ============================================================
// G26: Work Package Lifecycle
// ============================================================
//
// Handles creation, fan-out, execution, and merging of work
// packages in the hierarchical organization simulation.
// ============================================================

import type { WorkPackage, WorkPackageStatus, WorkPackageStage, OrgArtifact } from './orgModel'
import { mulberry32, clamp } from './rng'

/** A deterministic RNG function: () → number in [0,1) */
type RngFn = () => number

// ============================================================
// Work Package Creation
// ============================================================

let packageCounter = 0

export function resetPackageCounter(): void {
  packageCounter = 0
}

export function createWorkPackage(params: {
  orderId: string
  parentPackageId: string | null
  assignedUnitId: string
  leadAgentId: string | null
  workerAgentIds: string[]
  stage: WorkPackageStage
  complexity: number
  tick: number
}): WorkPackage {
  packageCounter++
  return {
    id: `wp-${params.orderId}-${packageCounter}`,
    orderId: params.orderId,
    parentPackageId: params.parentPackageId,
    assignedUnitId: params.assignedUnitId,
    leadAgentId: params.leadAgentId,
    workerAgentIds: params.workerAgentIds,
    stage: params.stage,
    status: 'queued',
    childPackageIds: [],
    artifactIds: [],
    coordinationCost: 0,
    handoffCount: 0,
    createdAtTick: params.tick,
    completedAtTick: null,
    complexity: params.complexity,
  }
}

// ============================================================
// Work Package Stage Progression
// ============================================================

export function advancePackageStage(pkg: WorkPackage, nextStage: WorkPackageStage): WorkPackage {
  return { ...pkg, stage: nextStage }
}

export function setPackageStatus(pkg: WorkPackage, status: WorkPackageStatus, tick: number): WorkPackage {
  return {
    ...pkg,
    status,
    completedAtTick: status === 'completed' || status === 'failed' ? tick : pkg.completedAtTick,
  }
}

export function startPackage(pkg: WorkPackage): WorkPackage {
  return { ...pkg, status: 'in_progress' }
}

// ============================================================
// Worker Artifact Generation
// ============================================================

/**
 * Generate an artifact from a worker executing a work package.
 * Uses profile-derived parameters to create a deterministic artifact.
 *
 * @param rng - Deterministic RNG seeded from (seed + tick + agentId)
 * @param workerProfileParams - Profile-derived skill parameters
 */
export function generateWorkerArtifact(
  rng: RngFn,
  params: {
    packageId: string
    orderId: string
    agentId: string
    engineering: number // 0-10 core skill
    evidenceReasoning: number // 0-10
    speedBias: number // 0-10, higher = faster but less careful
    qualityBias: number // 0-10
    claimCalibration: number // 0-10, higher = claims match evidence
    overclaimTendency: number // 0-10, higher = exaggerate claims
    tick: number
  }
): OrgArtifact {
  const baseQuality = (params.engineering * 0.6 + params.qualityBias * 0.3 + params.evidenceReasoning * 0.1)
  const qualityJitter = (rng() - 0.5) * 3
  const quality = Math.max(0, Math.min(10, baseQuality + qualityJitter))

  const baseEvidence = (params.evidenceReasoning * 0.7 + params.engineering * 0.2 + params.claimCalibration * 0.1)
  const evidenceJitter = (rng() - 0.5) * 2
  const evidenceStrength = Math.max(0, Math.min(10, baseEvidence + evidenceJitter))

  // Claim level: what the agent CLAIMS they achieved.
  // Honest agents (high calibration, low overclaim): claim ≈ evidence
  // Braggers (low calibration, high overclaim): claim > evidence
  const calibrationFactor = params.claimCalibration / 10 // 0-1
  const overclaimFactor = params.overclaimTendency / 10 // 0-1

  // Base claim anchored to evidence, with overclaim adding independent inflation
  const calibratedBase = evidenceStrength * calibrationFactor + quality * (1 - calibrationFactor) * 0.5
  const overclaimInflation = overclaimFactor * 4 // up to 4 points of pure inflation
  const speedInflation = (params.speedBias / 10) * 1.5 // fast workers add slight inflation
  const claimLevel = Math.max(0, Math.min(10,
    calibratedBase + overclaimInflation + speedInflation
  ))

  const overclaimGap = Math.max(0, claimLevel - evidenceStrength)

  const defectCount = Math.max(0, Math.round(
    (10 - quality) * 0.8 + (params.speedBias / 10) * 3 + (rng() - 0.5) * 2
  ))

  return {
    id: `art-${params.orderId}-${params.agentId}-${params.tick}`,
    orderId: params.orderId,
    packageId: params.packageId,
    createdByAgentId: params.agentId,
    kind: 'code',
    quality: Math.round(quality * 10) / 10,
    evidenceStrength: Math.round(evidenceStrength * 10) / 10,
    claimLevel: Math.round(claimLevel * 10) / 10,
    defectCount,
    overclaimGap: Math.round(overclaimGap * 10) / 10,
    createdAtTick: params.tick,
  }
}

// ============================================================
// Merge / Selection
// ============================================================

/**
 * Lead merges/selects the best artifact from workers.
 *
 * Selection is based on a score that balances quality, evidence,
 * and penalizes overclaim. A lead with good mergeJudgment weights
 * these factors correctly; a poor lead may pick a worse artifact.
 */
export function selectBestArtifact(
  artifacts: OrgArtifact[],
  mergeJudgment: number,
  rng: RngFn
): OrgArtifact | null {
  if (artifacts.length === 0) return null

  // Score each artifact
  const scored = artifacts.map((a) => {
    // Correct scoring: quality is good, overclaim is bad
    const qualityScore = a.quality * 1.0
    const evidenceScore = a.evidenceStrength * 0.6
    const overclaimPenalty = a.overclaimGap * 1.5
    const defectPenalty = a.defectCount * 1.2

    // mergeJudgment affects how accurately the lead evaluates
    // Low judgment: more noise added to the score
    const noiseFactor = (10 - mergeJudgment) / 10
    const noise = (rng() - 0.5) * noiseFactor * 4

    return {
      artifact: a,
      score: qualityScore + evidenceScore - overclaimPenalty - defectPenalty + noise,
    }
  })

  // Select highest score
  scored.sort((a, b) => b.score - a.score)
  return scored[0].artifact
}

/**
 * Merge multiple artifacts into a synthesized final artifact.
 * The lead's mergeJudgment and handoff clarity affect the result.
 */
export function mergeArtifacts(
  artifacts: OrgArtifact[],
  leadParams: {
    mergeJudgment: number
    handoffClarity: number
    synthesis: number
  },
  orderId: string,
  packageId: string,
  tick: number,
  rng: RngFn
): OrgArtifact {
  if (artifacts.length === 0) {
    // Should not happen, but return a minimal artifact
    return {
      id: `art-merged-${orderId}-${tick}`,
      orderId,
      packageId,
      createdByAgentId: 'lead-merge',
      kind: 'code',
      quality: 3,
      evidenceStrength: 3,
      claimLevel: 3,
      defectCount: 5,
      overclaimGap: 0,
      createdAtTick: tick,
    }
  }

  // Weighted by merge judgment and synthesis skill
  const avgQuality = artifacts.reduce((s, a) => s + a.quality, 0) / artifacts.length
  const bestQuality = Math.max(...artifacts.map((a) => a.quality))
  const mergeQuality = avgQuality * 0.3 + bestQuality * 0.5 + (leadParams.mergeJudgment / 10) * 2

  const avgEvidence = artifacts.reduce((s, a) => s + a.evidenceStrength, 0) / artifacts.length
  const bestEvidence = Math.max(...artifacts.map((a) => a.evidenceStrength))
  const mergeEvidence = avgEvidence * 0.3 + bestEvidence * 0.5 + (leadParams.handoffClarity / 10) * 2

  // Claims from the most overclaim-prone worker may leak through if merge is poor
  const maxClaim = Math.max(...artifacts.map((a) => a.claimLevel))
  const avgClaim = artifacts.reduce((s, a) => s + a.claimLevel, 0) / artifacts.length
  const mergeClaim = maxClaim * (1 - leadParams.mergeJudgment / 20) + avgClaim * (leadParams.mergeJudgment / 20)

  const totalDefects = artifacts.reduce((s, a) => s + a.defectCount, 0)
  const mergeDefects = Math.round(totalDefects * (1 - leadParams.synthesis / 15))

  const overclaimGap = Math.max(0, mergeClaim - mergeEvidence)
  const qualityJitter = (rng() - 0.5) * 1

  return {
    id: `art-merged-${orderId}-${tick}`,
    orderId,
    packageId,
    createdByAgentId: 'lead-merge',
    kind: 'code',
    quality: Math.max(0, Math.min(10, Math.round((mergeQuality + qualityJitter) * 10) / 10)),
    evidenceStrength: Math.max(0, Math.min(10, Math.round(mergeEvidence * 10) / 10)),
    claimLevel: Math.max(0, Math.min(10, Math.round(mergeClaim * 10) / 10)),
    defectCount: mergeDefects,
    overclaimGap: Math.round(overclaimGap * 10) / 10,
    createdAtTick: tick,
  }
}
