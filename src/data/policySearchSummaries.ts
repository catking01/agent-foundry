import {
  G30_POLICY_CONFIGS,
  G30_POLICY_OBJECTIVES,
  G30_TOTAL_RUNS,
  type OrgPolicyId,
  type PolicyObjective,
} from './orgPolicyConfigs'

export interface PolicyObjectiveRankingEntry {
  objective: PolicyObjective
  topPolicies: {
    policyId: OrgPolicyId
    rank: number
    score: number
    runCount: number
  }[]
}

export interface ParetoFrontierEntry {
  policyId: OrgPolicyId
  qualityScore: number
  riskReductionScore: number
  speedScore: number
  coordinationEfficiencyScore: number
}

export interface DominancePair {
  dominatorPolicyId: OrgPolicyId
  dominatedPolicyId: OrgPolicyId
}

export interface PolicyComplexityBreakdownEntry {
  orderClass: 'simple' | 'medium' | 'complex'
  bestPolicyId: OrgPolicyId
  bestBalancedScore: number
  meanFinalQuality: number
  meanLatentRiskEstimate: number
  meanCoordinationCost: number
  meanDeliveryTicks: number
  meanRiskAdjustedQuality: number
}

export interface PolicyConfigCompactDetail {
  id: OrgPolicyId
  label: string
  mode: 'flat' | 'hierarchical'
  cellLeadCount: number
  workerCount: number
  spanOfControl: number
  fanoutStrategy: string
  mergeJudgmentBonus: number
  handoffClarityBonus: number
  auditCoverageBonus: number
  validationStrictnessBonus: number
  coordinationCostMultiplier: number
  riskTolerance: string
}

export interface ScoringPolicyFormula {
  objective: PolicyObjective
  formula: string
  interpretation: string
}

export const G30_POLICY_SEARCH_SUMMARY = {
  title: 'G30 Organization Policy Search',
  sourceCommit: '71201120ee00dde64ef125f830d786c59cd46d95',
  runCount: G30_TOTAL_RUNS,
  matrixShape: '12 policies x 8 seeds x 3 representative order classes = 288 runs',
  policyCount: G30_POLICY_CONFIGS.length,
  seedCount: 8,
  orderClassCount: 3,
  objectives: G30_POLICY_OBJECTIVES,
  artifactSource: 'verification/G30',
} as const

export const G30_OBJECTIVE_RANKINGS: PolicyObjectiveRankingEntry[] = [
  {
    objective: 'speed',
    topPolicies: [
      { policyId: 'speed_flat_like', rank: 1, score: -3, runCount: 24 },
      { policyId: 'extra_worker', rank: 2, score: -13.33, runCount: 24 },
      { policyId: 'handoff_optimized', rank: 3, score: -13.67, runCount: 24 },
    ],
  },
  {
    objective: 'quality',
    topPolicies: [
      { policyId: 'merge_optimized', rank: 1, score: 12.36, runCount: 24 },
      { policyId: 'quality_hierarchy', rank: 2, score: 12.21, runCount: 24 },
      { policyId: 'risk_averse_org', rank: 3, score: 12.02, runCount: 24 },
    ],
  },
  {
    objective: 'risk_reduction',
    topPolicies: [
      { policyId: 'speed_flat_like', rank: 1, score: -3.38, runCount: 24 },
      { policyId: 'risk_averse_org', rank: 2, score: -4.99, runCount: 24 },
      { policyId: 'audit_heavy', rank: 3, score: -5.46, runCount: 24 },
    ],
  },
  {
    objective: 'coordination_efficiency',
    topPolicies: [
      { policyId: 'speed_flat_like', rank: 1, score: 3.87, runCount: 24 },
      { policyId: 'handoff_optimized', rank: 2, score: 0.16, runCount: 24 },
      { policyId: 'low_coordination', rank: 3, score: 0.15, runCount: 24 },
    ],
  },
  {
    objective: 'balanced',
    topPolicies: [
      { policyId: 'speed_flat_like', rank: 1, score: 6.97, runCount: 24 },
      { policyId: 'risk_averse_org', rank: 2, score: 4.5, runCount: 24 },
      { policyId: 'audit_heavy', rank: 3, score: 4.28, runCount: 24 },
    ],
  },
]

export const G30_PARETO_FRONTIER: ParetoFrontierEntry[] = [
  { policyId: 'speed_flat_like', qualityScore: 10.23, riskReductionScore: -3.38, speedScore: -3, coordinationEfficiencyScore: 3.87 },
  { policyId: 'quality_hierarchy', qualityScore: 12.21, riskReductionScore: -8.4, speedScore: -14.67, coordinationEfficiencyScore: 0.12 },
  { policyId: 'audit_heavy', qualityScore: 11.75, riskReductionScore: -5.46, speedScore: -15.67, coordinationEfficiencyScore: 0.12 },
  { policyId: 'handoff_optimized', qualityScore: 11.36, riskReductionScore: -8.33, speedScore: -13.67, coordinationEfficiencyScore: 0.16 },
  { policyId: 'merge_optimized', qualityScore: 12.36, riskReductionScore: -8.47, speedScore: -14.67, coordinationEfficiencyScore: 0.12 },
  { policyId: 'extra_worker', qualityScore: 11.52, riskReductionScore: -9.22, speedScore: -13.33, coordinationEfficiencyScore: 0.09 },
  { policyId: 'balanced_org', qualityScore: 11.92, riskReductionScore: -7.22, speedScore: -14, coordinationEfficiencyScore: 0.12 },
  { policyId: 'risk_averse_org', qualityScore: 12.02, riskReductionScore: -4.99, speedScore: -15.67, coordinationEfficiencyScore: 0.11 },
]

