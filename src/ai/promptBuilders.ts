import type { Artifact, Order } from '../sim/types'
import { SHADOW_AUDIT_JSON_SCHEMA } from './ollamaSchemas'

// ============================================================
// G14: Prompt Builders
// ============================================================

export interface ShadowAuditContext {
  orderTitle: string
  orderDomain: string
  orderComplexity: number
  orderAcceptanceCriteria: string[]

  artifactKind: string
  artifactQuality: number
  artifactEvidenceStrength: number
  artifactDefectCount: number
  artifactClaimLevel: number

  validationPassed: boolean | null
  validationScore: number | null
  auditPassed: boolean | null
  hasHiddenFailures: boolean
  routeCount: number
  loserCount: number
}

/**
 * Extract context for the shadow audit from game entities.
 */
export function buildShadowAuditContext(
  order: Order,
  artifact: Artifact,
  hasHiddenFailures: boolean,
  routeCount: number,
  loserCount: number,
): ShadowAuditContext {
  return {
    orderTitle: order.title,
    orderDomain: order.domain,
    orderComplexity: order.complexity,
    orderAcceptanceCriteria: order.acceptanceCriteria,

    artifactKind: artifact.kind,
    artifactQuality: artifact.quality,
    artifactEvidenceStrength: artifact.evidenceStrength,
    artifactDefectCount: artifact.defectCount,
    artifactClaimLevel: artifact.claimLevel,

    validationPassed: artifact.validationPassed,
    validationScore: artifact.validationScore,
    auditPassed: artifact.auditPassed,
    hasHiddenFailures,
    routeCount,
    loserCount,
  }
}

/**
 * Build the system prompt for the shadow auditor.
 */
export function buildSystemPrompt(): string {
  return `You are an AI quality auditor for a simulated AI company called "Agent Foundry".

Your role: evaluate whether an artifact (a deliverable produced by an AI employee) meets the customer's requirements and whether its claims are supported by evidence.

Rules:
1. Be concise and objective.
2. If the artifact's claims significantly exceed its evidence, flag overclaim.
3. If evidence strength is low compared to claim level, flag evidence gap.
4. If there were hidden or failed parallel routes producing this artifact, flag hidden failure concern.
5. Risk level should be 'high' if multiple issues are present, 'medium' if one significant issue, 'low' if all clear.
6. Confidence should reflect how certain you are given the information provided.
7. Respond ONLY with valid JSON matching the schema.`
}

/**
 * Build the user prompt with the specific artifact context.
 */
export function buildUserPrompt(ctx: ShadowAuditContext): string {
  return `Evaluate this artifact:

ORDER: "${ctx.orderTitle}" (${ctx.orderDomain}, complexity ${ctx.orderComplexity}/10)
Criteria: ${ctx.orderAcceptanceCriteria.join(', ')}

ARTIFACT: ${ctx.artifactKind}, quality ${ctx.artifactQuality}/10, evidence ${ctx.artifactEvidenceStrength}/10, claim ${ctx.artifactClaimLevel}/10, defects ${ctx.artifactDefectCount}
Overclaim gap: ${(ctx.artifactClaimLevel - ctx.artifactEvidenceStrength).toFixed(1)}

CONTEXT: validation=${ctx.validationPassed === null ? 'none' : ctx.validationPassed ? 'PASS' : 'FAIL'}, audit=${ctx.auditPassed === null ? 'none' : ctx.auditPassed ? 'PASS' : 'FAIL'}, hiddenFailures=${ctx.hasHiddenFailures}, routes=${ctx.routeCount}, losers=${ctx.loserCount}

Respond with ONLY a JSON object with keys: semanticPass, overclaimDetected, evidenceGapDetected, hiddenFailureConcern, riskLevel (low/medium/high), reason (string), confidence (0-10).`
}
