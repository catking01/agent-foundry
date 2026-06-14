// ============================================================
// Core Types for Agent Foundry
// ============================================================

export type Domain = 'web' | 'research' | 'data' | 'runtime'

export type OrderStatus = 'available' | 'accepted' | 'in_progress' | 'delivered' | 'failed' | 'rejected'

export type TaskStage = 'planning' | 'engineering' | 'validation' | 'audit' | 'delivery'

export type TaskStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'blocked'

export type AgentRole = 'planner' | 'engineer' | 'validator' | 'auditor' | 'generalist'

export type ArtifactKind = 'plan' | 'code' | 'report' | 'dataset' | 'spec' | 'checklist'

export type RiskLevel = 'low' | 'medium' | 'high'

export type UpgradeKind = 'efficiency' | 'capacity' | 'quality'

// ============================================================
// Agent
// ============================================================

export interface Agent {
  id: string
  name: string
  role: AgentRole
  salaryPerTick: number

  planning: number    // 0-10
  coding: number      // 0-10
  validation: number  // 0-10
  auditing: number    // 0-10
  creativity: number  // 0-10
  reliability: number // 0-10
  speed: number       // 0-10

  overclaimRisk: number  // 0-10, higher = more likely to overclaim
  fatigue: number        // 0-10, increases with work
  specialization: Domain[]

  currentTaskId: string | null
  status: 'idle' | 'working' | 'fatigued'
}

// ============================================================
// Order
// ============================================================

export interface Order {
  id: string
  title: string
  domain: Domain
  complexity: number     // 1-10
  ambiguity: number      // 1-10
  risk: number           // 1-10
  deadlineTick: number
  reward: number
  penalty: number
  acceptanceCriteria: string[]
  status: OrderStatus
  acceptedAtTick: number | null
}

// ============================================================
// Task
// ============================================================

export interface Task {
  id: string
  orderId: string
  parentTaskId: string | null
  stage: TaskStage
  status: TaskStatus
  assignedAgentIds: string[]
  routeId: string | null
  artifactId: string | null  // direct link to the artifact this task works on

  complexity: number
  ambiguity: number
  remainingWork: number
  qualityTarget: number
  risk: number

  createdAtTick: number
  completedAtTick: number | null
}

// ============================================================
// Workshop
// ============================================================

export interface Workshop {
  id: string
  name: string
  stage: TaskStage
  level: number
  efficiencyBonus: number   // multiplier
  capacity: number          // max concurrent tasks
  maintenanceCost: number   // per tick
  upgradeCost: number
  currentLoad: number
}

// ============================================================
// Artifact
// ============================================================

export interface Artifact {
  id: string
  orderId: string
  taskId: string
  routeId: string | null

  kind: ArtifactKind
  quality: number           // 0-10
  evidenceStrength: number  // 0-10
  defectCount: number
  claimLevel: number        // 0-10

  createdByAgentIds: string[]
  createdAtTick: number
  hash: string

  validationPassed: boolean | null
  validationScore: number | null
  auditPassed: boolean | null
  auditResult: AuditResult | null
}

// ============================================================
// Validation & Audit
// ============================================================

export interface ValidationResult {
  passed: boolean
  score: number
  defectsFound: number
  reason: string
}

export interface AuditResult {
  passed: boolean
  overclaimDetected: boolean
  evidenceGapDetected: boolean
  hiddenFailureDetected: boolean
  riskLevel: RiskLevel
  reason: string
}

// ============================================================
// Ledger & Player Actions
// ============================================================

export interface LedgerEvent {
  tick: number
  eventType: string
  actorId: string
  targetId: string
  details: Record<string, unknown>
  stateHash: string
}

export type PlayerAction =
  | { type: 'ACCEPT_ORDER'; orderId: string; tick: number }
  | { type: 'ASSIGN_AGENT'; taskId: string; agentId: string; workshopId: string; tick: number }
  | { type: 'START_PARALLEL_ROUTES'; orderId: string; routeCount: number; tick: number }
  | { type: 'UPGRADE_WORKSHOP'; workshopId: string; upgradeId: string; tick: number }
  | { type: 'RUN_VALIDATION'; artifactId: string; validatorAgentId: string; tick: number }
  | { type: 'RUN_AUDIT'; artifactId: string; auditorAgentId: string; tick: number }
  | { type: 'DELIVER_ORDER'; orderId: string; tick: number }

// ============================================================
// Company Metrics
// ============================================================

export interface CompanyMetrics {
  totalOrdersCompleted: number
  totalOrdersFailed: number
  totalRevenue: number
  totalCost: number
  averageQuality: number
  reworkRate: number
  evidenceIntegrity: number
  majorIncidents: number
  ordersInProgress: number
  agentUtilization: number
}

// ============================================================
// Game State
// ============================================================

export interface GameState {
  seed: number
  tick: number

  cash: number
  reputation: number
  evidenceIntegrity: number

  orders: Record<string, Order>
  tasks: Record<string, Task>
  agents: Record<string, Agent>
  workshops: Record<string, Workshop>
  artifacts: Record<string, Artifact>

  ledger: LedgerEvent[]
  playerActions: PlayerAction[]

  metrics: CompanyMetrics
  gameOver: boolean
  gameOverReason: string | null
}

// ============================================================
// Save / Replay
// ============================================================

export interface SaveFile {
  version: string
  seed: number
  playerActions: PlayerAction[]
  finalStateHash: string
  finalTick: number
  metrics: CompanyMetrics
}
