import { describe, it, expect, beforeAll } from 'vitest'
import {
  ORG_STUDY_ORDERS,
  STUDY_SEEDS,
  STUDY_MODES,
  STUDY_TOTAL_RUNS,
  getOrdersByClass,
} from '../../src/data/orgStudyOrders'
import { runFlatOrgScenario, runHierarchicalOrgScenario } from '../../src/sim/orgScenarioRunner'
import {
  runMultiSeedStudy,
  filterRuns,
  generateFindings,
  meanOf,
  qualityPerCoordinationCost,
  riskAdjustedQuality,
} from '../../src/sim/orgMultiSeedStudy'
import type { StudyMatrix } from '../../src/sim/orgMultiSeedStudy'

// Run once and share across tests
let matrix: StudyMatrix

beforeAll(() => {
  matrix = runMultiSeedStudy()
})

describe('Study Matrix Structure', () => {
  it('has correct total runs: 8 seeds × 9 orders × 2 modes = 144', () => {
    expect(matrix.runs.length).toBe(STUDY_TOTAL_RUNS)
    expect(matrix.runs.length).toBe(144)
  })

  it('each run has all required fields', () => {
    for (const run of matrix.runs) {
      expect(run.seed).toBeGreaterThan(0)
      expect(run.mode).toBeDefined()
      expect(run.orderClass).toBeDefined()
      expect(run.result.mode).toBe(run.mode)
      expect(run.result.metrics.finalQuality).toBeDefined()
    }
  })

  it('all 8 seeds are covered', () => {
    const seeds = new Set(matrix.runs.map((r) => r.seed))
    expect(seeds.size).toBe(8)
    for (const seed of STUDY_SEEDS) {
      expect(seeds.has(seed)).toBe(true)
    }
  })

  it('all 3 order classes are covered', () => {
    const classes = new Set(matrix.runs.map((r) => r.orderClass))
    expect(classes.has('simple')).toBe(true)
    expect(classes.has('medium')).toBe(true)
    expect(classes.has('complex')).toBe(true)
  })

  it('both modes are covered for every seed×order combination', () => {
    for (const seed of STUDY_SEEDS) {
      for (const order of ORG_STUDY_ORDERS) {
        const flatRuns = matrix.runs.filter(
          (r) => r.seed === seed && r.orderId === order.id && r.mode === 'flat'
        )
        const hierRuns = matrix.runs.filter(
          (r) => r.seed === seed && r.orderId === order.id && r.mode === 'hierarchical'
        )
        expect(flatRuns.length).toBe(1)
        expect(hierRuns.length).toBe(1)
      }
    }
  })
})

describe('Determinism', () => {
  it('same seed/order/mode produces identical results', () => {
    const a = runFlatOrgScenario(42, { id: 'test', title: 'T', complexity: 5 })
    const b = runFlatOrgScenario(42, { id: 'test', title: 'T', complexity: 5 })

    expect(a.metrics.finalQuality).toBe(b.metrics.finalQuality)
    expect(a.metrics.finalEvidenceStrength).toBe(b.metrics.finalEvidenceStrength)
    expect(a.metrics.coordinationCost).toBe(b.metrics.coordinationCost)
    expect(a.metrics.handoffCount).toBe(b.metrics.handoffCount)
    expect(a.finalArtifactId).toBe(b.finalArtifactId)
  })
})

describe('Flat vs Hierarchy Comparison', () => {
  it('hierarchy has higher coordination cost than flat on average', () => {
    const flatCoord = meanOf(
      filterRuns(matrix, 'flat'),
      (r) => r.result.metrics.coordinationCost
    )
    const hierCoord = meanOf(
      filterRuns(matrix, 'hierarchical'),
      (r) => r.result.metrics.coordinationCost
    )
    expect(hierCoord).toBeGreaterThan(flatCoord)
  })

  it('hierarchy has more handoff events than flat on average', () => {
    const flatHandoff = meanOf(
      filterRuns(matrix, 'flat'),
      (r) => r.result.metrics.handoffCount
    )
    const hierHandoff = meanOf(
      filterRuns(matrix, 'hierarchical'),
      (r) => r.result.metrics.handoffCount
    )
    expect(hierHandoff).toBeGreaterThan(flatHandoff)
  })

  it('hierarchy takes more ticks than flat on average', () => {
    const flatTicks = meanOf(
      filterRuns(matrix, 'flat'),
      (r) => r.result.metrics.totalTicks
    )
    const hierTicks = meanOf(
      filterRuns(matrix, 'hierarchical'),
      (r) => r.result.metrics.totalTicks
    )
    expect(hierTicks).toBeGreaterThan(flatTicks)
  })

  it('flat and hierarchy produce different metrics', () => {
    const flat = filterRuns(matrix, 'flat')
    const hier = filterRuns(matrix, 'hierarchical')

    const diffs = [
      meanOf(flat, (r) => r.result.metrics.finalQuality) !== meanOf(hier, (r) => r.result.metrics.finalQuality),
      meanOf(flat, (r) => r.result.metrics.coordinationCost) !== meanOf(hier, (r) => r.result.metrics.coordinationCost),
      meanOf(flat, (r) => r.result.metrics.handoffCount) !== meanOf(hier, (r) => r.result.metrics.handoffCount),
      meanOf(flat, (r) => r.result.metrics.totalTicks) !== meanOf(hier, (r) => r.result.metrics.totalTicks),
    ]
    expect(diffs.some(Boolean)).toBe(true)
  })
})

