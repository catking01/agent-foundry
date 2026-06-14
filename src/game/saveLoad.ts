import type { GameState } from '../sim/types'
import { createSaveFile, importSaveFile } from '../sim/replay'
import { GAME_VERSION } from '../sim/constants'

const SAVE_KEY = 'agent-foundry-save'

/**
 * Save game state to localStorage.
 */
export function saveToLocalStorage(state: GameState): boolean {
  try {
    const save = createSaveFile(state)
    const json = JSON.stringify(save)
    localStorage.setItem(SAVE_KEY, json)
    return true
  } catch {
    return false
  }
}

/**
 * Load game state from localStorage.
 * Returns null if no save exists or the save is invalid.
 */
export function loadFromLocalStorage(): GameState | null {
  try {
    const json = localStorage.getItem(SAVE_KEY)
    if (!json) return null

    const save = importSaveFile(json)
    if (!save || save.version !== GAME_VERSION) return null

    // We can't fully restore GameState from SaveFile,
    // but we can replay it. This requires the replay function.
    // For now, return null — replay must be triggered explicitly.
    return null
  } catch {
    return null
  }
}

/**
 * Get the raw save file from localStorage.
 */
export function getRawSaveFile(): string | null {
  return localStorage.getItem(SAVE_KEY)
}

/**
 * Check if a save exists.
 */
export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

/**
 * Delete the save from localStorage.
 */
export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
