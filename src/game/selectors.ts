import type { GameState, Order, Task, Agent, Artifact } from '../sim/types'

// ============================================================
// Orders
// ============================================================

export function getAvailableOrders(state: GameState): Order[] {
  return Object.values(state.orders).filter((o) => o.status === 'available')
}

export function getAcceptedOrders(state: GameState): Order[] {
  return Object.values(state.orders).filter((o) => o.status === 'accepted')
}

export function getInProgressOrders(state: GameState): Order[] {
  return Object.values(state.orders).filter((o) => o.status === 'in_progress')
}

export function getDeliveredOrders(state: GameState): Order[] {
  return Object.values(state.orders).filter((o) => o.status === 'delivered')
}

export function getFailedOrders(state: GameState): Order[] {
  return Object.values(state.orders).filter((o) => o.status === 'failed')
}

// ============================================================
// Tasks
// ============================================================

export function getTasksByStage(
  state: GameState,
  stage: Task['stage']
): Task[] {
  return Object.values(state.tasks).filter((t) => t.stage === stage)
}

export function getQueuedTasks(state: GameState): Task[] {
  return Object.values(state.tasks).filter((t) => t.status === 'queued')
}

export function getInProgressTasks(state: GameState): Task[] {
  return Object.values(state.tasks).filter((t) => t.status === 'in_progress')
}

export function getTasksForOrder(state: GameState, orderId: string): Task[] {
  return Object.values(state.tasks).filter((t) => t.orderId === orderId)
}

// ============================================================
// Agents
// ============================================================

export function getIdleAgents(state: GameState): Agent[] {
  return Object.values(state.agents).filter((a) => a.status === 'idle')
}

export function getWorkingAgents(state: GameState): Agent[] {
  return Object.values(state.agents).filter((a) => a.status === 'working')
}

export function getFatiguedAgents(state: GameState): Agent[] {
  return Object.values(state.agents).filter(
    (a) => a.status === 'fatigued' || a.fatigue >= 7
  )
}

export function getAgentsForStage(
  state: GameState,
  stage: Task['stage']
): Agent[] {
  // Best agents for a given stage based on skills
  return Object.values(state.agents)
    .filter((a) => a.status === 'idle' && a.fatigue < 7)
    .sort((a, b) => {
      const scoreA = scoreAgentForStage(a, stage)
      const scoreB = scoreAgentForStage(b, stage)
      return scoreB - scoreA
    })
}

function scoreAgentForStage(agent: Agent, stage: Task['stage']): number {
  switch (stage) {
    case 'planning':
      return agent.planning * 3 + agent.creativity * 2
    case 'engineering':
      return agent.coding * 3 + agent.speed * 2
    case 'validation':
      return agent.validation * 3 + agent.reliability * 2
    case 'audit':
      return agent.auditing * 3 + agent.reliability * 2
    case 'delivery':
      return agent.reliability * 2 + agent.speed * 2
  }
}

// ============================================================
// Artifacts
// ============================================================

export function getArtifactsForOrder(
  state: GameState,
  orderId: string
): Artifact[] {
  return Object.values(state.artifacts)
    .filter((a) => a.orderId === orderId)
    .sort((a, b) => b.createdAtTick - a.createdAtTick)
}

export function getLatestArtifactForOrder(
  state: GameState,
  orderId: string
): Artifact | null {
  const artifacts = getArtifactsForOrder(state, orderId)
  return artifacts[0] ?? null
}

export function getValidatedArtifacts(state: GameState): Artifact[] {
  return Object.values(state.artifacts).filter(
    (a) => a.validationPassed !== null
  )
}

export function getAuditedArtifacts(state: GameState): Artifact[] {
  return Object.values(state.artifacts).filter((a) => a.auditPassed !== null)
}

// ============================================================
// Workshop
// ============================================================

export function getWorkshopLoad(
  state: GameState,
  workshopId: string
): { current: number; capacity: number } {
  const ws = state.workshops[workshopId]
  if (!ws) return { current: 0, capacity: 1 }

  let current = 0
  for (const task of Object.values(state.tasks)) {
    if (task.status === 'in_progress' && task.stage === ws.stage) {
      current += task.assignedAgentIds.length
    }
  }

  return { current, capacity: ws.capacity }
}

// ============================================================
// Summary
// ============================================================

export function getCashFlow(state: GameState): {
  income: number
  expenses: number
} {
  let expenses = 0
  for (const agent of Object.values(state.agents)) {
    expenses += agent.salaryPerTick
  }
  for (const ws of Object.values(state.workshops)) {
    expenses += ws.maintenanceCost
  }

  // Rough income estimate from delivered orders
  const income = state.metrics.totalRevenue

  return { income, expenses }
}

export function getActiveOrderCount(state: GameState): number {
  return Object.values(state.orders).filter(
    (o) => o.status === 'accepted' || o.status === 'in_progress'
  ).length
}