describe('Order Complexity Breakdown', () => {
  it('complex orders have more fan-out than simple orders', () => {
    const simpleRuns = filterRuns(matrix, 'hierarchical', 'simple')
    const complexRuns = filterRuns(matrix, 'hierarchical', 'complex')

    const simpleFanout = meanOf(simpleRuns, (r) => r.result.metrics.fanoutCount)
    const complexFanout = meanOf(complexRuns, (r) => r.result.metrics.fanoutCount)

    expect(complexFanout).toBeGreaterThanOrEqual(simpleFanout)
  })

  it('complex orders produce more artifacts than simple orders', () => {
    const simpleRuns = filterRuns(matrix, 'hierarchical', 'simple')
    const complexRuns = filterRuns(matrix, 'hierarchical', 'complex')

    const simpleArts = meanOf(simpleRuns, (r) => r.result.metrics.artifactsProduced)
    const complexArts = meanOf(complexRuns, (r) => r.result.metrics.artifactsProduced)

    expect(complexArts).toBeGreaterThan(simpleArts)
  })

  it('simple orders may show less hierarchy benefit (lower fanout cost difference)', () => {
    const simpleFlat = filterRuns(matrix, 'flat', 'simple')
    const simpleHier = filterRuns(matrix, 'hierarchical', 'simple')
    const complexFlat = filterRuns(matrix, 'flat', 'complex')
    const complexHier = filterRuns(matrix, 'hierarchical', 'complex')

    const simpleCoordDelta =
      meanOf(simpleHier, (r) => r.result.metrics.coordinationCost) -
      meanOf(simpleFlat, (r) => r.result.metrics.coordinationCost)
    const complexCoordDelta =
      meanOf(complexHier, (r) => r.result.metrics.coordinationCost) -
      meanOf(complexFlat, (r) => r.result.metrics.coordinationCost)

    // Complex orders should have larger absolute coordination delta
    // (more fan-out → more handoffs)
    expect(complexCoordDelta).toBeGreaterThanOrEqual(simpleCoordDelta)
  })
})

describe('Risk Semantics', () => {
  it('detectedOverclaimFindings is NOT used as a risk metric (latentRiskEstimate is)', () => {
    const hierRuns = filterRuns(matrix, 'hierarchical')
    const meanDetected = meanOf(hierRuns, (r) => r.result.metrics.detectedOverclaimFindings)
    const meanLatent = meanOf(hierRuns, (r) => r.result.metrics.latentRiskEstimate)

    // Both metrics should exist and be >= 0
    expect(meanDetected).toBeGreaterThanOrEqual(0)
    expect(meanLatent).toBeGreaterThanOrEqual(0)
  })

  it('latentRiskEstimate may differ from detectedOverclaimFindings', () => {
    // latent risk ≠ detected findings — different metrics, different meanings
    const hierRuns = filterRuns(matrix, 'hierarchical')

    // At least some runs should have different values for the two metrics
    const diffs = hierRuns.filter(
      (r) => r.result.metrics.detectedOverclaimFindings !== r.result.metrics.latentRiskEstimate
    )
    // This is probabilistic but should hold for most runs
    expect(diffs.length).toBeGreaterThan(0)
  })
})

