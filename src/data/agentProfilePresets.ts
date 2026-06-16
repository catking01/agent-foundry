// ============================================================
// G26-0: Research Agent Profile Presets
// ============================================================
//
// Pre-built ResearchAgentProfile presets for scenario testing.
// These profiles are for the RESEARCH layer — they extend the
// gameplay Agent model without replacing it.
//
// Each preset represents a distinct agent archetype with
// meaningful trade-offs in capability, style, and evidence discipline.
// ============================================================

import type { ResearchAgentProfile } from '../sim/agentProfiles'
import {
  createDefaultCapability,
  createDefaultWorkStyle,
  createDefaultEvidenceDiscipline,
  createDefaultCommunication,
  createDefaultLeadership,
  createDefaultAgentState,
} from '../sim/agentProfiles'

// ============================================================
// Worker Presets
// ============================================================

/** Fast executor: speed over quality, moderate overclaim risk. */
export const FAST_EXECUTOR: ResearchAgentProfile = {
  capability: {
    ...createDefaultCapability(),
    engineering: 8,
    delivery: 7,
    planning: 4,
    validation: 3,
    audit: 2,
    decomposition: 3,
    synthesis: 4,
    evidenceReasoning: 3,
    errorDetection: 4,
    riskAssessment: 3,
    domainSkills: { web: 7 },
  },
  workStyle: {
    ...createDefaultWorkStyle(),
    speedBias: 9,
    qualityBias: 3,
    explorationBias: 4,
    riskAversion: 2,
    consistency: 5,
    initiative: 7,
    patience: 2,
  },
  evidenceDiscipline: {
    ...createDefaultEvidenceDiscipline(),
    claimCalibration: 3,
    citationDiscipline: 2,
    uncertaintyReporting: 2,
    failureDisclosure: 3,
    hiddenFailureRisk: 7,
    overclaimTendency: 7,
  },
  communication: {
    ...createDefaultCommunication(),
    handoffClarity: 4,
    summaryQuality: 4,
    escalationJudgment: 3,
    asksForHelp: 2,
    instructionFollowing: 7,
    contextRetention: 4,
  },
  leadership: null,
  state: createDefaultAgentState(),
}

/** Careful validator: thorough but slow, high evidence discipline. */
export const CAREFUL_VALIDATOR: ResearchAgentProfile = {
  capability: {
    ...createDefaultCapability(),
    validation: 9,
    audit: 7,
    engineering: 5,
    planning: 5,
    delivery: 3,
    decomposition: 6,
    synthesis: 6,
    evidenceReasoning: 9,
    errorDetection: 9,
    riskAssessment: 8,
    domainSkills: { data: 6, research: 6 },
  },
  workStyle: {
    ...createDefaultWorkStyle(),
    speedBias: 2,
    qualityBias: 9,
    explorationBias: 3,
    riskAversion: 9,
    consistency: 9,
    initiative: 4,
    patience: 9,
  },
  evidenceDiscipline: {
    ...createDefaultEvidenceDiscipline(),
    claimCalibration: 9,
    citationDiscipline: 8,
    uncertaintyReporting: 9,
    failureDisclosure: 8,
    hiddenFailureRisk: 1,
    overclaimTendency: 1,
  },
  communication: {
    ...createDefaultCommunication(),
    handoffClarity: 8,
    summaryQuality: 8,
    escalationJudgment: 7,
    asksForHelp: 5,
    instructionFollowing: 8,
    contextRetention: 7,
  },
  leadership: null,
  state: createDefaultAgentState(),
}

/** Creative engineer: high creativity, explores alternatives, moderate evidence risk. */
export const CREATIVE_ENGINEER: ResearchAgentProfile = {
  capability: {
    ...createDefaultCapability(),
    engineering: 9,
    planning: 7,
    validation: 3,
    audit: 2,
    delivery: 5,
    decomposition: 5,
    synthesis: 7,
    evidenceReasoning: 4,
    errorDetection: 3,
    riskAssessment: 4,
    domainSkills: { web: 8, runtime: 6 },
  },
  workStyle: {
    ...createDefaultWorkStyle(),
    speedBias: 6,
    qualityBias: 6,
    explorationBias: 9,
    riskAversion: 3,
    consistency: 4,
    initiative: 9,
    patience: 5,
  },
  evidenceDiscipline: {
    ...createDefaultEvidenceDiscipline(),
    claimCalibration: 4,
    citationDiscipline: 3,
    uncertaintyReporting: 4,
    failureDisclosure: 5,
    hiddenFailureRisk: 6,
    overclaimTendency: 6,
  },
  communication: {
    ...createDefaultCommunication(),
    handoffClarity: 5,
    summaryQuality: 6,
    escalationJudgment: 4,
    asksForHelp: 7,
    instructionFollowing: 5,
    contextRetention: 5,
  },
  leadership: null,
  state: createDefaultAgentState(),
}

/** Reliable auditor: thorough, evidence-focused, conservative. */
export const RELIABLE_AUDITOR: ResearchAgentProfile = {
  capability: {
    ...createDefaultCapability(),
    audit: 9,
    validation: 7,
    engineering: 4,
    planning: 5,
    delivery: 3,
    decomposition: 4,
    synthesis: 5,
    evidenceReasoning: 9,
    errorDetection: 7,
    riskAssessment: 9,
    domainSkills: { research: 7 },
  },
  workStyle: {
    ...createDefaultWorkStyle(),
    speedBias: 3,
    qualityBias: 8,
    explorationBias: 2,
    riskAversion: 9,
    consistency: 8,
    initiative: 3,
    patience: 7,
  },
  evidenceDiscipline: {
    ...createDefaultEvidenceDiscipline(),
    claimCalibration: 8,
    citationDiscipline: 9,
    uncertaintyReporting: 8,
    failureDisclosure: 9,
    hiddenFailureRisk: 2,
    overclaimTendency: 2,
  },
  communication: {
    ...createDefaultCommunication(),
    handoffClarity: 7,
    summaryQuality: 7,
    escalationJudgment: 8,
    asksForHelp: 4,
    instructionFollowing: 8,
    contextRetention: 9,
  },
  leadership: null,
  state: createDefaultAgentState(),
}

