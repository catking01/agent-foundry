import type { GameState, Agent, Task, Workshop } from './types'

/**
 * Try to auto-assign queued tasks to idle agents.
 * This runs each tick to keep work flowing.
 * Only assigns if the workshop has capacity.
 */
export function autoScheduleTasks(state: GameState): GameState {
  const next = {
    ...state,
    tasks: { ...state.tasks },
    agents: { ...state.agents },
    workshops: { ...state.workshops },
  }

  // Get workshop load counts
  const workshopLoads: Record<string, number> = {}
  for (const ws of Object.values(next.workshops)) {
    workshopLoads[ws.id] = 0
  }

  // Count currently working agents per workshop
  for (const task of Object.values(next.tasks)) {
    if (task.status === 'in_progress') {
      const ws = findWorkshopForStage(next, task.stage)
      if (ws) workshopLoads[ws.id] = (workshopLoads[ws.id] || 0) + task.assignedAgentIds.length
    }
  }

  // Find queued tasks
  const queuedTasks = Object.values(next.tasks)
    .filter((t) => t.status === 'queued')
    .sort((a, b) => a.createdAtTick - b.createdAtTick)

  for (const task of queuedTasks) {
    const ws = findWorkshopForStage(next, task.stage)
    if (!ws) continue

    // Check capacity
    if (workshopLoads[ws.id] >= ws.capacity) continue

    // Find an idle agent suitable for this task
    const agent = findIdleAgentForTask(next, task)
    if (!agent) continue

    // Assign agent
    task.status = 'in_progress'
    task.assignedAgentIds = [...task.assignedAgentIds, agent.id]

    next.agents[agent.id] = {
      ...agent,
      status: 'working',
      currentTaskId: task.id,
    }

    workshopLoads[ws.id] = (workshopLoads[ws.id] || 0) + 1

    next.ledger.push({
      tick: next.tick,
      eventType: 'AGENT_ASSIGNED',
      actorId: agent.id,
      targetId: task.id,
      details: {
        stage: task.stage,
        workshopId: ws.id,
        orderId: task.orderId,
      },
      stateHash: '',
    })
  }

  return next
}

function findWorkshopForStage(
  state: GameState,
  stage: Task['stage']
): Workshop | undefined {
  const workshops = Object.values(state.workshops)
  return workshops.find((w) => w.stage === stage)
}

function findIdleAgentForTask(
  state: GameState,
  task: Task
): Agent | undefined {
  const agents = Object.values(state.agents).filter(
    (a) => a.status === 'idle' && a.fatigue < 7
  )

  if (agents.length === 0) return undefined

  // Score each agent for the task stage
  const scored = agents.map((a) => ({
    agent: a,
    score: scoreAgentForStage(a, task.stage),
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.agent
}

function scoreAgentForStage(agent: Agent, stage: Task['stage']): number {
  switch (stage) {
    case 'planning':
      return agent.planning * 2 + agent.creativity - agent.fatigue
    case 'engineering':
      return agent.coding * 2 + agent.speed - agent.fatigue
    case 'validation':
      return agent.validation * 2 + agent.reliability - agent.fatigue
    case 'audit':
      return agent.auditing * 2 + agent.reliability - agent.fatigue
    case 'delivery':
      return agent.reliability * 2 + agent.speed - agent.fatigue
  }
}