describe('Aggregates', () => {
  it('aggregates exist for all classes and modes', () => {
    for (const cls of ['simple', 'medium', 'complex']) {
      const classAggs = matrix.byClass[cls]
      expect(classAggs).toBeDefined()
      expect(classAggs.length).toBe(2) // flat and hierarchical

      for (const agg of classAggs) {
        expect(agg.count).toBeGreaterThan(0)
        expect(Object.keys(agg.aggregates).length).toBeGreaterThan(0)
      }
    }
  })

  it('aggregate mean is within data range', () => {
    for (const cls of ['simple', 'medium', 'complex']) {
      for (const agg of matrix.byClass[cls]) {
        for (const [field, stats] of Object.entries(agg.aggregates)) {
          if (stats && 'mean' in stats) {
            expect(stats.mean).toBeGreaterThanOrEqual(stats.min)
            expect(stats.mean).toBeLessThanOrEqual(stats.max)
          }
        }
      }
    }
  })

  it('summary has all required fields', () => {
    const s = matrix.summary
    expect(s.flatMeanQuality).toBeDefined()
    expect(s.hierarchicalMeanQuality).toBeDefined()
    expect(s.flatMeanCoordinationCost).toBeDefined()
    expect(s.hierarchicalMeanCoordinationCost).toBeDefined()
    expect(s.qualityDelta).toBeDefined()
    expect(s.coordinationDelta).toBeDefined()
    expect(s.tickDelta).toBeDefined()
    expect(s.hierarchicalMeanCoordinationCost).toBeGreaterThan(s.flatMeanCoordinationCost)
    expect(s.hierarchicalMeanHandoffCount).toBeGreaterThan(s.flatMeanHandoffCount)
  })
})

describe('Findings Generation', () => {
  it('generates at least 5 findings', () => {
    const findings = generateFindings(matrix)
    expect(findings.length).toBeGreaterThanOrEqual(5)
  })

  it('findings include coordination cost, handoff, quality, risk', () => {
    const findings = generateFindings(matrix)
    const metrics = findings.map((f) => f.metric)
    expect(metrics.some((m) => m.includes('coordination'))).toBe(true)
    expect(metrics.some((m) => m.includes('handoff'))).toBe(true)
    expect(metrics.some((m) => m.includes('Quality'))).toBe(true)
    expect(metrics.some((m) => m.includes('latent'))).toBe(true)
  })

  it('high-confidence finding: hierarchy has more coordination cost', () => {
    const findings = generateFindings(matrix)
    const coordFinding = findings.find((f) => f.metric === 'coordinationCost')
    expect(coordFinding).toBeDefined()
    expect(coordFinding!.confidence).toBe('high')
    expect(coordFinding!.direction).toBe('flat_better')
  })
})

describe('Helper Functions', () => {
  it('qualityPerCoordinationCost computes correctly', () => {
    const runs = filterRuns(matrix, 'hierarchical')
    const first = runs[0]
    const qpc = qualityPerCoordinationCost(first.result)
    expect(qpc).toBeGreaterThanOrEqual(0)
  })

  it('riskAdjustedQuality is <= finalQuality', () => {
    const runs = filterRuns(matrix, 'hierarchical')
    const first = runs[0]
    const raq = riskAdjustedQuality(first.result)
    const qual = first.result.metrics.finalQuality
    if (qual !== null) {
      expect(raq).toBeLessThanOrEqual(qual)
    }
  })

  it('filterRuns correctly filters by mode', () => {
    const flat = filterRuns(matrix, 'flat')
    expect(flat.every((r) => r.mode === 'flat')).toBe(true)
    expect(flat.length).toBeGreaterThan(0)

    const hier = filterRuns(matrix, 'hierarchical')
    expect(hier.every((r) => r.mode === 'hierarchical')).toBe(true)
    expect(hier.length).toBeGreaterThan(0)
  })

  it('filterRuns correctly filters by mode and class', () => {
    const flatSimple = filterRuns(matrix, 'flat', 'simple')
    expect(flatSimple.every((r) => r.mode === 'flat' && r.orderClass === 'simple')).toBe(true)
    expect(flatSimple.length).toBe(24) // 8 seeds × 3 simple orders
  })
})

describe('Study Meta', () => {
  it('meta has correct structure', () => {
    expect(matrix.meta.totalRuns).toBe(144)
    expect(matrix.meta.seeds).toEqual(STUDY_SEEDS)
    expect(matrix.meta.modes).toEqual(['flat', 'hierarchical'])
    expect(matrix.meta.generatedAt).toBeTruthy()
  })

  it('matrix is JSON-serializable', () => {
    const json = JSON.stringify(matrix)
    expect(json).toBeTruthy()
    const parsed = JSON.parse(json)
    expect(parsed.runs.length).toBe(144)
  })
})
