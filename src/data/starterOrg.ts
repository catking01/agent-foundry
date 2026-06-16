// ============================================================
// G26: Starter Organization Hierarchy
// ============================================================
//
// A minimal 3-level organization for hierarchical simulation:
//
//   operations_lead_unit
//     ├ cell_unit_A (cell_lead_A)
//     │   ├ worker_1
//     │   ├ worker_2
//     │   └ worker_3
//     └ cell_unit_B (cell_lead_B)
//         ├ worker_4
//         ├ worker_5
//         └ worker_6
// ============================================================

import type { OrgUnit } from '../sim/orgModel'
import type { ResearchAgentProfile } from '../sim/agentProfiles'
import {
  FAST_EXECUTOR,
  CAREFUL_VALIDATOR,
  CREATIVE_ENGINEER,
  RELIABLE_AUDITOR,
  BALANCED_CELL_LEAD,
  HANDS_OFF_WORKSHOP_LEAD,
} from './agentProfilePresets'

// ============================================================
// Org Units
// ============================================================

export const STARTER_ORG_UNITS: OrgUnit[] = [
  {
    id: 'unit-operations',
    name: '运营中心',
    role: 'operations_lead',
    parentUnitId: null,
    leadAgentId: 'agent-ops-lead',
    memberAgentIds: ['agent-ops-lead'],
    childUnitIds: ['unit-cell-a', 'unit-cell-b'],
    specialization: [],
    capacity: 4,
    spanOfControl: 2,
  },
  {
    id: 'unit-cell-a',
    name: 'A 组',
    role: 'cell_lead',
    parentUnitId: 'unit-operations',
    leadAgentId: 'agent-cell-lead-a',
    memberAgentIds: ['agent-cell-lead-a', 'agent-worker-1', 'agent-worker-2', 'agent-worker-3'],
    childUnitIds: [],
    specialization: ['web'],
    capacity: 3,
    spanOfControl: 5,
  },
  {
    id: 'unit-cell-b',
    name: 'B 组',
    role: 'cell_lead',
    parentUnitId: 'unit-operations',
    leadAgentId: 'agent-cell-lead-b',
    memberAgentIds: ['agent-cell-lead-b', 'agent-worker-4', 'agent-worker-5', 'agent-worker-6'],
    childUnitIds: [],
    specialization: ['data'],
    capacity: 3,
    spanOfControl: 5,
  },
]

// ============================================================
// Agent Profile Assignments
// ============================================================

export interface OrgAgent {
  id: string
  name: string
  role: 'operations_lead' | 'cell_lead' | 'worker'
  assignedUnitId: string
  profile: ResearchAgentProfile
}

export const STARTER_ORG_AGENTS: OrgAgent[] = [
  // Operations Lead
  {
    id: 'agent-ops-lead',
    name: '运营主管',
    role: 'operations_lead',
    assignedUnitId: 'unit-operations',
    profile: {
      ...BALANCED_CELL_LEAD,
      capability: {
        ...BALANCED_CELL_LEAD.capability,
        planning: 8,
        decomposition: 9,
        riskAssessment: 8,
      },
      leadership: {
        ...BALANCED_CELL_LEAD.leadership!,
        spanOfControl: 2,
        delegationSkill: 8,
        bottleneckAwareness: 7,
      },
    },
  },

  // Cell Lead A — balanced, good judgment
  {
    id: 'agent-cell-lead-a',
    name: 'A 组组长',
    role: 'cell_lead',
    assignedUnitId: 'unit-cell-a',
    profile: BALANCED_CELL_LEAD,
  },

  // Cell Lead B — hands-off, delegates heavily
  {
    id: 'agent-cell-lead-b',
    name: 'B 组组长',
    role: 'cell_lead',
    assignedUnitId: 'unit-cell-b',
    profile: HANDS_OFF_WORKSHOP_LEAD,
  },

  // Workers — Cell A
  {
    id: 'agent-worker-1',
    name: 'FastCoder-A1',
    role: 'worker',
    assignedUnitId: 'unit-cell-a',
    profile: FAST_EXECUTOR,
  },
  {
    id: 'agent-worker-2',
    name: 'CarefulV-A2',
    role: 'worker',
    assignedUnitId: 'unit-cell-a',
    profile: CAREFUL_VALIDATOR,
  },
  {
    id: 'agent-worker-3',
    name: 'CreativeE-A3',
    role: 'worker',
    assignedUnitId: 'unit-cell-a',
    profile: CREATIVE_ENGINEER,
  },

  // Workers — Cell B
  {
    id: 'agent-worker-4',
    name: 'FastCoder-B1',
    role: 'worker',
    assignedUnitId: 'unit-cell-b',
    profile: FAST_EXECUTOR,
  },
  {
    id: 'agent-worker-5',
    name: 'ReliableAud-B2',
    role: 'worker',
    assignedUnitId: 'unit-cell-b',
    profile: RELIABLE_AUDITOR,
  },
  {
    id: 'agent-worker-6',
    name: 'CreativeE-B3',
    role: 'worker',
    assignedUnitId: 'unit-cell-b',
    profile: CREATIVE_ENGINEER,
  },
]

// ============================================================
// Helper: build lookup maps
// ============================================================

export function buildOrgUnitMap(): Record<string, OrgUnit> {
  const map: Record<string, OrgUnit> = {}
  for (const unit of STARTER_ORG_UNITS) {
    map[unit.id] = { ...unit }
  }
  return map
}

export function buildOrgAgentMap(): Record<string, OrgAgent> {
  const map: Record<string, OrgAgent> = {}
  for (const agent of STARTER_ORG_AGENTS) {
    map[agent.id] = { ...agent }
  }
  return map
}

export function getWorkersByUnit(unitId: string): OrgAgent[] {
  return STARTER_ORG_AGENTS.filter(
    (a) => a.assignedUnitId === unitId && a.role === 'worker'
  )
}

export function getLeadAgent(unitId: string): OrgAgent | undefined {
  const unit = STARTER_ORG_UNITS.find((u) => u.id === unitId)
  if (!unit?.leadAgentId) return undefined
  return STARTER_ORG_AGENTS.find((a) => a.id === unit.leadAgentId)
}
