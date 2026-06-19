import { describe, it, expect } from 'vitest'
import {
  G27_ORG_STUDY_SUMMARY,
  G28_INTERVENTION_SUMMARY,
  ORG_STUDY_NON_CLAIMS,
  ORG_STUDY_RISK_SEMANTICS,
} from '../../src/data/orgStudySummaries'

describe('orgStudySummaries', () => {
  it('contains compact G27 flat-vs-hierarchy headline metrics', () => {
    expect(G27_ORG_STUDY_SUMMARY.runCount).toBe(144)
    expect(G27_ORG_STUDY_SUMMARY.flat.meanQuality).toBeGreaterThan(0)
    expect(G27_ORG_STUDY_SUMMARY.hierarchical.meanCoordinationCost).toBeGreaterThan(
      G27_ORG_STUDY_SUMMARY.flat.meanCoordinationCost
    )
  })

  it('contains compact G28 intervention ranking and deltas', () => {
    expect(G28_INTERVENTION_SUMMARY.runCount).toBe(144)
    expect(G28_INTERVENTION_SUMMARY.ranking.bestQualityIntervention).toBe('merge_plus')
    expect(G28_INTERVENTION_SUMMARY.interventions.length).toBeGreaterThanOrEqual(6)
    expect(G28_INTERVENTION_SUMMARY.interventions.some((item) => item.id === 'audit_coverage_plus')).toBe(true)
  })

  it('preserves risk semantics and non-claims', () => {
    expect(ORG_STUDY_RISK_SEMANTICS.detectedFindings).toContain('DETECTION')
    expect(ORG_STUDY_RISK_SEMANTICS.latentRisk).toContain('EXPOSURE')
    expect(ORG_STUDY_NON_CLAIMS.some((claim) => claim.includes('real organizations'))).toBe(true)
  })
})
