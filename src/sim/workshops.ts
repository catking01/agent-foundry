import type { GameState, Agent, Task, Artifact } from './types'
import { computeWorkOutput } from './agents'
import { generateArtifact, chooseWinningArtifact, scoreArtifact } from './artifacts'
import { runValidation } from './validation'
import { runAudit } from './audit'
import {
  processDeliveryEconomics,
  applyReputationPenalty,
} from './economy'
import {
  PARALLEL_ROUTE_COST_PER_ROUTE,
  COMPLEXITY_WORK_MULTIPLIER,
  PLANNING_WORK_MULTIPLIER,
  VALIDATION_WORK,
  AUDIT_WORK,
  DELIVERY_WORK,
} from './constants'

// ============================================================
// Shared helpers
// ============================================================

function makeTask(
  id: string,
  orderId: string,
  parentTaskId: string | null,
  stage: Task['stage'],
  routeId: string | null,
  artifactId: string | null,
  complexity: number,
  ambiguity: number,
  remainingWork: number,
  qualityTarget: number,
  risk: number,
  tick: number,
): Task {
  return {
    id,
    orderId,
    parentTaskId,
    stage,
    status: 'queued',
    assignedAgentIds: [],
    routeId,
    artifactId,
    complexity,
    ambiguity,
    remainingWork,
    qualityTarget,
    risk,
    createdAtTick: tick,
    completedAtTick: null,
  }
}

/**
 * Try to release an agent who is stuck on a task that can never finish
 * (e.g. artifact missing). Fails the task so the agent returns to idle.
 */
function failTaskAndReleaseAgent(
  next: GameState,
  task: Task,
  agentId: string,
  reason: string,
): void {
  task.status = 'failed'
  task.completedAtTick = next.tick
  next.agents[agentId] = {
    ...next.agents[agentId],
    status: 'idle' as const,
    currentTaskId: null,
  }
  next.ledger.push({
    tick: next.tick,
    eventType: 'TASK_FAILED',
    actorId: agentId,
    targetId: task.id,
    details: { reason, stage: task.stage, orderId: task.orderId },
    stateHash: '',
  })
}

// ============================================================
// Planning Workshop
// ============================================================

export function processPlanningWorkshop(state: GameState): GameState {
  const next = { ...state, tasks: { ...state.tasks }, agents: { ...state.agents } }
  const ws = next.workshops['workshop-planning']
  if (!ws) return next

  const planningTasks = Object.values(next.tasks).filter(
    (t) => t.stage === 'planning' && t.status === 'in_progress'
  )

  for (const task of planningTasks) {
    for (const agentId of task.assignedAgentIds) {
      const agent = next.agents[agentId]
      if (!agent || agent.status !== 'working') continue

      const output = computeWorkOutput(agent, task, ws.efficiencyBonus)
      task.remainingWork -= output

      if (task.remainingWork <= 0) {
        task.remainingWork = 0
        task.status = 'completed'
        task.completedAtTick = next.tick

        // Generate plan artifact
        const artifact = generateArtifact(next.seed, next.tick, agent, task)
        next.artifacts = { ...next.artifacts, [artifact.id]: artifact }

        // Mark agent idle
        next.agents[agentId] = {
          ...agent,
          status: 'idle',
          currentTaskId: null,
        }

        // Create engineering task — carries NO artifactId (none exists yet)
        const engTask = makeTask(
          `${task.id}-eng-${next.tick}`,
          task.orderId,
          task.id,
          'engineering',
          task.routeId,
          null, // engineering creates its own artifact
          task.complexity,
          task.ambiguity,
          task.complexity * COMPLEXITY_WORK_MULTIPLIER,
          task.qualityTarget,
          task.risk,
          next.tick,
        )
        next.tasks[engTask.id] = engTask

        next.ledger.push({
          tick: next.tick,
          eventType: 'PLANNING_COMPLETED',
          actorId: agentId,
          targetId: task.id,
          details: { artifactId: artifact.id, quality: artifact.quality },
          stateHash: '',
        })
      }
    }
  }

  return next
}

// ============================================================
// Engineering Workshop
// ============================================================

