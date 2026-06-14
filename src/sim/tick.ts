import type { GameState } from './types'
import { generateOrdersIfNeeded } from './orderGenerator'
import {
  processPlanningWorkshop,
  processEngineeringWorkshop,
  processValidationWorkshop,
  processAuditWorkshop,
  processDeliveryWorkshop,
} from './workshops'
import { autoScheduleTasks } from './scheduler'
import { updateFatigue } from './agents'
import { applyEconomy, checkGameOver } from './economy'
import { computeMetrics } from './scoring'
import { hashGameState } from './hash'

/**
 * Advance the simulation by one tick.
 * Pure function: input GameState → output GameState.
 * No network, no Date.now(), no Math.random().
 */
export function advanceTick(state: GameState): GameState {
  if (state.gameOver) return state

  let next = structuredClone(state)

  next.tick += 1

  // 1. Generate new orders if needed
  next = generateOrdersIfNeeded(next)

  // 2. Auto-schedule queued tasks to idle agents
  next = autoScheduleTasks(next)

  // 3. Process each workshop
  next = processPlanningWorkshop(next)
  next = processEngineeringWorkshop(next)
  next = processValidationWorkshop(next)
  next = processAuditWorkshop(next)
  next = processDeliveryWorkshop(next)

  // 4. Apply economy (salaries, maintenance)
  next = applyEconomy(next)

  // 5. Update agent fatigue
  next.agents = updateFatigue(next.agents)

  // 6. Compute metrics
  next.metrics = computeMetrics(next)

  // 7. Append state hash to ledger
  const stateHash = hashGameState(next)
  if (next.ledger.length > 0) {
    next.ledger[next.ledger.length - 1] = {
      ...next.ledger[next.ledger.length - 1],
      stateHash,
    }
  }

  // 8. Check game over
  next = checkGameOver(next)

  return next
}

/**
 * Advance multiple ticks at once.
 */
export function advanceTicks(state: GameState, count: number): GameState {
  let next = state
  for (let i = 0; i < count; i++) {
    next = advanceTick(next)
    if (next.gameOver) break
  }
  return next
}
