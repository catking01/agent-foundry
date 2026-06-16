// ============================================================
// G26-0: Research Agent Profile Schema
// ============================================================
//
// Extends the existing Agent model (src/sim/types.ts) with
// richer profile dimensions for multi-agent organization research.
//
// The existing Agent model (planning, coding, validation, etc.)
// remains the gameplay layer. These profiles add research dimensions
// without changing the core simulation yet.
// ============================================================

import type { Domain } from './types'

// ============================================================
// 1. CapabilityProfile — what the agent CAN do
// ============================================================

export interface CapabilityProfile {
  /** Core workshop skills (0-10) */
  planning: number
  engineering: number
  validation: number
  audit: number
  delivery: number

  /** Meta-cognitive skills (0-10) */
  decomposition: number // break complex tasks into subtasks
  synthesis: number // merge multiple artifacts into coherent result
  evidenceReasoning: number // assess whether claims are supported
  errorDetection: number // find bugs and defects
  riskAssessment: number // judge the risk level of an artifact

  /** Domain specialization (0-10 per domain) */
  domainSkills: Partial<Record<Domain, number>>
}

// ============================================================
// 2. WorkStyleProfile — HOW the agent works
// ============================================================

export interface WorkStyleProfile {
  /** 0 = slow-and-steady, 10 = rush-to-finish */
  speedBias: number
  /** 0 = good-enough, 10 = perfectionist */
  qualityBias: number
  /** 0 = follow-the-plan, 10 = explore-alternatives */
  explorationBias: number
  /** 0 = risk-seeking, 10 = risk-averse */
  riskAversion: number
  /** 0 = erratic, 10 = highly consistent output */
  consistency: number
  /** 0 = wait-for-instruction, 10 = self-directed */
  initiative: number
  /** 0 = impatient, 10 = willing to iterate */
  patience: number
}

// ============================================================
// 3. EvidenceDisciplineProfile — integrity of claims
// ============================================================

export interface EvidenceDisciplineProfile {
  /** 0 = wildly overclaims, 10 = perfectly calibrated claims */
  claimCalibration: number
  /** 0 = never cites sources, 10 = meticulous citation */
  citationDiscipline: number
  /** 0 = overconfident, 10 = accurately reports uncertainty */
  uncertaintyReporting: number
  /** 0 = hides failures, 10 = transparent about limitations */
  failureDisclosure: number
  /** 0 = low risk of hidden issues, 10 = high risk */
  hiddenFailureRisk: number
  /** 0 = never overclaims, 10 = frequently overclaims */
  overclaimTendency: number
}

// ============================================================
// 4. CommunicationProfile — handoff and collaboration quality
// ============================================================

export interface CommunicationProfile {
  /** 0 = vague handoff, 10 = crystal-clear handoff */
  handoffClarity: number
  /** 0 = incoherent summary, 10 = excellent summary */
  summaryQuality: number
  /** 0 = escalates everything or nothing, 10 = good judgment */
  escalationJudgment: number
  /** 0 = never asks, 10 = asks appropriately when stuck */
  asksForHelp: number
  /** 0 = ignores instructions, 10 = follows precisely */
  instructionFollowing: number
  /** 0 = forgets context, 10 = retains full context */
  contextRetention: number
}

// ============================================================
// 5. LeadershipProfile — for lead roles (null for workers)
// ============================================================

export interface LeadershipProfile {
  /** 0 = hoards work, 10 = excellent delegator */
  delegationSkill: number
  /** 0 = picks the wrong artifact, 10 = excellent merge judgment */
  mergeJudgment: number
  /** 0 = oblivious to bottlenecks, 10 = proactively rebalances */
  bottleneckAwareness: number
  /** 0 = lets conflicts fester, 10 = resolves effectively */
  conflictResolution: number
  /** 0 = rubber-stamps, 10 = thorough but fair review */
  reviewStrictness: number
  /** Maximum direct reports the lead can effectively manage */
  spanOfControl: number
}

