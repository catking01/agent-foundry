import { describe, it, expect, beforeAll } from 'vitest'
import {
  G28_INTERVENTIONS,
  G28_STUDY_ORDERS,
  G28_TOTAL_RUNS,
} from '../../src/data/orgInterventions'
import {
  buildG28Artifacts,
  filterInterventionRuns,
  meanInterventionValue,
  runOrgInterventionStudy,
  type OrgInterventionMatrix,
} from '../../src/sim/orgInterventionStudy'
import { STUDY_SEEDS } from '../../src/data/orgStudyOrders'

let matrix: OrgInterventionMatrix

beforeAll(() => {
  matrix = runOrgInterventionStudy()
})

describe('G28 Intervention Matrix Structure', () => {
  it('has expected total runs: 8 seeds x 3 orders x 6 interventions = 144', () => {
    expect(matrix.meta.totalRuns).toBe(G28_TOTAL_RUNS)
    expect(matrix.runs.length).toBe(144)
  })

  it('covers all seeds, order classes, and interventions', () => {
    expect(new Set(matrix.runs.map((r) => r.seed))).toEqual(new Set(STUDY_SEEDS))
    expect(new Set(matrix.runs.map((r) => r.orderClass))).toEqual(new Set(['simple', 'medium', 'complex']))
    expect(new Set(matrix.runs.map((r) => r.interventionId))).toEqual(new Set(G28_INTERVENTIONS.map((i) => i.id)))
  })

  it('uses one representative order per class for the MVP', () => {
    expect(G28_STUDY_ORDERS.length).toBe(3)
    expect(new Set(G28_STUDY_ORDERS.map((o) => o.class))).toEqual(new Set(['simple', 'medium', 'complex']))
    expect(matrix.meta.orderInstancesPerClass).toBe(1)
  })

  it('every non-baseline run has a matching baseline for same seed/order', () => {
    for (const run of matrix.runs.filter((r) => r.interventionId !== 'baseline_hierarchical')) {
      const baseline = matrix.runs.find((candidate) => (
        candidate.seed === run.seed &&
        candidate.orderInstanceId === run.orderInstanceId &&
        candidate.interventionId === 'baseline_hierarchical'
      ))
      expect(baseline).toBeDefined()
      expect(run.baselineId).toBe(baseline!.runId)
    }
  })
})

describe('G28 Delta Metrics', () => {
  it('deltas recompute from raw matrix baseline rows', () => {
    for (const run of matrix.runs) {
      const baseline = matrix.runs.find((candidate) => candidate.runId === run.baselineId)
      expect(baseline).toBeDefined()
      expect(run.deltaFinalQuality).toBeCloseTo(run.finalQuality - baseline!.finalQuality, 5)
      expect(run.deltaLatentRisk).toBeCloseTo(run.latentRiskEstimate - baseline!.latentRiskEstimate, 5)
      expect(run.deltaCoordinationCost).toBeCloseTo(run.coordinationCost - baseline!.coordinationCost, 5)
      expect(run.deltaDeliveryTicks).toBe(run.deliveryTicks - baseline!.deliveryTicks)
      expect(run.deltaRiskAdjustedQuality).toBeCloseTo(run.riskAdjustedQuality - baseline!.riskAdjustedQuality, 5)
    }
  })

  it('at least one intervention changes quality, risk, or coordination cost', () => {
    const changed = matrix.runs.filter((run) => (
      run.interventionId !== 'baseline_hierarchical' &&
      (
        run.deltaFinalQuality !== 0 ||
        run.deltaLatentRisk !== 0 ||
        run.deltaCoordinationCost !== 0
      )
    ))
    expect(changed.length).toBeGreaterThan(0)
  })

  it('audit coverage intervention changes detection or latent risk', () => {
    const runs = filterInterventionRuns(matrix, 'audit_coverage_plus')
    const changed = runs.filter((run) => (
      run.deltaLatentRisk !== 0 ||
      run.deltaDetectedOverclaimFindings !== 0 ||
      run.deltaAuditCoverageRate !== 0
    ))
    expect(changed.length).toBe(runs.length)
  })

  it('handoff_plus reduces coordination cost or improves coordination efficiency', () => {
    const runs = filterInterventionRuns(matrix, 'handoff_plus')
    const improved = runs.filter((run) => (
      run.deltaCoordinationCost < 0 ||
      run.deltaCoordinationEfficiency > 0
    ))
    expect(improved.length).toBeGreaterThan(0)
  })

  it('merge_plus changes final quality or documents no effect', () => {
    const runs = filterInterventionRuns(matrix, 'merge_plus')
    const changedQuality = runs.filter((run) => run.deltaFinalQuality !== 0)
    const documentedNoEffect = runs.filter((run) => run.effectNote.includes('no quality effect'))
    expect(changedQuality.length + documentedNoEffect.length).toBe(runs.length)
  })
})

describe('G28 Aggregates And Ranking', () => {
  it('aggregates include every intervention and every intervention/orderClass pair', () => {
    expect(matrix.aggregates.byIntervention.length).toBe(G28_INTERVENTIONS.length)
    expect(matrix.aggregates.byInterventionAndOrderClass.length).toBe(G28_INTERVENTIONS.length * 3)
  })

  it('ranking exposes required best-intervention categories', () => {
    expect(matrix.ranking.bestQualityIntervention).toBeTruthy()
    expect(matrix.ranking.bestRiskReductionIntervention).toBeTruthy()
    expect(matrix.ranking.bestCoordinationEfficiencyIntervention).toBeTruthy()
    expect(matrix.ranking.fastestIntervention).toBeTruthy()
    expect(matrix.ranking.bestRiskAdjustedQualityIntervention).toBeTruthy()
  })

  it('mean helper returns intervention-level values', () => {
    const baselineQuality = meanInterventionValue(matrix, 'baseline_hierarchical', 'finalQuality')
    expect(baselineQuality).toBeGreaterThan(0)
  })
})

describe('G28 Artifacts', () => {
  it('builds machine-readable artifacts from the intervention matrix', () => {
    const artifacts = buildG28Artifacts(matrix, '2026-06-19T00:00:00.000Z')

    expect(artifacts.raw.runs.length).toBe(144)
    expect(artifacts.aggregates.byIntervention.length).toBe(G28_INTERVENTIONS.length)
    expect(artifacts.deltaReport.checks.every((check) => check.passed)).toBe(true)
    expect(artifacts.deltaReport.verdict).toBe('PASS')
    expect(artifacts.byOrderComplexity.classes.length).toBe(G28_INTERVENTIONS.length * 3)
    expect(artifacts.ranking.bestQualityIntervention).toBeTruthy()
  })

  it('risk semantics keep detected findings separate from latent risk', () => {
    const auditRuns = filterInterventionRuns(matrix, 'audit_coverage_plus')
    expect(auditRuns.some((run) => run.detectedOverclaimFindings !== run.latentRiskEstimate)).toBe(true)
    expect(matrix.meta.riskSemantics.detectedOverclaimFindings).toContain('DETECTION')
    expect(matrix.meta.riskSemantics.latentRiskEstimate).toContain('EXPOSURE')
  })
})
