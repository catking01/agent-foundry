import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../src/sim/createInitialState'
import { advanceTicks } from '../../src/sim/tick'
import { applyPlayerAction } from '../../src/game/actions'
import { hashGameState } from '../../src/sim/hash'
import { replayGame, createSaveFile, verifyReplay, exportSaveFile, importSaveFile } from '../../src/sim/replay'
import type { PlayerAction } from '../../src/sim/types'

describe('Replay System', () => {
  it('same seed + same actions = same final state hash', () => {
    const seed = 42

    // Create a run with some actions
    const state1 = createInitialState(seed)
    const order = Object.values(state1.orders).find((o) => o.status === 'available')

    const actions: PlayerAction[] = [
      { type: 'ACCEPT_ORDER', orderId: order!.id, tick: 0 },
    ]

    // Run the game
    const run1 = replayGame(seed, actions)
    const run2 = replayGame(seed, actions)

    const hash1 = hashGameState(run1)
    const hash2 = hashGameState(run2)

    expect(hash1).toBe(hash2)
  })

  it('modifying an action changes the final state hash', () => {
    const seed = 42
    const orderId = Object.values(createInitialState(seed).orders).find(
      (o) => o.status === 'available'
    )!.id

    // Run 1: accept order at tick 0
    const actions1: PlayerAction[] = [
      { type: 'ACCEPT_ORDER', orderId, tick: 0 },
    ]
    const run1 = replayGame(seed, actions1)

    // Run 2: accept same order but at tick 5
    const actions2: PlayerAction[] = [
      { type: 'ACCEPT_ORDER', orderId, tick: 5 },
    ]
    const run2 = replayGame(seed, actions2)

    const hash1 = hashGameState(run1)
    const hash2 = hashGameState(run2)

    // Different timing = different state progression = different hash
    expect(hash1).not.toBe(hash2)
  })

  it('deleting an action changes the final state hash', () => {
    const seed = 42
    const orderId = Object.values(createInitialState(seed).orders).find(
      (o) => o.status === 'available'
    )!.id

    const fullActions: PlayerAction[] = [
      { type: 'ACCEPT_ORDER', orderId, tick: 0 },
    ]
    const emptyActions: PlayerAction[] = []

    const runFull = replayGame(seed, fullActions)
    const runEmpty = replayGame(seed, emptyActions)

    const hashFull = hashGameState(runFull)
    const hashEmpty = hashGameState(runEmpty)

    expect(hashFull).not.toBe(hashEmpty)
  })

  it('illegal action does not crash replay', () => {
    const seed = 42
    // Try to accept a non-existent order
    const actions: PlayerAction[] = [
      { type: 'ACCEPT_ORDER', orderId: 'non-existent-order', tick: 0 },
    ]

    const run = replayGame(seed, actions)
    // Should still produce a valid state
    expect(run.tick).toBeGreaterThanOrEqual(0)
    expect(run).toBeDefined()
  })

  it('export and import save file', () => {
    const state = createInitialState(42)
    const order = Object.values(state.orders).find((o) => o.status === 'available')

    const next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    // Export
    const json = exportSaveFile(next)
    expect(json).toBeDefined()
    expect(typeof json).toBe('string')

    // Import
    const save = importSaveFile(json)
    expect(save).not.toBeNull()
    expect(save!.seed).toBe(42)
    expect(save!.version).toBe('0.1.0')
    expect(save!.playerActions.length).toBe(1)
  })

  it('save file verification works', () => {
    const seed = 42
    const state = createInitialState(seed)
    const order = Object.values(state.orders).find((o) => o.status === 'available')

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    // Advance some ticks
    next = advanceTicks(next, 3)

    const save = createSaveFile(next)
    expect(save.finalStateHash).toBeDefined()
    expect(save.finalTick).toBeGreaterThan(0)

    const { hashMatches } = verifyReplay(save)
    expect(hashMatches).toBe(true)
  })

  it('tampered save file fails verification', () => {
    const seed = 42
    const state = createInitialState(seed)
    const order = Object.values(state.orders).find((o) => o.status === 'available')

    let next = applyPlayerAction(state, {
      type: 'ACCEPT_ORDER',
      orderId: order!.id,
      tick: state.tick,
    })

    next = advanceTicks(next, 3)
    const save = createSaveFile(next)
    const originalHash = save.finalStateHash

    // Tamper with the save
    const tampered = { ...save, finalStateHash: '00000000' }
    expect(tampered.finalStateHash).not.toBe(originalHash)

    const { hashMatches } = verifyReplay(tampered)
    expect(hashMatches).toBe(false)
  })
})
