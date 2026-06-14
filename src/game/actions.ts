import type { GameState, PlayerAction } from '../sim/types'
import { startParallelRoutes, selectDeliverableArtifact } from '../sim/workshops'
import { runValidation } from '../sim/validation'
import { runAudit } from '../sim/audit'

/**
 * Apply a player action to the game state.
 */
export function applyPlayerAction(
  state: GameState,
  action: PlayerAction
): GameState {
  const next = {
    ...state,
    playerActions: [...state.playerActions, action],
  }

  switch (action.type) {
    case 'ACCEPT_ORDER': {
      const order = next.orders[action.orderId]
      if (!order || order.status !== 'available') return state

      next.orders = {
        ...next.orders,
        [action.orderId]: {
          ...order,
          status: 'accepted',
          acceptedAtTick: next.tick,
        },
      }

      next.ledger.push({
        tick: next.tick,
        eventType: 'ORDER_ACCEPTED',
        actorId: 'player',
        targetId: action.orderId,
        details: { reward: order.reward, complexity: order.complexity },
        stateHash: '',
      })

      // Create initial planning task
      const taskId = `${action.orderId}-planning`
      next.tasks = {
        ...next.tasks,
        [taskId]: {
          id: taskId,
          orderId: action.orderId,
          parentTaskId: null,
          stage: 'planning',
          status: 'queued',
          assignedAgentIds: [],
          routeId: null,
          artifactId: null,
          complexity: order.complexity,
          ambiguity: order.ambiguity,
          remainingWork: order.complexity * 50,
          qualityTarget: 7,
          risk: order.risk,
          createdAtTick: next.tick,
          completedAtTick: null,
        },
      }
      break
    }

    case 'ASSIGN_AGENT': {
      const task = next.tasks[action.taskId]
      const agent = next.agents[action.agentId]
      if (!task || !agent) return state

      // Don't reassign if already working
      if (agent.status === 'working' || agent.fatigue >= 7) return state

      // Don't assign to completed tasks
      if (task.status === 'completed' || task.status === 'failed') return state

      // Update task to in_progress if queued
      const taskStatus = task.status === 'queued' ? 'in_progress' : task.status

      next.tasks = {
        ...next.tasks,
        [action.taskId]: {
          ...task,
          status: taskStatus as typeof task.status,
          assignedAgentIds: [
            ...task.assignedAgentIds.filter((id) => id !== agent.id),
            agent.id,
          ],
        },
      }

      next.agents = {
        ...next.agents,
        [action.agentId]: {
          ...agent,
          status: 'working',
          currentTaskId: action.taskId,
        },
      }

      next.ledger.push({
        tick: next.tick,
        eventType: 'AGENT_MANUALLY_ASSIGNED',
        actorId: 'player',
        targetId: action.taskId,
        details: {
          agentId: agent.id,
          workshopId: action.workshopId,
          stage: task.stage,
        },
        stateHash: '',
      })
      break
    }

    case 'START_PARALLEL_ROUTES': {
      return startParallelRoutes(next, action.orderId, action.routeCount)
    }

    case 'UPGRADE_WORKSHOP': {
      const ws = next.workshops[action.workshopId]
      if (!ws || next.cash < ws.upgradeCost) return state

      next.cash -= ws.upgradeCost
      next.workshops = {
        ...next.workshops,
        [action.workshopId]: {
          ...ws,
          level: ws.level + 1,
          efficiencyBonus: ws.efficiencyBonus + 0.1,
          capacity: ws.capacity + 1,
          upgradeCost: Math.round(ws.upgradeCost * 1.5),
          maintenanceCost: Math.round(ws.maintenanceCost * 1.2),
        },
      }

      next.ledger.push({
        tick: next.tick,
        eventType: 'WORKSHOP_UPGRADED',
        actorId: 'player',
        targetId: action.workshopId,
        details: { newLevel: ws.level + 1, cost: ws.upgradeCost },
        stateHash: '',
      })
      break
    }

    case 'RUN_VALIDATION': {
      const artifact = next.artifacts[action.artifactId]
      const validator = next.agents[action.validatorAgentId]
      if (!artifact || !validator) return state

      const result = runValidation(
        next.seed,
        next.tick,
        artifact,
        validator
      )

      next.artifacts = {
        ...next.artifacts,
        [action.artifactId]: {
          ...artifact,
          validationPassed: result.passed,
          validationScore: result.score,
        },
      }

      next.ledger.push({
        tick: next.tick,
        eventType: 'MANUAL_VALIDATION_RUN',
        actorId: 'player',
        targetId: action.artifactId,
        details: {
          validatorId: validator.id,
          passed: result.passed,
          score: result.score,
          reason: result.reason,
        },
        stateHash: '',
      })
      break
    }

    case 'RUN_AUDIT': {
      const artifact = next.artifacts[action.artifactId]
      const auditor = next.agents[action.auditorAgentId]
      if (!artifact || !auditor) return state

      // Check for hidden failures (other route artifacts for same order)
      const orderArtifacts = Object.values(next.artifacts).filter(
        (a) => a.orderId === artifact.orderId && a.id !== artifact.id
      )
      const hasHiddenFailures = orderArtifacts.some(
        (a) => a.validationPassed === false || a.quality < 5
      )

      const result = runAudit(next.seed, next.tick, artifact, auditor, hasHiddenFailures)

      next.artifacts = {
        ...next.artifacts,
        [action.artifactId]: {
          ...artifact,
          auditPassed: result.passed,
          auditResult: result,
        },
      }

      next.ledger.push({
        tick: next.tick,
        eventType: 'MANUAL_AUDIT_RUN',
        actorId: 'player',
        targetId: action.artifactId,
        details: {
          auditorId: auditor.id,
          passed: result.passed,
          riskLevel: result.riskLevel,
          reason: result.reason,
        },
        stateHash: '',
      })
      break
    }

    case 'DELIVER_ORDER': {
      const order = next.orders[action.orderId]
      if (!order || order.status !== 'in_progress') return state

      // Use the shared judge: if route artifacts exist, pick by scoreArtifact.
      // Otherwise pick the best by scoreArtifact among all order artifacts.
      const bestArtifact = selectDeliverableArtifact(next, action.orderId)
      const quality = bestArtifact?.quality ?? 5
      const auditPassed = bestArtifact?.auditPassed ?? false
      const onTime = next.tick <= order.deadlineTick

      next.orders = {
        ...next.orders,
        [action.orderId]: {
          ...order,
          status: 'delivered',
        },
      }

      // Apply delivery economics
      const baseReward = order.reward
      const qualityMultiplier = 0.7 + (quality / 10) * 0.6
      const onTimeBonus = onTime ? 1.0 : 0.7
      const penalty = onTime ? 0 : order.penalty
      const actualReward = Math.round(
        baseReward * qualityMultiplier * onTimeBonus - penalty
      )

      next.cash += actualReward
      next.metrics = {
        ...next.metrics,
        totalRevenue: next.metrics.totalRevenue + actualReward,
        totalOrdersCompleted: next.metrics.totalOrdersCompleted + 1,
        averageQuality:
          (next.metrics.averageQuality * next.metrics.totalOrdersCompleted +
            quality) /
          (next.metrics.totalOrdersCompleted + 1),
      }

      // Reputation update
      let repDelta = quality * 0.4
      if (onTime) repDelta += 15
      else repDelta -= 12
      if (auditPassed) repDelta += 10

      next.reputation = Math.max(
        0,
        Math.min(100, next.reputation + repDelta)
      )

      next.ledger.push({
        tick: next.tick,
        eventType: 'ORDER_DELIVERED_MANUAL',
        actorId: 'player',
        targetId: action.orderId,
        details: {
          quality,
          onTime,
          auditPassed,
          actualReward,
          artifactId: bestArtifact?.id ?? null,
        },
        stateHash: '',
      })
      break
    }
  }

  return next
}