export function processEngineeringWorkshop(state: GameState): GameState {
  const next = {
    ...state,
    tasks: { ...state.tasks },
    agents: { ...state.agents },
    artifacts: { ...state.artifacts },
    orders: { ...state.orders },
  }
  const ws = next.workshops['workshop-engineering']
  if (!ws) return next

  const engTasks = Object.values(next.tasks).filter(
    (t) => t.stage === 'engineering' && t.status === 'in_progress'
  )

  for (const task of engTasks) {
    for (const agentId of task.assignedAgentIds) {
      const agent = next.agents[agentId]
      if (!agent || agent.status !== 'working') continue

      const output = computeWorkOutput(agent, task, ws.efficiencyBonus)
      task.remainingWork -= output

      if (task.remainingWork <= 0) {
        task.remainingWork = 0
        task.status = 'completed'
        task.completedAtTick = next.tick

        // Transition order from 'accepted' → 'in_progress' if needed
        const order = next.orders[task.orderId]
        if (order && order.status === 'accepted') {
          next.orders[task.orderId] = { ...order, status: 'in_progress' }
        }

        // Generate artifact — taskId points to THIS engineering task
        const artifact = generateArtifact(next.seed, next.tick, agent, task)
        next.artifacts[artifact.id] = artifact

        // Mark agent idle
        next.agents[agentId] = {
          ...agent,
          status: 'idle',
          currentTaskId: null,
        }

        // Create validation task — carries the artifactId for handoff
        const valTask = makeTask(
          `${task.id}-val-${next.tick}`,
          task.orderId,
          task.id,
          'validation',
          task.routeId,
          artifact.id,   // ← KEY FIX: pass artifactId through
          task.complexity,
          task.ambiguity,
          VALIDATION_WORK,
          task.qualityTarget,
          task.risk,
          next.tick,
        )
        next.tasks[valTask.id] = valTask

        next.ledger.push({
          tick: next.tick,
          eventType: 'ENGINEERING_COMPLETED',
          actorId: agentId,
          targetId: task.id,
          details: {
            artifactId: artifact.id,
            quality: artifact.quality,
            routeId: task.routeId,
          },
          stateHash: '',
        })
      }
    }
  }

  return next
}

// ============================================================
// Validation Workshop
// ============================================================

export function processValidationWorkshop(state: GameState): GameState {
  const next = {
    ...state,
    tasks: { ...state.tasks },
    agents: { ...state.agents },
    artifacts: { ...state.artifacts },
  }
  const ws = next.workshops['workshop-validation']
  if (!ws) return next

  const valTasks = Object.values(next.tasks).filter(
    (t) => t.stage === 'validation' && t.status === 'in_progress'
  )

  for (const task of valTasks) {
    for (const agentId of task.assignedAgentIds) {
      const agent = next.agents[agentId]
      if (!agent || agent.status !== 'working') continue

      const output = computeWorkOutput(agent, task, ws.efficiencyBonus)
      task.remainingWork -= output

      if (task.remainingWork <= 0) {
        task.remainingWork = 0
        task.status = 'completed'
        task.completedAtTick = next.tick

        // Look up artifact by task.artifactId (direct link)
        const artifact = task.artifactId ? next.artifacts[task.artifactId] : null
        if (!artifact) {
          failTaskAndReleaseAgent(next, task, agentId, 'Artifact missing for validation')
          continue
        }

        const result = runValidation(next.seed, next.tick, artifact, agent)
        const updatedArtifact: Artifact = {
          ...artifact,
          validationPassed: result.passed,
          validationScore: result.score,
        }
        next.artifacts[artifact.id] = updatedArtifact

        // Mark agent idle
        next.agents[agentId] = {
          ...agent,
          status: 'idle',
          currentTaskId: null,
        }

        // Create audit task — carries same artifactId
        const auditTask = makeTask(
          `${task.id}-audit-${next.tick}`,
          task.orderId,
          task.id,
          'audit',
          task.routeId,
          artifact.id,   // ← KEY FIX: pass artifactId through
          task.complexity,
          task.ambiguity,
          AUDIT_WORK,
          task.qualityTarget,
          task.risk,
          next.tick,
        )
        next.tasks[auditTask.id] = auditTask

        next.ledger.push({
          tick: next.tick,
          eventType: 'VALIDATION_COMPLETED',
          actorId: agentId,
          targetId: artifact.id,
          details: {
            passed: result.passed,
            score: result.score,
            reason: result.reason,
          },
          stateHash: '',
        })
      }
    }
  }

  return next
}

// ============================================================
// Audit Workshop
// ============================================================

