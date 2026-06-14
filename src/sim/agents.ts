import type { Agent, Task } from './types'
import { clamp, tickRng } from './rng'
import {
  FATIGUE_INCREASE_PER_WORK,
  FATIGUE_DECREASE_PER_IDLE,
  MAX_FATIGUE,
  FATIGUE_PENALTY_MULTIPLIER,
} from './constants'

/**
 * Compute work output for an agent on a given task.
 */
export function computeWorkOutput(
  agent: Agent,
  task: Task,
  workshopEfficiency: number
): number {
  const skill = getSkillForStage(agent, task.stage)
  const fatiguePenalty = 1 - (agent.fatigue * FATIGUE_PENALTY_MULTIPLIER)
  const output = agent.speed * skill * fatiguePenalty * workshopEfficiency
  return Math.max(0, output)
}

function getSkillForStage(agent: Agent, stage: Task['stage']): number {
  switch (stage) {
    case 'planning':
      return agent.planning
    case 'engineering':
      return agent.coding
    case 'validation':
      return agent.validation
    case 'audit':
      return agent.auditing
    case 'delivery':
      // Delivery uses a mix of reliability and speed
      return (agent.reliability + agent.speed) / 2
  }
}

/**
 * Increase fatigue for agents that worked this tick.
 */
export function increaseFatigue(agent: Agent): Agent {
  if (agent.status === 'working') {
    return {
      ...agent,
      fatigue: clamp(agent.fatigue + FATIGUE_INCREASE_PER_WORK, 0, MAX_FATIGUE),
    }
  }
  return agent
}

/**
 * Decrease fatigue for idle agents.
 */
export function decreaseFatigue(agent: Agent): Agent {
  if (agent.status === 'idle') {
    return {
      ...agent,
      fatigue: clamp(agent.fatigue - FATIGUE_DECREASE_PER_IDLE, 0, MAX_FATIGUE),
    }
  }
  return agent
}

/**
 * Update fatigue for all agents.
 */
export function updateFatigue(agents: Record<string, Agent>): Record<string, Agent> {
  const next: Record<string, Agent> = {}
  for (const [id, agent] of Object.entries(agents)) {
    let a = increaseFatigue(agent)
    a = decreaseFatigue(a)
    // Mark fatigued status
    if (a.fatigue >= 7) {
      a = { ...a, status: 'fatigued' as const }
    } else if (a.status === 'fatigued' && a.fatigue < 4) {
      a = { ...a, status: 'idle' as const }
    }
    next[id] = a
  }
  return next
}

/**
 * Compute overclaim risk based on agent propensity and task ambiguity.
 * Returns true if the agent overclaims on this artifact.
 */
export function rollOverclaim(
  seed: number,
  tick: number,
  agent: Agent,
  task: Task
): { doesOverclaim: boolean; claimLevel: number; evidenceStrength: number } {
  const rng = tickRng(seed, tick + agent.overclaimRisk * 13)

  // Higher overclaimRisk + higher ambiguity = more likely to overclaim
  const overclaimChance =
    (agent.overclaimRisk / 10) * 0.4 +
    (task.ambiguity / 10) * 0.3 +
    (1 - agent.reliability / 10) * 0.3

  const doesOverclaim = rng() < overclaimChance

  if (doesOverclaim) {
    // Overclaim: claim is higher than actual evidence
    const baseEvidence = agent.reliability * 0.6 + rng() * 3
    const claimInflate = 1 + rng() * 3 + agent.overclaimRisk * 0.3
    return {
      doesOverclaim: true,
      claimLevel: clamp(baseEvidence + claimInflate, 0, 10),
      evidenceStrength: clamp(baseEvidence, 0, 10),
    }
  }

  // Honest artifact
  const evidence = clamp(agent.reliability * 0.7 + rng() * 2, 0, 10)
  return {
    doesOverclaim: false,
    claimLevel: evidence,
    evidenceStrength: evidence,
  }
}
