import type { GameState, PlayerAction, SaveFile } from './types'
import { createInitialState } from './createInitialState'
import { advanceTick } from './tick'
import { hashGameState } from './hash'
import { applyPlayerAction } from '../game/actions'
import { GAME_VERSION } from './constants'

/**
 * Replay a game from seed and player actions.
 * Returns the final game state.
 */
export function replayGame(seed: number, actions: PlayerAction[]): GameState {
  let state = createInitialState(seed)

  for (const action of actions) {
    // Advance ticks until we reach the action's tick
    while (state.tick < action.tick) {
      state = advanceTick(state)
      if (state.gameOver) return state
    }

    // Apply the player action
    state = applyPlayerAction(state, action)
  }

  return state
}

/**
 * Create a save file from the current game state.
 */
export function createSaveFile(state: GameState): SaveFile {
  const finalHash = hashGameState(state)

  return {
    version: GAME_VERSION,
    seed: state.seed,
    playerActions: state.playerActions,
    finalStateHash: finalHash,
    finalTick: state.tick,
    metrics: state.metrics,
  }
}

/**
 * Verify that a save file replays correctly.
 * Returns the replayed state and whether the hash matches.
 */
export function verifyReplay(save: SaveFile): {
  replayedState: GameState
  hashMatches: boolean
} {
  let state = replayGame(save.seed, [...save.playerActions])

  // Advance any remaining ticks — chain properly like advanceTicks does
  while (state.tick < save.finalTick) {
    state = advanceTick(state)
    if (state.gameOver) break
  }

  const replayedHash = hashGameState(state)
  const hashMatches = replayedHash === save.finalStateHash

  return { replayedState: state, hashMatches }
}

/**
 * Export save file as JSON string.
 */
export function exportSaveFile(state: GameState): string {
  const save = createSaveFile(state)
  return JSON.stringify(save, null, 2)
}

/**
 * Import save file from JSON string.
 */
export function importSaveFile(json: string): SaveFile | null {
  try {
    const data = JSON.parse(json)
    if (
      typeof data.version === 'string' &&
      typeof data.seed === 'number' &&
      Array.isArray(data.playerActions)
    ) {
      return data as SaveFile
    }
    return null
  } catch {
    return null
  }
}
