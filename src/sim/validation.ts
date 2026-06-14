import type { Artifact, Agent, ValidationResult } from './types'
import { tickRng, clamp } from './rng'

/**
 * Script validator: checks deterministic, hard-rule defects.
 * Fast, cheap, stable. Only catches explicit issues.
 */
export function scriptValidate(artifact: Artifact): ValidationResult {
  const defectsFound = artifact.defectCount

  // Check if quality is below minimum
  const qualityOk = artifact.quality >= 3

  // Hash consistency check (simulated)
  const hashOk = artifact.hash.length >= 8

  const passed = qualityOk && hashOk && defectsFound <= 3

  const score = clamp(
    Math.round(
      (artifact.quality * 10 +
        (qualityOk ? 20 : 0) +
        (hashOk ? 10 : 0) -
        defectsFound * 8) /
        4
    ),
    0,
    100
  )

  let reason = ''
  if (!qualityOk) reason = 'Quality below minimum threshold. '
  if (!hashOk) reason += 'Hash integrity check failed. '
  if (defectsFound > 3) reason += `Too many defects (${defectsFound}). `
  if (passed) reason = 'All script checks passed.'

  return { passed, score, defectsFound, reason: reason.trim() }
}

/**
 * Agent semantic monitor: catches semantic issues.
 * Slower, more expensive, probabilistic. Catches overclaim and evidence gaps.
 */
export function agentSemanticValidate(
  seed: number,
  tick: number,
  artifact: Artifact,
  agent: Agent
): ValidationResult {
  const rng = tickRng(seed, tick + agent.id.charCodeAt(1) * 31)

  // Agent's validation skill affects detection probability
  const detectionSkill = agent.validation / 10

  // Overclaim gap
  const overclaimGap = Math.max(0, artifact.claimLevel - artifact.evidenceStrength)
  const overclaimDetected =
    overclaimGap > 1 && rng() < detectionSkill * (overclaimGap / 5)

  // Evidence gap
  const evidenceGap = Math.max(0, 7 - artifact.evidenceStrength)
  const evidenceGapDetected =
    evidenceGap > 2 && rng() < detectionSkill * (evidenceGap / 7)

  // Quality assessment
  const qualityDetected = artifact.quality < 4 && rng() < detectionSkill

  const totalIssues =
    (overclaimDetected ? 1 : 0) +
    (evidenceGapDetected ? 1 : 0) +
    (qualityDetected ? 1 : 0)

  const passed = totalIssues === 0

  const baseScore =
    artifact.quality * 8 +
    artifact.evidenceStrength * 5 -
    artifact.defectCount * 6

  const score = clamp(Math.round(baseScore), 0, 100)

  const reasons: string[] = []
  if (overclaimDetected) reasons.push('Overclaim detected.')
  if (evidenceGapDetected) reasons.push('Evidence gap detected.')
  if (qualityDetected) reasons.push('Quality issues found.')
  if (passed) reasons.push('Semantic validation passed.')

  return {
    passed,
    score,
    defectsFound: totalIssues,
    reason: reasons.join(' '),
  }
}

/**
 * Run validation on an artifact using either script or agent validator.
 */
export function runValidation(
  seed: number,
  tick: number,
  artifact: Artifact,
  agent: Agent | null
): ValidationResult {
  // Script validation always runs first (fast and cheap)
  const scriptResult = scriptValidate(artifact)

  if (!agent) return scriptResult

  // Agent semantic validation adds depth
  const agentResult = agentSemanticValidate(seed, tick, artifact, agent)

  // Combined: script must pass, agent can override
  return {
    passed: scriptResult.passed && agentResult.passed,
    score: Math.round((scriptResult.score + agentResult.score) / 2),
    defectsFound: scriptResult.defectsFound + agentResult.defectsFound,
    reason: `[Script] ${scriptResult.reason} [Agent] ${agentResult.reason}`,
  }
}