// ============================================================
// Lead Presets
// ============================================================

/** Balanced cell lead: good delegation, fair review, moderate span. */
export const BALANCED_CELL_LEAD: ResearchAgentProfile = {
  capability: {
    ...createDefaultCapability(),
    planning: 7,
    engineering: 6,
    validation: 6,
    audit: 6,
    delivery: 5,
    decomposition: 8,
    synthesis: 7,
    evidenceReasoning: 7,
    errorDetection: 6,
    riskAssessment: 7,
    domainSkills: { web: 6 },
  },
  workStyle: {
    ...createDefaultWorkStyle(),
    speedBias: 5,
    qualityBias: 7,
    explorationBias: 5,
    riskAversion: 6,
    consistency: 7,
    initiative: 6,
    patience: 6,
  },
  evidenceDiscipline: {
    ...createDefaultEvidenceDiscipline(),
    claimCalibration: 7,
    citationDiscipline: 7,
    uncertaintyReporting: 6,
    failureDisclosure: 7,
    hiddenFailureRisk: 3,
    overclaimTendency: 3,
  },
  communication: {
    ...createDefaultCommunication(),
    handoffClarity: 8,
    summaryQuality: 7,
    escalationJudgment: 7,
    asksForHelp: 5,
    instructionFollowing: 7,
    contextRetention: 7,
  },
  leadership: {
    ...createDefaultLeadership(),
    delegationSkill: 7,
    mergeJudgment: 7,
    bottleneckAwareness: 6,
    conflictResolution: 6,
    reviewStrictness: 6,
    spanOfControl: 5,
  },
  state: createDefaultAgentState(),
}

/** Hands-off workshop lead: delegates heavily, trusts team, may miss issues. */
export const HANDS_OFF_WORKSHOP_LEAD: ResearchAgentProfile = {
  capability: {
    ...createDefaultCapability(),
    planning: 8,
    engineering: 4,
    validation: 3,
    audit: 3,
    delivery: 5,
    decomposition: 9,
    synthesis: 5,
    evidenceReasoning: 4,
    errorDetection: 3,
    riskAssessment: 5,
    domainSkills: {},
  },
  workStyle: {
    ...createDefaultWorkStyle(),
    speedBias: 7,
    qualityBias: 4,
    explorationBias: 6,
    riskAversion: 3,
    consistency: 5,
    initiative: 8,
    patience: 3,
  },
  evidenceDiscipline: {
    ...createDefaultEvidenceDiscipline(),
    claimCalibration: 4,
    citationDiscipline: 3,
    uncertaintyReporting: 3,
    failureDisclosure: 4,
    hiddenFailureRisk: 6,
    overclaimTendency: 5,
  },
  communication: {
    ...createDefaultCommunication(),
    handoffClarity: 5,
    summaryQuality: 4,
    escalationJudgment: 4,
    asksForHelp: 3,
    instructionFollowing: 6,
    contextRetention: 5,
  },
  leadership: {
    ...createDefaultLeadership(),
    delegationSkill: 9,
    mergeJudgment: 4,
    bottleneckAwareness: 4,
    conflictResolution: 4,
    reviewStrictness: 3,
    spanOfControl: 6,
  },
  state: createDefaultAgentState(),
}

// ============================================================
// Preset Registry
// ============================================================

export const AGENT_PROFILE_PRESETS: Record<string, ResearchAgentProfile> = {
  fast_executor: FAST_EXECUTOR,
  careful_validator: CAREFUL_VALIDATOR,
  creative_engineer: CREATIVE_ENGINEER,
  reliable_auditor: RELIABLE_AUDITOR,
  balanced_cell_lead: BALANCED_CELL_LEAD,
  hands_off_workshop_lead: HANDS_OFF_WORKSHOP_LEAD,
}

/** List presets with role-appropriate descriptions */
export const PROFILE_PRESET_META: Record<string, { name: string; role: string; description: string }> = {
  fast_executor: {
    name: 'Fast Executor',
    role: 'worker',
    description: 'Speed-first engineer. High throughput, moderate overclaim risk. Best for simple, low-risk orders.',
  },
  careful_validator: {
    name: 'Careful Validator',
    role: 'worker',
    description: 'Thorough validator. Slow but catches nearly all defects. High evidence discipline.',
  },
  creative_engineer: {
    name: 'Creative Engineer',
    role: 'worker',
    description: 'Exploratory engineer. Generates novel solutions but may overclaim or miss edge cases.',
  },
  reliable_auditor: {
    name: 'Reliable Auditor',
    role: 'worker',
    description: 'Conservative auditor. Excellent risk assessment, strong evidence reasoning.',
  },
  balanced_cell_lead: {
    name: 'Balanced Cell Lead',
    role: 'cell_lead',
    description: 'Well-rounded cell lead. Good delegation, fair reviews, manages up to 5 reports.',
  },
  hands_off_workshop_lead: {
    name: 'Hands-Off Workshop Lead',
    role: 'workshop_lead',
    description: 'Delegates heavily, trusts team autonomy. High throughput risk — may miss review issues.',
  },
}
