/**
 * Simple deterministic hash for game state verification.
 * Not cryptographically secure — only used for replay integrity checks.
 */

export function djb2Hash(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function hashGameState(state: {
  tick: number
  cash: number
  reputation: number
  evidenceIntegrity: number
  orders: Record<string, unknown>
  tasks: Record<string, unknown>
  artifacts: Record<string, unknown>
  ledger: Array<{ tick: number; eventType: string; actorId: string; targetId: string }>
}): string {
  const parts: string[] = []

  parts.push(`tick:${state.tick}`)
  parts.push(`cash:${state.cash}`)
  parts.push(`rep:${state.reputation}`)
  parts.push(`evi:${state.evidenceIntegrity}`)

  // Hash orders by their status
  const orderKeys = Object.keys(state.orders).sort()
  for (const k of orderKeys) {
    const o = state.orders[k] as Record<string, unknown>
    parts.push(`o:${k}:${o.status}`)
  }

  // Hash tasks
  const taskKeys = Object.keys(state.tasks).sort()
  for (const k of taskKeys) {
    const t = state.tasks[k] as Record<string, unknown>
    parts.push(`t:${k}:${t.status}:${t.stage}`)
  }

  // Hash artifacts
  const artKeys = Object.keys(state.artifacts).sort()
  for (const k of artKeys) {
    const a = state.artifacts[k] as Record<string, unknown>
    parts.push(
      `a:${k}:${a.quality}:${a.evidenceStrength}:${a.defectCount}:${a.claimLevel}:${a.validationPassed}:${a.auditPassed}`
    )
  }

  // Hash ledger tail (last 20 events)
  const ledgerTail = state.ledger.slice(-20)
  for (const e of ledgerTail) {
    parts.push(`l:${e.tick}:${e.eventType}:${e.actorId}:${e.targetId}`)
  }

  return djb2Hash(parts.join('|'))
}
