import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { applyPlayerAction } from '../../src/game/actions'
import type { GameState } from '../../src/sim/types'

function makeState(seed = 42): GameState {
  return createInitialState(seed)
}

describe('Workshop Upgrade', () => {
  it('deducts cash on upgrade', () => {
    const state = makeState()
    const ws = state.workshops['workshop-delivery']
    const cashBefore = state.cash
    const cost = ws.upgradeCost

    const next = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-delivery',
      upgradeId: 'level',
      tick: state.tick,
    })

    expect(next.cash).toBe(cashBefore - cost)
  })

  it('increases workshop level', () => {
    const state = makeState()
    const ws = state.workshops['workshop-engineering']
    const levelBefore = ws.level

    const next = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-engineering',
      upgradeId: 'level',
      tick: state.tick,
    })

    expect(next.workshops['workshop-engineering'].level).toBe(levelBefore + 1)
  })

  it('increases capacity on upgrade', () => {
    const state = makeState()
    const ws = state.workshops['workshop-planning']
    const capBefore = ws.capacity

    const next = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-planning',
      upgradeId: 'level',
      tick: state.tick,
    })

    expect(next.workshops['workshop-planning'].capacity).toBe(capBefore + 1)
  })

  it('increases efficiency on upgrade', () => {
    const state = makeState()
    const ws = state.workshops['workshop-validation']
    const effBefore = ws.efficiencyBonus

    const next = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-validation',
      upgradeId: 'level',
      tick: state.tick,
    })

    expect(next.workshops['workshop-validation'].efficiencyBonus).toBeGreaterThan(effBefore)
  })

  it('cannot upgrade without enough cash', () => {
    const state = makeState()
    // Set cash very low
    const poorState: GameState = { ...state, cash: 10 }

    const next = applyPlayerAction(poorState, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-engineering',
      upgradeId: 'level',
      tick: state.tick,
    })

    // Should return same state (no change)
    expect(next.cash).toBe(10)
    expect(next.workshops['workshop-engineering'].level).toBe(1)
  })

  it('cannot upgrade past max level (5)', () => {
    const state = makeState()
    // Manually set workshop to max level
    const maxedState: GameState = {
      ...state,
      workshops: {
        ...state.workshops,
        'workshop-engineering': {
          ...state.workshops['workshop-engineering'],
          level: 5,
        },
      },
    }

    const next = applyPlayerAction(maxedState, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-engineering',
      upgradeId: 'level',
      tick: state.tick,
    })

    expect(next.workshops['workshop-engineering'].level).toBe(5)
  })

  it('records ledger event on upgrade', () => {
    const state = makeState()
    const ledgerLenBefore = state.ledger.length

    const next = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-audit',
      upgradeId: 'level',
      tick: state.tick,
    })

    expect(next.ledger.length).toBe(ledgerLenBefore + 1)
    const event = next.ledger[next.ledger.length - 1]
    expect(event.eventType).toBe('WORKSHOP_UPGRADED')
    expect(event.targetId).toBe('workshop-audit')
    expect(event.details.newLevel).toBe(2)
    expect(event.details.cost).toBe(state.workshops['workshop-audit'].upgradeCost)
  })

  it('first-order completion enables at least one upgrade', () => {
    // Starting cash is 80000, cheapest upgrade is Delivery ($500) or Planning ($800)
    // So player can upgrade immediately from starting cash alone
    const state = makeState()
    expect(state.cash).toBeGreaterThan(state.workshops['workshop-delivery'].upgradeCost)
    expect(state.cash).toBeGreaterThan(state.workshops['workshop-planning'].upgradeCost)
  })

  it('upgrade cost increases after each level', () => {
    const state = makeState()
    const cost1 = state.workshops['workshop-engineering'].upgradeCost

    const after1 = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-engineering',
      upgradeId: 'level',
      tick: state.tick,
    })
    const cost2 = after1.workshops['workshop-engineering'].upgradeCost

    expect(cost2).toBeGreaterThan(cost1)
    expect(cost2).toBe(Math.round(cost1 * 1.5))
  })

  it('maintenance cost increases after upgrade', () => {
    const state = makeState()
    const maint1 = state.workshops['workshop-engineering'].maintenanceCost

    const next = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-engineering',
      upgradeId: 'level',
      tick: state.tick,
    })

    expect(next.workshops['workshop-engineering'].maintenanceCost).toBeGreaterThan(maint1)
  })

  it('cannot upgrade non-existent workshop', () => {
    const state = makeState()
    const next = applyPlayerAction(state, {
      type: 'UPGRADE_WORKSHOP',
      workshopId: 'workshop-nonexistent',
      upgradeId: 'level',
      tick: state.tick,
    })

    // Should return same state
    expect(next).toEqual(state)
  })
})
