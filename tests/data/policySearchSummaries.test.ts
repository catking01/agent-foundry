import { describe, it, expect } from 'vitest'
import {
  G30_COMPLEXITY_BREAKDOWN,
  G30_DOMINANCE_PAIRS,
  G30_DOMINATED_POLICY_IDS,
  G30_OBJECTIVE_RANKINGS,
  G30_PARETO_FRONTIER,
  G30_PARETO_OBJECTIVE_DIMENSIONS,
  G30_POLICY_COMPACT_DETAILS,
  G30_POLICY_NON_CLAIMS,
  G30_POLICY_RISK_SEMANTICS,
  G30_POLICY_SEARCH_SUMMARY,
  G30_SCORING_POLICY,
} from '../../src/data/policySearchSummaries'

describe('policySearchSummaries', () => {
  it('has the expected G30 matrix shape', () => {
    expect(G30_POLICY_SEARCH_SUMMARY.runCount).toBe(288)
    expect(G30_POLICY_SEARCH_SUMMARY.policyCount).toBe(12)
    expect(G30_POLICY_SEARCH_SUMMARY.seedCount).toBe(8)
    expect(G30_POLICY_SEARCH_SUMMARY.orderClassCount).toBe(3)
    expect(G30_POLICY_SEARCH_SUMMARY.objectives).toHaveLength(5)
    expect(G30_POLICY_SEARCH_SUMMARY.matrixShape).toBe(
      '12 policies x 8 seeds x 3 representative order classes = 288 runs'
    )
  })

  it('contains exact top-three objective rankings from G30 artifacts', () => {
    const speed = G30_OBJECTIVE_RANKINGS.find((item) => item.objective === 'speed')!
    const quality = G30_OBJECTIVE_RANKINGS.find((item) => item.objective === 'quality')!
    const risk = G30_OBJECTIVE_RANKINGS.find((item) => item.objective === 'risk_reduction')!
    const balanced = G30_OBJECTIVE_RANKINGS.find((item) => item.objective === 'balanced')!

    expect(G30_OBJECTIVE_RANKINGS).toHaveLength(5)
    expect(speed.topPolicies[0]).toMatchObject({ policyId: 'speed_flat_like', score: -3 })
    expect(quality.topPolicies[0]).toMatchObject({ policyId: 'merge_optimized', score: 12.36 })
    expect(risk.topPolicies[0]).toMatchObject({ policyId: 'speed_flat_like', score: -3.38 })
    expect(balanced.topPolicies[0]).toMatchObject({ policyId: 'speed_flat_like', score: 6.97 })

    for (const ranking of G30_OBJECTIVE_RANKINGS) {
      expect(ranking.topPolicies).toHaveLength(3)
      expect(ranking.topPolicies.map((item) => item.rank)).toEqual([1, 2, 3])
      expect(ranking.topPolicies.every((item) => item.runCount === 24)).toBe(true)
    }
  })

  it('preserves the G30 Pareto frontier and dominance summary', () => {
    expect(G30_PARETO_FRONTIER.map((item) => item.policyId)).toEqual([
      'speed_flat_like',
      'quality_hierarchy',
      'audit_heavy',
      'handoff_optimized',
      'merge_optimized',
      'extra_worker',
      'balanced_org',
      'risk_averse_org',
    ])
    expect(G30_DOMINATED_POLICY_IDS).toEqual([
      'baseline_hierarchical',
      'low_coordination',
      'high_fanout',
      'extra_lead',
    ])
    expect(G30_DOMINANCE_PAIRS).toHaveLength(8)
    expect(G30_PARETO_OBJECTIVE_DIMENSIONS).toEqual([
      'qualityScore',
      'riskReductionScore',
      'speedScore',
      'coordinationEfficiencyScore',
    ])
  })

  it('contains complexity highlights from policy-by-order-complexity artifacts', () => {
    expect(G30_COMPLEXITY_BREAKDOWN).toEqual([
      expect.objectContaining({ orderClass: 'simple', bestPolicyId: 'risk_averse_org', bestBalancedScore: 8.27 }),
      expect.objectContaining({ orderClass: 'medium', bestPolicyId: 'speed_flat_like', bestBalancedScore: 8.3 }),
      expect.objectContaining({ orderClass: 'complex', bestPolicyId: 'speed_flat_like', bestBalancedScore: 6.87 }),
    ])
  })

  it('has compact details for all 12 searched policies', () => {
    expect(G30_POLICY_COMPACT_DETAILS).toHaveLength(12)
    expect(G30_POLICY_COMPACT_DETAILS.some((policy) => policy.id === 'speed_flat_like' && policy.mode === 'flat')).toBe(true)
    expect(G30_POLICY_COMPACT_DETAILS.some((policy) => policy.id === 'risk_averse_org' && policy.riskTolerance === 'low')).toBe(true)
  })

  it('uses scoring formulas rather than normalized weights', () => {
    expect(G30_SCORING_POLICY).toHaveLength(5)
    expect(G30_SCORING_POLICY.map((item) => item.formula)).toContain('speedScore = -deliveryTicks')
    expect(G30_SCORING_POLICY.map((item) => item.formula)).toContain(
      'riskReductionScore = -latentRiskEstimate - undetectedOverclaimExposure'
    )
  })

  it('preserves risk semantics and non-claims', () => {
    expect(G30_POLICY_RISK_SEMANTICS.latentRiskNote).toContain('EXPOSURE')
    expect(G30_POLICY_RISK_SEMANTICS.detectionNote).toContain('DETECTION')
    expect(G30_POLICY_NON_CLAIMS.some((claim) => claim.includes('deterministic simulation'))).toBe(true)
    expect(G30_POLICY_NON_CLAIMS.some((claim) => claim.includes('real organizations'))).toBe(true)
    expect(G30_POLICY_NON_CLAIMS.some((claim) => claim.includes('not real AI agents'))).toBe(true)
  })
})
