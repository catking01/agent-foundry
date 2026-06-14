import type { Artifact, Agent, AuditResult } from './types'
import { tickRng } from './rng'

/**
 * Run audit on an artifact.
 * Checks for overclaim, evidence gap, hidden failures.
 */
export function runAudit(
  seed: number,
  tick: number,
  artifact: Artifact,
  auditor: Agent,
  hasHiddenFailures: boolean
): AuditResult {
  const rng = tickRng(seed, tick + auditor.id.charCodeAt(2) * 47)

  const auditSkill = auditor.auditing / 10

  // Overclaim detection
  const overclaimGap = Math.max(0, artifact.claimLevel - artifact.evidenceStrength)
  const overclaimDetected =
    overclaimGap > 0.5 && rng() < auditSkill * Math.min(1, overclaimGap / 3)

  // Evidence gap detection
  const evidenceGap = Math.max(0, 7 - artifact.evidenceStrength)
  const evidenceGapDetected =
    evidenceGap > 1 && rng() < auditSkill * Math.min(1, evidenceGap / 6)

  // Hidden failure detection (e.g., failed parallel routes that were suppressed)
  const hiddenFailureDetected =
    hasHiddenFailures && rng() < auditSkill * 0.7

  const totalFlags =
    (overclaimDetected ? 1 : 0) +
    (evidenceGapDetected ? 1 : 0) +
    (hiddenFailureDetected ? 1 : 0)

  const passed = totalFlags === 0

  let riskLevel: AuditResult['riskLevel'] = 'low'
  if (totalFlags >= 2) riskLevel = 'high'
  else if (totalFlags === 1) riskLevel = 'medium'

  const reasons: string[] = []
  if (overclaimDetected)
    reasons.push(`Overclaim detected (gap: ${overclaimGap.toFixed(1)}).`)
  if (evidenceGapDetected)
    reasons.push(`Evidence gap detected (strength: ${artifact.evidenceStrength.toFixed(1)}).`)
  if (hiddenFailureDetected)
    reasons.push('Hidden failure routes detected.')
  if (passed) reasons.push('Audit passed. No issues found.')

  return {
    passed,
    overclaimDetected,
    evidenceGapDetected,
    hiddenFailureDetected,
    riskLevel,
    reason: reasons.join(' '),
  }
}
