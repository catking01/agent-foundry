// ============================================================
// G26-0: Organization Role Definitions
// ============================================================
//
// Defines org roles with Chinese/English display names.
// Separates research-model naming from gameplay UI naming.
//
// Role hierarchy (ascending level):
//   worker (0) → cell_lead (1) → workshop_lead (2)
//   → department_lead (3) → operations_lead (4)
// ============================================================

/**
 * Organization role — determines agent's position in the hierarchy.
 *
 * Level 0: worker           — executes tasks, no reports
 * Level 1: cell_lead        — leads a small cell (3-5 workers), fan-out/merge
 * Level 2: workshop_lead    — leads a workshop (multiple cells), resource allocation
 * Level 3: department_lead  — leads a department, cross-workshop coordination
 * Level 4: operations_lead  — top-level operations, intake and strategic decisions
 */
export type OrgRole =
  | 'worker'
  | 'cell_lead'
  | 'workshop_lead'
  | 'department_lead'
  | 'operations_lead'

/** Role display names in Chinese (gameplay UI) */
export const ORG_ROLE_ZH: Record<OrgRole, string> = {
  worker: '执行员',
  cell_lead: '小组长',
  workshop_lead: '车间长',
  department_lead: '部门主管',
  operations_lead: '运营主管',
}

/** Role display names in English */
export const ORG_ROLE_EN: Record<OrgRole, string> = {
  worker: 'Worker',
  cell_lead: 'Cell Lead',
  workshop_lead: 'Workshop Lead',
  department_lead: 'Department Lead',
  operations_lead: 'Operations Lead',
}

/** Hierarchy level (0 = worker, 4 = operations_lead) */
export const ORG_ROLE_LEVEL: Record<OrgRole, number> = {
  worker: 0,
  cell_lead: 1,
  workshop_lead: 2,
  department_lead: 3,
  operations_lead: 4,
}

/** All roles ordered by hierarchy level (lowest first) */
export const ORG_ROLES_BY_LEVEL: OrgRole[] = [
  'worker',
  'cell_lead',
  'workshop_lead',
  'department_lead',
  'operations_lead',
]

/** Roles that have direct reports (lead roles) */
export const LEAD_ROLES: OrgRole[] = [
  'cell_lead',
  'workshop_lead',
  'department_lead',
  'operations_lead',
]

/** Roles that do NOT have direct reports */
export const WORKER_ROLES: OrgRole[] = ['worker']

/**
 * Check if a role is a lead role (has direct reports, needs LeadershipProfile).
 */
export function isLeadRole(role: OrgRole): boolean {
  return LEAD_ROLES.includes(role)
}

/**
 * Get the display name for a role in the given language.
 */
export function getRoleDisplayName(role: OrgRole, lang: 'zh' | 'en'): string {
  return lang === 'zh' ? ORG_ROLE_ZH[role] : ORG_ROLE_EN[role]
}

/**
 * Get the hierarchy level for a role (0-4).
 */
export function getRoleLevel(role: OrgRole): number {
  return ORG_ROLE_LEVEL[role]
}

/**
 * Get the roles that can report to the given role.
 * e.g., operations_lead can supervise department_lead and below.
 */
export function getSubordinateRoles(role: OrgRole): OrgRole[] {
  const level = getRoleLevel(role)
  return ORG_ROLES_BY_LEVEL.filter((r) => getRoleLevel(r) < level)
}

/**
 * Get the roles that the given role can report to.
 * e.g., worker can report to cell_lead, workshop_lead, etc.
 */
export function getSuperiorRoles(role: OrgRole): OrgRole[] {
  const level = getRoleLevel(role)
  return ORG_ROLES_BY_LEVEL.filter((r) => getRoleLevel(r) > level)
}

/**
 * Default span of control (max direct reports) for each lead role.
 */
export const DEFAULT_SPAN_OF_CONTROL: Record<OrgRole, number> = {
  worker: 0,
  cell_lead: 5,
  workshop_lead: 4, // manages cells, not individual workers
  department_lead: 3, // manages workshops
  operations_lead: 2, // manages departments
}

/**
 * Research description of each role's function in the organization.
 */
export const ORG_ROLE_DESCRIPTIONS: Record<OrgRole, { zh: string; en: string }> = {
  worker: {
    zh: '执行具体任务：规划、工程、验证、审计或交付。不管理他人。',
    en: 'Executes concrete tasks: planning, engineering, validation, audit, or delivery. No management responsibility.',
  },
  cell_lead: {
    zh: '管理 3-5 名执行员，将复杂任务拆分为子任务分配给组员，合并产出物。是 fan-out/merge 的关键节点。',
    en: 'Manages 3-5 workers. Splits complex tasks into subtasks, assigns to cell members, merges artifacts. Key fan-out/merge node.',
  },
  workshop_lead: {
    zh: '管理多个小组，负责车间级资源分配和瓶颈缓解。协调跨组交接。',
    en: 'Manages multiple cells. Handles workshop-level resource allocation and bottleneck mitigation. Coordinates cross-cell handoffs.',
  },
  department_lead: {
    zh: '管理多个车间，跨车间协调。对齐部门目标与组织战略。',
    en: 'Manages multiple workshops. Cross-workshop coordination. Aligns department goals with organizational strategy.',
  },
  operations_lead: {
    zh: '最高运营负责人。接单决策、组织架构调整、战略资源分配。',
    en: 'Top operations leader. Order intake decisions, org structure adjustment, strategic resource allocation.',
  },
}