export function processAuditWorkshop(state: GameState): GameState {
  const next = {
    ...state,
    tasks: { ...state.tasks },
    agents: { ...state.agents },
    artifacts: { ...state.artifacts },
  }
  const ws = next.workshops['workshop-audit']
  if (!ws) return next

  const auditTasks = Object.values(next.tasks).filter(
    (t) => t.stage === 'audit' && t.status === 'in_progress'
  )

  for (const task of auditTasks) {
    for (const agentId of task.assignedAgentIds) {
      const agent = next.agents[agentId]
      if (!agent || agent.status !== 'working') continue

      const output = computeWorkOutput(agent, task, ws.efficiencyBonus)
      task.remainingWork -= output

      if (task.remainingWork <= 0) {
        task.remainingWork = 0
        task.status = 'completed'
        task.completedAtTick = next.tick

        // Look up artifact by task.artifactId (direct link)
        const artifact = task.artifactId ? next.artifacts[task.artifactId] : null
        if (!artifact) {
          failTaskAndReleaseAgent(next, task, agentId, 'Artifact missing for audit')
          continue
        }

        // Check for hidden failures (other routes for same order)
        const orderArtifacts = Object.values(next.artifacts).filter(
          (a) => a.orderId === task.orderId && a.id !== artifact.id
        )
        const hasHiddenFailures = orderArtifacts.some(
          (a) => a.validationPassed === false || a.quality < 5
        )

        const result = runAudit(
          next.seed,
          next.tick,
          artifact,
          agent,
          hasHiddenFailures
        )

        const updatedArtifact: Artifact = {
          ...artifact,
          auditPassed: result.passed,
          auditResult: result,
        }
        next.artifacts[artifact.id] = updatedArtifact

        // Mark agent idle
        next.agents[agentId] = {
          ...agent,
          status: 'idle',
          currentTaskId: null,
        }

        // Create delivery task — carries same artifactId
        const deliveryTask = makeTask(
          `${task.id}-delivery-${next.tick}`,
          task.orderId,
          task.id,
          'delivery',
          task.routeId,
          artifact.id,   // ← KEY FIX: pass artifactId through
          task.complexity,
          task.ambiguity,
          DELIVERY_WORK,
          task.qualityTarget,
          task.risk,
          next.tick,
        )
        next.tasks[deliveryTask.id] = deliveryTask

        // Apply reputation penalties for audit findings
        if (result.overclaimDetected) {
          const afterPenalty = applyReputationPenalty(next, 'overclaim')
          next.reputation = afterPenalty.reputation
          next.evidenceIntegrity = afterPenalty.evidenceIntegrity
          next.metrics = afterPenalty.metrics
        }
        if (result.evidenceGapDetected) {
          const afterPenalty = applyReputationPenalty(next, 'evidence_gap')
          next.reputation = afterPenalty.reputation
          next.evidenceIntegrity = afterPenalty.evidenceIntegrity
        }
        if (result.hiddenFailureDetected) {
          const afterPenalty = applyReputationPenalty(next, 'hidden_failure')
          next.reputation = afterPenalty.reputation
          next.evidenceIntegrity = afterPenalty.evidenceIntegrity
        }

        next.ledger.push({
          tick: next.tick,
          eventType: 'AUDIT_COMPLETED',
          actorId: agentId,
          targetId: artifact.id,
          details: {
            passed: result.passed,
            riskLevel: result.riskLevel,
            reason: result.reason,
          },
          stateHash: '',
        })
      }
    }
  }

  return next
}

// ============================================================
// Delivery Workshop
// ============================================================

export function processDeliveryWorkshop(state: GameState): GameState {
  const next = {
    ...state,
    tasks: { ...state.tasks },
    agents: { ...state.agents },
    orders: { ...state.orders },
  }
  const ws = next.workshops['workshop-delivery']
  if (!ws) return next

  const deliveryTasks = Object.values(next.tasks).filter(
    (t) => t.stage === 'delivery' && t.status === 'in_progress'
  )

  for (const task of deliveryTasks) {
    for (const agentId of task.assignedAgentIds) {
      const agent = next.agents[agentId]
      if (!agent || agent.status !== 'working') continue

      const output = computeWorkOutput(agent, task, ws.efficiencyBonus)
      task.remainingWork -= output

      if (task.remainingWork <= 0) {
        task.remainingWork = 0
        task.status = 'completed'
        task.completedAtTick = next.tick

        // Mark agent idle
        next.agents[agentId] = {
          ...agent,
          status: 'idle',
          currentTaskId: null,
        }

        // Deliver the order — use selectDeliverableArtifact for proper judge integration
        const order = next.orders[task.orderId]
        if (order && order.status === 'in_progress') {
          const deliverable = selectDeliverableArtifact(next, task.orderId)
          const artifact = deliverable ?? (task.artifactId ? next.artifacts[task.artifactId] : null)
          const quality = artifact?.quality ?? 5
          const auditPassed = artifact?.auditPassed ?? false
          const onTime = next.tick <= order.deadlineTick

          order.status = 'delivered'

          // Apply delivery economics
          const afterEcon = processDeliveryEconomics(
            next,
            order.id,
            quality,
            onTime,
            auditPassed
          )
          next.cash = afterEcon.cash
          next.reputation = afterEcon.reputation
          next.metrics = afterEcon.metrics

          next.ledger.push({
            tick: next.tick,
            eventType: 'ORDER_DELIVERED',
            actorId: agentId,
            targetId: order.id,
            details: {
              artifactId: artifact?.id ?? null,
              quality,
              onTime,
              auditPassed,
              reward: order.reward,
            },
            stateHash: '',
          })
        }
      }
    }
  }

  return next
}

