import type { GameState, Order } from './types'
import { orderTemplates } from '../data/scenarios'
import { tickRng, randElement, randInt, clamp } from './rng'
import { MAX_AVAILABLE_ORDERS, ORDER_GENERATION_INTERVAL } from './constants'

/**
 * Deterministic order ID based on seed and tick.
 * No module-level mutable counter — required for replay determinism.
 */
function nextOrderId(seed: number, tick: number, index: number): string {
  const rng = tickRng(seed, tick + 9001 + index * 7)
  const suffix = Math.floor(rng() * 100000).toString(16).padStart(5, '0')
  return `order-gen-${tick}-${index}-${suffix}`
}

export function generateOrdersIfNeeded(state: GameState): GameState {
  // Only generate on interval ticks
  if (state.tick % ORDER_GENERATION_INTERVAL !== 0) return state

  const availableCount = Object.values(state.orders).filter(
    (o) => o.status === 'available'
  ).length

  if (availableCount >= MAX_AVAILABLE_ORDERS) return state

  const rng = tickRng(state.seed, state.tick + 7001)

  // Generate 1-2 new orders
  const toGenerate = randInt(rng, 1, Math.min(2, MAX_AVAILABLE_ORDERS - availableCount))
  const next = { ...state, orders: { ...state.orders } }

  for (let i = 0; i < toGenerate; i++) {
    const template = randElement(rng, orderTemplates)
    const id = nextOrderId(state.seed, state.tick, i)

    // Scale difficulty based on game progression
    const progressionScale = 1 + state.tick * 0.02
    const complexity = clamp(
      Math.round(template.complexity * progressionScale * (0.8 + rng() * 0.4)),
      1,
      10
    )
    const ambiguity = clamp(
      Math.round(template.ambiguity * progressionScale * (0.8 + rng() * 0.4)),
      1,
      10
    )
    const risk = clamp(
      Math.round(template.risk * progressionScale * (0.8 + rng() * 0.4)),
      1,
      10
    )

    const deadlineTicks = 8 + complexity * 2 + randInt(rng, -2, 4)
    const reward = Math.round(
      (300 + complexity * 200 + ambiguity * 100) * (0.9 + rng() * 0.2)
    )
    const penalty = Math.round(reward * 0.25)

    const order: Order = {
      id,
      title: template.title,
      domain: template.domain,
      complexity,
      ambiguity,
      risk,
      deadlineTick: state.tick + deadlineTicks,
      reward,
      penalty,
      acceptanceCriteria: [...template.acceptanceCriteria],
      status: 'available',
      acceptedAtTick: null,
    }

    next.orders[id] = order
  }

  return next
}
