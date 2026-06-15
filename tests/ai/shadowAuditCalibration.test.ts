import { describe, it, expect } from 'vitest'
import { calibrateShadowAudit } from '../../src/ai/shadowAuditCalibration'
import type { ShadowAuditResult } from '../../src/ai/ollamaSchemas'
import type { CalibratedShadowAudit } from '../../src/ai/shadowAuditCalibration'

function rawResult(overrides: Partial<ShadowAuditResult> = {}): ShadowAuditResult {
  return {
    semanticPass: true,
    overclaimDetected: false,
    evidenceGapDetected: false,
    hiddenFailureConcern: false,
    qualityConcernDetected: false,
    riskLevel: 'low',
    reason: 'Clean artifact',
    confidence: 9,
    model: 'test-model',
    responseTimeMs: 1000,
    callSucceeded: true,
    errorMessage: null,
    ...overrides,
  }
}

/**
 * G17: Shadow audit calibration tests (no Ollama required).
 *
 * Verifies:
 *  - shouldBlockDelivery is ALWAYS false
 *  - Clean artifacts get info advisory
 *  - High-risk overclaims get warning/critical advisory
 *  - Hidden failures get appropriate level
 *  - Borderline cases get caution with high false-positive risk
 *  - Failed Ollama calls return unknown advisory
 *  - Primary/secondary issue separation works
 */
describe('Shadow Audit Calibration', () => {
  it('shouldBlockDelivery is ALWAYS false', () => {
    // Clean case
    expect(calibrateShadowAudit(rawResult()).shouldBlockDelivery).toBe(false)

    // High-risk overclaim
    expect(
      calibrateShadowAudit(
        rawResult({
          semanticPass: false,
          overclaimDetected: true,
          evidenceGapDetected: true,
          riskLevel: 'high',
          confidence: 9,
        }),
      ).shouldBlockDelivery
    ).toBe(false)

    // Hidden failure + overclaim combo
    expect(
      calibrateShadowAudit(
        rawResult({
          semanticPass: false,
          overclaimDetected: true,
          hiddenFailureConcern: true,
          riskLevel: 'high',
          confidence: 8,
        }),
      ).shouldBlockDelivery
    ).toBe(false)

    // Failed call
    expect(
      calibrateShadowAudit(
        rawResult({ callSucceeded: false, reason: 'Error' }),
      ).shouldBlockDelivery
    ).toBe(false)
  })

  it('clean artifact gets info advisory with primary=clean', () => {
    const cal = calibrateShadowAudit(rawResult())

    expect(cal.advisoryLevel).toBe('info')
    expect(cal.primaryIssue).toBe('clean')
    expect(cal.secondaryIssues).toEqual([])
    expect(cal.shouldRequestHumanReview).toBe(false)
    expect(cal.falsePositiveRisk).toBe('low')
  })

  it('high-risk overclaim with multiple issues gets critical advisory', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        semanticPass: false,
        overclaimDetected: true,
        evidenceGapDetected: true,
        riskLevel: 'high',
        confidence: 9,
      }),
    )

    expect(cal.advisoryLevel).toBe('critical')
    expect(cal.primaryIssue).toBe('overclaim')
    expect(cal.secondaryIssues).toContain('evidence_gap')
    expect(cal.shouldRequestHumanReview).toBe(true)
  })

  it('hidden failure with single issue gets caution advisory', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        semanticPass: false,
        hiddenFailureConcern: true,
        riskLevel: 'medium',
        confidence: 7,
      }),
    )

    expect(cal.advisoryLevel).toBe('caution')
    expect(cal.primaryIssue).toBe('hidden_failure')
    expect(cal.shouldRequestHumanReview).toBe(false)
  })

  it('hidden failure + overclaim combo gets critical advisory', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        semanticPass: false,
        hiddenFailureConcern: true,
        overclaimDetected: true,
        riskLevel: 'high',
        confidence: 8,
      }),
    )

    // Overclaim + hidden failure with risk=high → critical (2 severe issues)
    expect(cal.advisoryLevel).toBe('critical')
    expect(cal.primaryIssue).toBe('overclaim')
    expect(cal.secondaryIssues).toContain('hidden_failure')
    expect(cal.shouldRequestHumanReview).toBe(true)
  })

  it('borderline case (semanticPass=false, no flags) gets caution + high fp-risk', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        semanticPass: false,
        riskLevel: 'low',
        confidence: 3,
        reason: 'Unsure about this artifact',
      }),
    )

    expect(cal.advisoryLevel).toBe('caution')
    expect(cal.primaryIssue).toBe('borderline')
    expect(cal.falsePositiveRisk).toBe('high')
    expect(cal.shouldRequestHumanReview).toBe(false)
  })

  it('quality concern alone gets caution advisory', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        semanticPass: false,
        qualityConcernDetected: true,
        riskLevel: 'medium',
        confidence: 6,
      }),
    )

    expect(cal.advisoryLevel).toBe('caution')
    expect(cal.primaryIssue).toBe('quality')
    expect(cal.falsePositiveRisk).toBe('medium') // model over-triggers quality
  })

  it('failed Ollama call returns unknown advisory', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        callSucceeded: false,
        reason: 'Ollama not reachable',
      }),
    )

    expect(cal.advisoryLevel).toBe('info')
    expect(cal.primaryIssue).toBe('unknown')
    expect(cal.callSucceeded).toBe(false)
    expect(cal.shouldRequestHumanReview).toBe(false)
  })

  it('calibration explanation includes advisory level and primary issue', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        overclaimDetected: true,
        evidenceGapDetected: true,
        riskLevel: 'high',
        confidence: 8,
        reason: 'Significant overclaim detected',
      }),
    )

    expect(cal.explanation).toContain('Shadow audit:')
    expect(cal.explanation).toContain('Advisory:')
    expect(cal.explanation).toContain('primary=overclaim')
  })

  it('secondary issues are correctly separated from primary', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        semanticPass: false,
        overclaimDetected: true,
        evidenceGapDetected: true,
        qualityConcernDetected: true,
        hiddenFailureConcern: true,
        riskLevel: 'high',
        confidence: 9,
      }),
    )

    expect(cal.primaryIssue).toBe('overclaim')
    expect(cal.secondaryIssues.length).toBe(3)
    expect(cal.secondaryIssues).toContain('evidence_gap')
    expect(cal.secondaryIssues).toContain('quality')
    expect(cal.secondaryIssues).toContain('hidden_failure')
  })

  it('low model confidence increases false-positive risk', () => {
    const cal = calibrateShadowAudit(
      rawResult({
        semanticPass: false,
        overclaimDetected: true,
        riskLevel: 'medium',
        confidence: 2,
      }),
    )

    expect(cal.falsePositiveRisk).toBe('medium')
  })
})
