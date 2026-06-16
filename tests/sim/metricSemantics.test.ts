import { describe, it, expect } from 'vitest'
import {
  METRIC_DEFINITIONS,
  getMetricDefinition,
  getDetectionMetrics,
  getActualMetrics,
  getExposureMetrics,
} from '../../src/sim/metricSemantics'

describe('Metric Semantics', () => {
  it('overclaimFindings is categorized as DETECTION, not ACTUAL', () => {
    const def = getMetricDefinition('overclaimFindings')
    expect(def).toBeDefined()
    expect(def!.category).toBe('DETECTION')
    expect(def!.warning).toBeTruthy()
    expect(def!.warning).toContain('undetected')
  })

  it('evidenceIntegrityEnd is categorized as ACTUAL', () => {
    const def = getMetricDefinition('evidenceIntegrityEnd')
    expect(def).toBeDefined()
    expect(def!.category).toBe('ACTUAL')
  })

  it('reputationEnd is categorized as ACTUAL', () => {
    const def = getMetricDefinition('reputationEnd')
    expect(def).toBeDefined()
    expect(def!.category).toBe('ACTUAL')
  })

  it('all detection metrics have warnings', () => {
    const detectionMetrics = getDetectionMetrics()
    expect(detectionMetrics.length).toBeGreaterThan(0)
    for (const m of detectionMetrics) {
      expect(m.warning).toBeTruthy()
    }
  })

  it('actual metrics have no warnings (they measure true state)', () => {
    const actualMetrics = getActualMetrics()
    expect(actualMetrics.length).toBeGreaterThan(0)
    for (const m of actualMetrics) {
      expect(m.warning).toBeNull()
    }
  })

  it('exposure metrics include auditCoverageRate and undetectedOverclaimExposure', () => {
    const exposureMetrics = getExposureMetrics()
    const fields = exposureMetrics.map((m) => m.field)
    expect(fields).toContain('auditCoverageRate')
    expect(fields).toContain('undetectedOverclaimExposure')
  })

  it('every metric has zh and en labels', () => {
    for (const m of METRIC_DEFINITIONS) {
      expect(m.labelZh).toBeTruthy()
      expect(m.labelEn).toBeTruthy()
      expect(m.definition).toBeTruthy()
    }
  })

  it('coordinationCost is defined for G26+ hierarchy scenarios', () => {
    const def = getMetricDefinition('coordinationCost')
    expect(def).toBeDefined()
    expect(def!.category).toBe('COST')
    expect(def!.definition).toContain('hierarchy')
  })

  it('returns undefined for unknown metric', () => {
    expect(getMetricDefinition('nonexistent_metric')).toBeUndefined()
  })
})