// ============================================================
// Shared: select best deliverable artifact
// ============================================================

/**
 * Select the best artifact for delivery.
 *
 * If the order has route artifacts (parallel routes), uses
 * scoreArtifact (quality + evidence - defects - overclaim) to
 * pick the winner. Otherwise, returns the best by scoreArtifact
 * among all order artifacts. Losers remain archived.
 */
export function selectDeliverableArtifact(
  state: GameState,
  orderId: string,
): Artifact | null {
  const candidates = Object.values(state.artifacts).filter(
    (a) => a.orderId === orderId
  )

  if (candidates.length === 0) return null

  // If there are route artifacts, judge among them
  const routeArtifacts = candidates.filter((a) => a.routeId !== null)
  if (routeArtifacts.length > 0) {
    return chooseWinningArtifact(routeArtifacts)
  }

  // Otherwise pick best by scoreArtifact
  return chooseWinningArtifact(candidates)
}

// ============================================================
// Parallel Route Handling
// ============================================================

/**
 * Start parallel routes for an order.
 *
 * Creates route-specific engineering tasks directly (skip planning
 * for routes — planning is conceptual at the order level).
 * This avoids creating a redundant single-route engineering task.
 */
export function startParallelRoutes(
  state: GameState,
  orderId: string,
  routeCount: number,
): GameState {
  const order = state.orders[orderId]
  if (!order || order.status !== 'accepted') return state

  const next = {
    ...state,
    tasks: { ...state.tasks },
    orders: { ...state.orders },
  }

  // Cost for parallel routes
  const routeCost = PARALLEL_ROUTE_COST_PER_ROUTE * routeCount
  next.cash -= routeCost

  // Update order status
  next.orders[orderId] = { ...order, status: 'in_progress' }

  // Cancel the planning task created by ACCEPT_ORDER (if any).
  // Parallel routes skip planning — each route starts at engineering directly.
  for (const [taskId, task] of Object.entries(next.tasks)) {
    if (task.orderId === orderId && task.stage === 'planning' && task.status === 'queued') {
      next.tasks[taskId] = { ...task, status: 'failed', completedAtTick: next.tick }
    }
  }

  // Create route-specific engineering tasks directly.
  // Each route is a competing attempt at the order.
  for (let i = 0; i < routeCount; i++) {
    const routeId = `${orderId}-route-${i + 1}`
    const task = makeTask(
      `${orderId}-eng-route-${i + 1}`,
      orderId,
      null,           // no parent planning task
      'engineering',
      routeId,
      null,           // artifact created during engineering
      order.complexity,
      order.ambiguity,
      order.complexity * COMPLEXITY_WORK_MULTIPLIER,
      7,
      order.risk,
      next.tick,
    )
    next.tasks[task.id] = task
  }

  next.ledger.push({
    tick: next.tick,
    eventType: 'PARALLEL_ROUTES_STARTED',
    actorId: 'player',
    targetId: orderId,
    details: { routeCount, cost: routeCost },
    stateHash: '',
  })

  return next
}

/**
 * Judge parallel route artifacts and select winner.
 */
export function judgeParallelRoutes(
  state: GameState,
  orderId: string,
): { winner: Artifact | null; losers: Artifact[] } {
  const routeArtifacts = Object.values(state.artifacts).filter(
    (a) => a.orderId === orderId && a.routeId !== null
  )

  const winner = chooseWinningArtifact(routeArtifacts)
  const losers = routeArtifacts.filter((a) => a.id !== winner?.id)

  return { winner, losers }
}