// ============================================================
// 6. AgentStateProfile — runtime state (changes during sim)
// ============================================================

export interface AgentStateProfile {
  /** 0-10, increases with work */
  fatigue: number
  /** 0-10, 0 = burnt out, 10 = highly motivated */
  morale: number
  /** 0-10, current workload saturation */
  load: number
  /** Count of recent failures (resets over time) */
  recentFailures: number
  /** 0-10, how much the org trusts this agent */
  trustScore: number
  /** 0-10, how well agent self-assesses match actual results */
  calibrationScore: number
}

// ============================================================
// 7. ResearchAgentProfile — unified research profile
// ============================================================

export interface ResearchAgentProfile {
  capability: CapabilityProfile
  workStyle: WorkStyleProfile
  evidenceDiscipline: EvidenceDisciplineProfile
  communication: CommunicationProfile
  /** null for worker roles, required for lead roles */
  leadership: LeadershipProfile | null
  /** Runtime state — changes during simulation */
  state: AgentStateProfile
}

// ============================================================
// Factory — create default profiles
// ============================================================

export function createDefaultCapability(): CapabilityProfile {
  return {
    planning: 5,
    engineering: 5,
    validation: 5,
    audit: 5,
    delivery: 5,
    decomposition: 5,
    synthesis: 5,
    evidenceReasoning: 5,
    errorDetection: 5,
    riskAssessment: 5,
    domainSkills: {},
  }
}

export function createDefaultWorkStyle(): WorkStyleProfile {
  return {
    speedBias: 5,
    qualityBias: 5,
    explorationBias: 5,
    riskAversion: 5,
    consistency: 5,
    initiative: 5,
    patience: 5,
  }
}

export function createDefaultEvidenceDiscipline(): EvidenceDisciplineProfile {
  return {
    claimCalibration: 5,
    citationDiscipline: 5,
    uncertaintyReporting: 5,
    failureDisclosure: 5,
    hiddenFailureRisk: 5,
    overclaimTendency: 5,
  }
}

export function createDefaultCommunication(): CommunicationProfile {
  return {
    handoffClarity: 5,
    summaryQuality: 5,
    escalationJudgment: 5,
    asksForHelp: 5,
    instructionFollowing: 5,
    contextRetention: 5,
  }
}

export function createDefaultLeadership(): LeadershipProfile {
  return {
    delegationSkill: 5,
    mergeJudgment: 5,
    bottleneckAwareness: 5,
    conflictResolution: 5,
    reviewStrictness: 5,
    spanOfControl: 4,
  }
}

export function createDefaultAgentState(): AgentStateProfile {
  return {
    fatigue: 0,
    morale: 7,
    load: 0,
    recentFailures: 0,
    trustScore: 7,
    calibrationScore: 5,
  }
}

/**
 * Create a default ResearchAgentProfile for a worker.
 * Workers have no leadership profile.
 */
export function createDefaultWorkerProfile(): ResearchAgentProfile {
  return {
    capability: createDefaultCapability(),
    workStyle: createDefaultWorkStyle(),
    evidenceDiscipline: createDefaultEvidenceDiscipline(),
    communication: createDefaultCommunication(),
    leadership: null,
    state: createDefaultAgentState(),
  }
}

/**
 * Create a default ResearchAgentProfile for a lead role.
 * Leads include a leadership profile.
 */
export function createDefaultLeadProfile(): ResearchAgentProfile {
  return {
    capability: createDefaultCapability(),
    workStyle: createDefaultWorkStyle(),
    evidenceDiscipline: createDefaultEvidenceDiscipline(),
    communication: createDefaultCommunication(),
    leadership: createDefaultLeadership(),
    state: createDefaultAgentState(),
  }
}

/**
 * Check whether a profile has leadership capability (is a lead role).
 */
export function isLeadProfile(profile: ResearchAgentProfile): boolean {
  return profile.leadership !== null
}
