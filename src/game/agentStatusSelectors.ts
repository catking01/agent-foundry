import type { GameState, Agent, Task, TaskStage, LedgerEvent } from '../sim/types'

// ============================================================
// G19: Agent Work Status Selectors
// ============================================================

export type AgentWorkStatus =
  | 'idle'
  | 'working'
  | 'fatigued'
  | 'blocked'

export interface AgentStatusCard {
  agentId: string
  name: string
  role: string
  status: AgentWorkStatus
  currentTaskId: string | null
  currentOrderId: string | null
  currentWorkshopId: string | null
  taskStage: TaskStage | null
  remainingWork: number | null
  fatigue: number
  lastLedgerEventType: string | null
}

export interface WorkshopQueueStatus {
  workshopId: string
  workshopName: string
  stage: TaskStage
  queuedCount: number
  activeCount: number
  capacity: number
}

export interface AgentWorkStatusSummary {
  tick: number
  totalAgents: number
  workingAgents: number
  idleAgents: number
  fatiguedAgents: number
  blockedAgents: number
  averageFatigue: number
  activeTasks: number
  queuedTasks: number
  bottleneckStage: TaskStage | null
  agents: AgentStatusCard[]
  workshopQueues: WorkshopQueueStatus[]
  recentEvents: LedgerEvent[]
}

// ============================================================
// Derivation
// ============================================================

const FATIGUE_THRESHOLD = 7

function findWorkshopForStage(
  state: GameState,
  stage: TaskStage,
): string | null {
  const ws = Object.values(state.workshops).find((w) => w.stage === stage)
  return ws?.id ?? null
}

function findOrderForTask(state: GameState, task: Task): string | null {
  return task.orderId
}

export function getAgentWorkStatusSummary(
  state: GameState,
): AgentWorkStatusSummary {
  const agentList = Object.values(state.agents)
  const taskList = Object.values(state.tasks)
  const allStages: TaskStage[] = [
    'planning',
    'engineering',
    'validation',
    'audit',
    'delivery',
  ]

  // Per-agent cards
  const agents: AgentStatusCard[] = agentList.map((agent) => {
    let status: AgentWorkStatus = 'idle'
    let currentTaskId: string | null = null
    let currentOrderId: string | null = null
    let currentWorkshopId: string | null = null
    let taskStage: TaskStage | null = null
    let remainingWork: number | null = null

    if (agent.status === 'working' && agent.currentTaskId) {
      const task = state.tasks[agent.currentTaskId]
      if (task) {
        currentTaskId = task.id
        currentOrderId = task.orderId
        currentWorkshopId = findWorkshopForStage(state, task.stage)
        taskStage = task.stage
        remainingWork = task.remainingWork
        status = agent.fatigue >= FATIGUE_THRESHOLD ? 'fatigued' : 'working'
      } else {
        // Agent has currentTaskId but task doesn't exist — blocked
        status = 'blocked'
        currentTaskId = agent.currentTaskId
      }
    } else if (agent.status === 'fatigued' || agent.fatigue >= FATIGUE_THRESHOLD) {
      status = 'fatigued'
    }

    // Find last ledger event involving this agent
    const lastEvent = state.ledger
      .slice()
      .reverse()
      .find((e) => e.actorId === agent.id)

    return {
      agentId: agent.id,
      name: agent.name,
      role: agent.role,
      status,
      currentTaskId,
      currentOrderId,
      currentWorkshopId,
      taskStage,
      remainingWork,
      fatigue: agent.fatigue,
      lastLedgerEventType: lastEvent?.eventType ?? null,
    }
  })

  // Workshop queue status
  const workshopQueues: WorkshopQueueStatus[] = Object.values(
    state.workshops,
  ).map((ws) => {
    const stageTasks = taskList.filter((t) => t.stage === ws.stage)
    const queued = stageTasks.filter((t) => t.status === 'queued').length
    const active = stageTasks.filter((t) => t.status === 'in_progress').length
    return {
      workshopId: ws.id,
      workshopName: ws.name,
      stage: ws.stage,
      queuedCount: queued,
      activeCount: active,
      capacity: ws.capacity,
    }
  })

  // Bottleneck: stage with most queued tasks
  let bottleneckStage: TaskStage | null = null
  let maxQueued = 0
  for (const stage of allStages) {
    const queued = taskList.filter(
      (t) => t.stage === stage && t.status === 'queued',
    ).length
    if (queued > maxQueued) {
      maxQueued = queued
      bottleneckStage = stage
    }
  }

  const workingAgents = agents.filter(
    (a) => a.status === 'working',
  ).length
  const idleAgents = agents.filter((a) => a.status === 'idle').length
  const fatiguedAgents = agents.filter(
    (a) => a.status === 'fatigued',
  ).length
  const blockedAgents = agents.filter(
    (a) => a.status === 'blocked',
  ).length
  const totalFatigue = agentList.reduce((s, a) => s + a.fatigue, 0)

  const activeTasks = taskList.filter(
    (t) => t.status === 'in_progress',
  ).length
  const queuedTasks = taskList.filter(
    (t) => t.status === 'queued',
  ).length

  const recentEvents = state.ledger.slice(-12).reverse()

  return {
    tick: state.tick,
    totalAgents: agentList.length,
    workingAgents,
    idleAgents,
    fatiguedAgents,
    blockedAgents,
    averageFatigue:
      agentList.length > 0
        ? Math.round((totalFatigue / agentList.length) * 100) / 100
        : 0,
    activeTasks,
    queuedTasks,
    bottleneckStage,
    agents,
    workshopQueues,
    recentEvents,
  }
}
