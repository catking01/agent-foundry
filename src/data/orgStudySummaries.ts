export interface G27ModeSummary {
  mode: 'flat' | 'hierarchical'
  runCount: number
  meanQuality: number
  meanEvidenceStrength: number
  meanLatentRisk: number
  meanCoordinationCost: number
  meanDeliveryTicks: number
}

export interface InterventionDeltaSummary {
  id: string
  label: string
  runCount: number
  deltaQuality: number
  deltaEvidenceStrength: number
  deltaLatentRisk: number
  deltaCoordinationCost: number
  deltaDeliveryTicks: number
  deltaRiskAdjustedQuality: number
  deltaCoordinationEfficiency: number
}

export interface ComplexityInterventionSummary {
  orderClass: 'simple' | 'medium' | 'complex'
  interventionId: string
  deltaQuality: number
  deltaLatentRisk: number
  deltaCoordinationCost: number
  deltaDeliveryTicks: number
  deltaRiskAdjustedQuality: number
}

export const G27_ORG_STUDY_SUMMARY = {
  title: 'G27 Flat vs Hierarchy',
  sourceCommit: '771a58bda0321ae99482d44079eda30cbfb440d6',
  runCount: 144,
  matrixShape: '8 seeds x 2 modes x 3 order classes x 3 order instances',
  flat: {
    mode: 'flat',
    runCount: 72,
    meanQuality: 6.83,
    meanEvidenceStrength: 6.74,
    meanLatentRisk: 2.32,
    meanCoordinationCost: 0,
    meanDeliveryTicks: 3,
  } satisfies G27ModeSummary,
  hierarchical: {
    mode: 'hierarchical',
    runCount: 72,
    meanQuality: 7.29,
    meanEvidenceStrength: 7.59,
    meanLatentRisk: 5.57,
    meanCoordinationCost: 31.67,
    meanDeliveryTicks: 14.67,
  } satisfies G27ModeSummary,
}

export const G28_INTERVENTION_SUMMARY = {
  title: 'G28 Organization Intervention Experiments',
  sourceCommit: 'ad23f428806018f28631438e30888a51394ed955',
  runCount: 144,
  matrixShape: '8 seeds x 3 representative orders x 6 interventions',
  ranking: {
    bestQualityIntervention: 'merge_plus',
    bestRiskReductionIntervention: 'audit_coverage_plus',
    bestCoordinationEfficiencyIntervention: 'merge_plus',
    fastestIntervention: 'handoff_plus',
    bestRiskAdjustedQualityIntervention: 'merge_plus',
  },
  interventions: [
    {
      id: 'baseline_hierarchical',
      label: 'Baseline hierarchical',
      runCount: 24,
      deltaQuality: 0,
      deltaEvidenceStrength: 0,
      deltaLatentRisk: 0,
      deltaCoordinationCost: 0,
      deltaDeliveryTicks: 0,
      deltaRiskAdjustedQuality: 0,
      deltaCoordinationEfficiency: 0,
    },
    {
      id: 'merge_plus',
      label: 'Merge plus',
      runCount: 24,
      deltaQuality: 0.85,
      deltaEvidenceStrength: 0.2,
      deltaLatentRisk: -0.65,
      deltaCoordinationCost: 1,
      deltaDeliveryTicks: 1,
      deltaRiskAdjustedQuality: 1.5,
      deltaCoordinationEfficiency: 0.04,
    },
    {
      id: 'handoff_plus',
      label: 'Handoff plus',
      runCount: 24,
      deltaQuality: 0,
      deltaEvidenceStrength: 0.1,
      deltaLatentRisk: -0.15,
      deltaCoordinationCost: -1.67,
      deltaDeliveryTicks: -1,
      deltaRiskAdjustedQuality: 0.15,
      deltaCoordinationEfficiency: 0.01,
    },
    {
      id: 'span_control_tight',
      label: 'Span control tight',
      runCount: 24,
      deltaQuality: 0.15,
      deltaEvidenceStrength: 0,
      deltaLatentRisk: -0.35,
      deltaCoordinationCost: 2,
      deltaDeliveryTicks: 1,
      deltaRiskAdjustedQuality: 0.5,
      deltaCoordinationEfficiency: 0.01,
    },
    {
      id: 'extra_worker',
      label: 'Extra worker',
      runCount: 24,
      deltaQuality: 0.4,
      deltaEvidenceStrength: 0,
      deltaLatentRisk: 0.1,
      deltaCoordinationCost: 1,
      deltaDeliveryTicks: -0.67,
      deltaRiskAdjustedQuality: 0.3,
      deltaCoordinationEfficiency: 0.01,
    },
    {
      id: 'audit_coverage_plus',
      label: 'Audit coverage plus',
      runCount: 24,
      deltaQuality: 0,
      deltaEvidenceStrength: 0.3,
      deltaLatentRisk: -1.39,
      deltaCoordinationCost: 1,
      deltaDeliveryTicks: 1,
      deltaRiskAdjustedQuality: 1.39,
      deltaCoordinationEfficiency: 0.04,
    },
  ] satisfies InterventionDeltaSummary[],
  complexityHighlights: [
    { orderClass: 'simple', interventionId: 'merge_plus', deltaQuality: 0.55, deltaLatentRisk: -0.35, deltaCoordinationCost: 1, deltaDeliveryTicks: 1, deltaRiskAdjustedQuality: 0.9 },
    { orderClass: 'simple', interventionId: 'handoff_plus', deltaQuality: 0, deltaLatentRisk: -0.15, deltaCoordinationCost: -1, deltaDeliveryTicks: -1, deltaRiskAdjustedQuality: 0.15 },
    { orderClass: 'medium', interventionId: 'merge_plus', deltaQuality: 0.85, deltaLatentRisk: -0.65, deltaCoordinationCost: 1, deltaDeliveryTicks: 1, deltaRiskAdjustedQuality: 1.5 },
    { orderClass: 'medium', interventionId: 'audit_coverage_plus', deltaQuality: 0, deltaLatentRisk: -1.71, deltaCoordinationCost: 1, deltaDeliveryTicks: 1, deltaRiskAdjustedQuality: 1.71 },
    { orderClass: 'complex', interventionId: 'merge_plus', deltaQuality: 1.15, deltaLatentRisk: -0.95, deltaCoordinationCost: 1, deltaDeliveryTicks: 1, deltaRiskAdjustedQuality: 2.1 },
    { orderClass: 'complex', interventionId: 'audit_coverage_plus', deltaQuality: 0, deltaLatentRisk: -1.71, deltaCoordinationCost: 1, deltaDeliveryTicks: 1, deltaRiskAdjustedQuality: 1.71 },
  ] satisfies ComplexityInterventionSummary[],
}

export const ORG_STUDY_RISK_SEMANTICS = {
  detectedFindings: 'detectedOverclaimFindings is a DETECTION metric: more findings can mean better audit coverage.',
  latentRisk: 'latentRiskEstimate is an EXPOSURE metric and the preferred risk-outcome metric for comparison.',
  evidenceIntegrity: 'evidenceIntegrityDelta compares evidence strength with claim level.',
}

export const ORG_STUDY_NON_CLAIMS = [
  'deterministic simulation only',
  'not real organization proof',
  'not real AI agents',
  'not Runtime Lab validation',
  'not production governance',
  'no claim that hierarchy or any intervention is generally better in real organizations',
]