export const G30_DOMINATED_POLICY_IDS: OrgPolicyId[] = [
  'baseline_hierarchical',
  'low_coordination',
  'high_fanout',
  'extra_lead',
]

export const G30_DOMINANCE_PAIRS: DominancePair[] = [
  { dominatorPolicyId: 'quality_hierarchy', dominatedPolicyId: 'baseline_hierarchical' },
  { dominatorPolicyId: 'handoff_optimized', dominatedPolicyId: 'baseline_hierarchical' },
  { dominatorPolicyId: 'merge_optimized', dominatedPolicyId: 'baseline_hierarchical' },
  { dominatorPolicyId: 'balanced_org', dominatedPolicyId: 'baseline_hierarchical' },
  { dominatorPolicyId: 'handoff_optimized', dominatedPolicyId: 'low_coordination' },
  { dominatorPolicyId: 'balanced_org', dominatedPolicyId: 'high_fanout' },
  { dominatorPolicyId: 'audit_heavy', dominatedPolicyId: 'extra_lead' },
  { dominatorPolicyId: 'risk_averse_org', dominatedPolicyId: 'extra_lead' },
]

export const G30_PARETO_OBJECTIVE_DIMENSIONS = [
  'qualityScore',
  'riskReductionScore',
  'speedScore',
  'coordinationEfficiencyScore',
] as const

export const G30_COMPLEXITY_BREAKDOWN: PolicyComplexityBreakdownEntry[] = [
  {
    orderClass: 'simple',
    bestPolicyId: 'risk_averse_org',
    bestBalancedScore: 8.27,
    meanFinalQuality: 7.84,
    meanLatentRiskEstimate: 1.19,
    meanCoordinationCost: 28.4,
    meanDeliveryTicks: 11,
    meanRiskAdjustedQuality: 6.65,
  },
  {
    orderClass: 'medium',
    bestPolicyId: 'speed_flat_like',
    bestBalancedScore: 8.3,
    meanFinalQuality: 7.07,
    meanLatentRiskEstimate: 2.56,
    meanCoordinationCost: 0,
    meanDeliveryTicks: 3,
    meanRiskAdjustedQuality: 4.52,
  },
  {
    orderClass: 'complex',
    bestPolicyId: 'speed_flat_like',
    bestBalancedScore: 6.87,
    meanFinalQuality: 7.07,
    meanLatentRiskEstimate: 3.9,
    meanCoordinationCost: 0,
    meanDeliveryTicks: 4,
    meanRiskAdjustedQuality: 3.18,
  },
]

export const G30_POLICY_COMPACT_DETAILS: PolicyConfigCompactDetail[] = G30_POLICY_CONFIGS.map((policy) => ({
  id: policy.id,
  label: policy.label,
  mode: policy.mode,
  cellLeadCount: policy.cellLeadCount,
  workerCount: policy.workerCount,
  spanOfControl: policy.spanOfControl,
  fanoutStrategy: policy.fanoutStrategy,
  mergeJudgmentBonus: policy.mergeJudgmentBonus,
  handoffClarityBonus: policy.handoffClarityBonus,
  auditCoverageBonus: policy.auditCoverageBonus,
  validationStrictnessBonus: policy.validationStrictnessBonus,
  coordinationCostMultiplier: policy.coordinationCostMultiplier,
  riskTolerance: policy.riskTolerance,
}))

export const G30_SCORING_POLICY: ScoringPolicyFormula[] = [
  {
    objective: 'speed',
    formula: 'speedScore = -deliveryTicks',
    interpretation: 'Higher scores are less negative and indicate fewer delivery ticks.',
  },
  {
    objective: 'quality',
    formula: 'qualityScore = finalQuality + finalEvidenceStrength * 0.5',
    interpretation: 'Ranks policy quality with an evidence-strength contribution.',
  },
  {
    objective: 'risk_reduction',
    formula: 'riskReductionScore = -latentRiskEstimate - undetectedOverclaimExposure',
    interpretation: 'Higher scores are less negative and indicate lower modeled latent-risk exposure.',
  },
  {
    objective: 'coordination_efficiency',
    formula: 'coordinationEfficiencyScore = riskAdjustedQuality / max(1, coordinationCost)',
    interpretation: 'Ranks risk-adjusted quality per unit of modeled coordination cost.',
  },
  {
    objective: 'balanced',
    formula: 'balancedScore = riskAdjustedQuality + finalEvidenceStrength * 0.5 - deliveryTicks * 0.1 - coordinationCost * 0.05',
    interpretation: 'Combines risk-adjusted quality and evidence strength while penalizing delivery time and coordination cost.',
  },
]

export const G30_POLICY_RISK_SEMANTICS = {
  header: 'Policy search risk semantics',
  scoringNote:
    'Objective scores are deterministic simulator formulas from verification/G30/SCORING_POLICY.md; they are not real organization value functions.',
  paretoNote:
    'Pareto frontier entries are non-dominated only across qualityScore, riskReductionScore, speedScore, and coordinationEfficiencyScore inside this 288-run matrix.',
  latentRiskNote:
    'latentRiskEstimate is an EXPOSURE metric and is closer to modeled risk outcome than detected findings.',
  detectionNote:
    'detectedOverclaimFindings is a DETECTION metric; more findings can mean stronger audit coverage, not higher actual generated risk.',
} as const

export const G30_POLICY_NON_CLAIMS = [
  'deterministic simulation search only',
  'not real organization proof',
  'not real AI agents, supervisors, or live LLM workers',
  'not Runtime Lab validation',
  'not production governance',
  'no claim that any single policy is generally best for real organizations',
  'objective rankings are specific to the curated G30 search space',
  'Pareto frontier is bounded to 12 policies and 288 deterministic runs, not an exhaustive organization-design search',
] as const
