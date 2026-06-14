import type { GameState } from './types'
import { starterAgents } from '../data/starterAgents'
import { starterWorkshops } from '../data/starterWorkshops'
import { starterOrders } from '../data/starterOrders'
import {
  STARTING_CASH,
  STARTING_REPUTATION,
  STARTING_EVIDENCE_INTEGRITY,
} from './constants'

export function createInitialState(seed: number): GameState {
  const agents: GameState['agents'] = {}
  for (const a of starterAgents) {
    agents[a.id] = { ...a }
  }

  const workshops: GameState['workshops'] = {}
  for (const w of starterWorkshops) {
    workshops[w.id] = { ...w }
  }

  const orders: GameState['orders'] = {}
  for (const o of starterOrders) {
    orders[o.id] = { ...o }
  }

  return {
    seed,
    tick: 0,

    cash: STARTING_CASH,
    reputation: STARTING_REPUTATION,
    evidenceIntegrity: STARTING_EVIDENCE_INTEGRITY,

    orders,
    tasks: {},
    agents,
    workshops,
    artifacts: {},

    ledger: [],
    playerActions: [],

    metrics: {
      totalOrdersCompleted: 0,
      totalOrdersFailed: 0,
      totalRevenue: 0,
      totalCost: 0,
      averageQuality: 0,
      reworkRate: 0,
      evidenceIntegrity: STARTING_EVIDENCE_INTEGRITY,
      majorIncidents: 0,
      ordersInProgress: 0,
      agentUtilization: 0,
    },

    gameOver: false,
    gameOverReason: null,
  }
}
