import type { ShadowAuditResult } from './ollamaSchemas'

// ============================================================
// G17: Calibrated Shadow Audit Advisory
// ============================================================

export type AdvisoryLevel = 'info' | 'caution' | 'warning' | 'critical'

export type PrimaryIssue =
  | 'clean'
  | 'overclaim'
  | 'evidence_gap'
  | 'quality'
  | 'hidden_failure'
  | 'borderline'
  | 'unknown'

export interface CalibratedShadowAudit {
  /** Overall advisory level — how much attention this artifact needs */
  advisoryLevel: AdvisoryLevel

  /** The single most significant issue detected (or 'clean'/'borderline') */
  primaryIssue: PrimaryIssue

  /** Any secondary issues also detected */
  secondaryIssues: PrimaryIssue[]

  /** MUST always be false. Shadow audit is advisory only — never blocks delivery. */
  shouldBlockDelivery: false

  /** Whether a human reviewer should look at this artifact more closely */
  shouldRequestHumanReview: boolean

  /** Estimated risk that this is a false positive (model being too cautious) */
  falsePositiveRisk: 'low' | 'medium' | 'high'

  /** Human-readable explanation combining model output with calibration context */
  explanation: string

  /** The raw model confidence (0-10) */
  modelConfidence: number

  /** Whether the underlying Ollama call succeeded */
  callSucceeded: boolean

  /** Original model name */
  model: string
}

// ============================================================
// Calibration Logic
// ============================================================

/**
 * Convert a raw ShadowAuditResult into a calibrated advisory.
 *
 * The calibration applies policy rules that:
 * 1. Separate primary vs secondary issues
 * 2. Downgrade borderline cases from hard flags to advisory
 * 3. Guarantee shouldBlockDelivery is always false
 * 4. Estimate false-positive risk for cases the model tends to over-trigger
 */
export function calibrateShadowAudit(raw: ShadowAuditResult): CalibratedShadowAudit {
  // If the call failed, return an "unknown" advisory
  if (!raw.callSucceeded) {
    return {
      advisoryLevel: 'info',
      primaryIssue: 'unknown',
      secondaryIssues: [],
      shouldBlockDelivery: false,
      shouldRequestHumanReview: false,
      falsePositiveRisk: 'low',
      explanation: raw.reason,
      modelConfidence: raw.confidence,
      callSucceeded: false,
      model: raw.model,
    }
  }

  // Collect all detected issues
  const issues: PrimaryIssue[] = []

  if (raw.overclaimDetected) issues.push('overclaim')
  if (raw.evidenceGapDetected) issues.push('evidence_gap')
  if (raw.qualityConcernDetected) issues.push('quality')
  if (raw.hiddenFailureConcern) issues.push('hidden_failure')

  // Determine primary issue by severity hierarchy
  const severityOrder: PrimaryIssue[] = [
    'overclaim',
    'hidden_failure',
    'evidence_gap',
    'quality',
    'borderline',
  ]

  let primaryIssue: PrimaryIssue = 'clean'
  for (const sev of severityOrder) {
    if (issues.includes(sev)) {
      primaryIssue = sev
      break
    }
  }

  // No issues detected but model flagged semanticPass=false — borderline
  if (primaryIssue === 'clean' && !raw.semanticPass) {
    primaryIssue = 'borderline'
  }

  const secondaryIssues = issues.filter((i) => i !== primaryIssue)

  // Determine advisory level
  let advisoryLevel: AdvisoryLevel = 'info'
  const issueCount = issues.length

  if (primaryIssue === 'clean') {
    advisoryLevel = raw.confidence >= 5 ? 'info' : 'caution'
  } else if (primaryIssue === 'borderline') {
    advisoryLevel = 'caution'
  } else if (primaryIssue === 'overclaim' && issueCount >= 2) {
    advisoryLevel = raw.riskLevel === 'high' ? 'critical' : 'warning'
  } else if (primaryIssue === 'hidden_failure') {
    advisoryLevel = issueCount >= 2 ? 'warning' : 'caution'
  } else if (primaryIssue === 'evidence_gap') {
    advisoryLevel = issueCount >= 2 ? 'warning' : 'caution'
  } else if (primaryIssue === 'quality') {
    advisoryLevel = raw.riskLevel === 'high' ? 'warning' : 'caution'
  }

  // Estimate false-positive risk
  // Model tends to over-trigger qualityConcernDetected and evidenceGapDetected
  let falsePositiveRisk: 'low' | 'medium' | 'high' = 'low'

  if (primaryIssue === 'borderline') {
    falsePositiveRisk = 'high'
  } else if (
    primaryIssue === 'quality' &&
    !raw.overclaimDetected &&
    raw.confidence < 7
  ) {
    falsePositiveRisk = 'medium'
  } else if (
    primaryIssue === 'evidence_gap' &&
    issueCount === 1 &&
    raw.confidence < 6
  ) {
    falsePositiveRisk = 'medium'
  } else if (raw.confidence < 4) {
    falsePositiveRisk = 'medium'
  }

  // Human review: warranted for high-risk or complex cases
  const shouldRequestHumanReview =
    advisoryLevel === 'critical' ||
    advisoryLevel === 'warning' ||
    (primaryIssue === 'hidden_failure' && issueCount >= 2)

  // Build explanation
  const parts: string[] = []
  parts.push(`Shadow audit: ${raw.reason}`)
  parts.push(`Advisory: ${advisoryLevel}, primary=${primaryIssue}`)
  if (secondaryIssues.length > 0) {
    parts.push(`Also flagged: ${secondaryIssues.join(', ')}`)
  }
  if (falsePositiveRisk !== 'low') {
    parts.push(`Note: model may be over-cautious (fp-risk=${falsePositiveRisk})`)
  }
  if (shouldRequestHumanReview) {
    parts.push('Recommendation: human review suggested')
  }

  return {
    advisoryLevel,
    primaryIssue,
    secondaryIssues,
    shouldBlockDelivery: false as const,
    shouldRequestHumanReview,
    falsePositiveRisk,
    explanation: parts.join('. '),
    modelConfidence: raw.confidence,
    callSucceeded: true,
    model: raw.model,
  }
}
