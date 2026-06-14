import type { Domain, ArtifactKind, TaskStage } from './types'

// ============================================================
// Simulation Constants
// ============================================================

export const GAME_VERSION = '0.1.0'

// Tick represents one simulation step
export const TICKS_PER_DAY = 1

// Economy
export const STARTING_CASH = 25000
export const STARTING_REPUTATION = 70
export const STARTING_EVIDENCE_INTEGRITY = 80
export const BASE_WORKSHOP_MAINTENANCE = 50
export const PARALLEL_ROUTE_COST_PER_ROUTE = 200
export const REWORK_COST_MULTIPLIER = 1.5
export const BANKRUPTCY_THRESHOLD = -3000

// Agent
export const FATIGUE_INCREASE_PER_WORK = 0.5
export const FATIGUE_DECREASE_PER_IDLE = 0.3
export const MAX_FATIGUE = 10
export const FATIGUE_PENALTY_MULTIPLIER = 0.03

// Workshop
export const BASE_WORKSHOP_CAPACITY = 3
export const WORKSHOP_UPGRADE_COST = 1000

// Orders
export const MAX_ACTIVE_ORDERS = 8
export const ORDER_GENERATION_INTERVAL = 3   // ticks between order spawns
export const MAX_AVAILABLE_ORDERS = 5

// Task
export const BASE_WORK_PER_TICK = 25
export const COMPLEXITY_WORK_MULTIPLIER = 100

// Work units for task stages
export const PLANNING_WORK_MULTIPLIER = 50
export const ENGINEERING_WORK_MULTIPLIER = 100
export const VALIDATION_WORK = 20
export const AUDIT_WORK = 25
export const DELIVERY_WORK = 10

// Quality
export const QUALITY_MAX = 10
export const MIN_DELIVERY_QUALITY = 3

// Reputation
export const REPUTATION_MAX = 100
export const REPUTATION_MIN = 0

// Domain labels
export const DOMAIN_LABELS: Record<Domain, string> = {
  web: 'Web',
  research: 'Research',
  data: 'Data',
  runtime: 'Runtime',
}

// Artifact kind labels
export const ARTIFACT_KIND_LABELS: Record<ArtifactKind, string> = {
  plan: 'Plan',
  code: 'Code',
  report: 'Report',
  dataset: 'Dataset',
  spec: 'Spec',
  checklist: 'Checklist',
}

// Stage display names
export const STAGE_LABELS: Record<TaskStage, string> = {
  planning: 'Planning',
  engineering: 'Engineering',
  validation: 'Validation',
  audit: 'Audit',
  delivery: 'Delivery',
}

// Scoring weights for artifact judging
export const SCORE_WEIGHTS = {
  quality: 1.0,
  evidenceStrength: 0.6,
  novelty: 0.3,
  defectPenalty: 1.2,
  overclaimPenalty: 1.5,
}

// Reputation delta weights
export const REPUTATION_WEIGHTS = {
  deliveryQuality: 0.4,
  onTimeBonus: 15,
  auditIntegrityBonus: 10,
  defectPenalty: 5,
  overclaimPenalty: 8,
  missedDeadlinePenalty: 12,
}
