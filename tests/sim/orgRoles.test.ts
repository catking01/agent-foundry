import { describe, it, expect } from 'vitest'
import {
  ORG_ROLE_ZH,
  ORG_ROLE_EN,
  ORG_ROLE_LEVEL,
  LEAD_ROLES,
  WORKER_ROLES,
  isLeadRole,
  getRoleDisplayName,
  getRoleLevel,
  getSubordinateRoles,
  getSuperiorRoles,
  DEFAULT_SPAN_OF_CONTROL,
  ORG_ROLE_DESCRIPTIONS,
} from '../../src/sim/orgRoles'
import type { OrgRole } from '../../src/sim/orgRoles'

describe('Organization Roles', () => {
  // --- Role display names ---

  it('worker maps to 执行员', () => {
    expect(ORG_ROLE_ZH.worker).toBe('执行员')
    expect(ORG_ROLE_EN.worker).toBe('Worker')
  })

  it('cell_lead maps to 小组长', () => {
    expect(ORG_ROLE_ZH.cell_lead).toBe('小组长')
    expect(ORG_ROLE_EN.cell_lead).toBe('Cell Lead')
  })

  it('workshop_lead maps to 车间长', () => {
    expect(ORG_ROLE_ZH.workshop_lead).toBe('车间长')
  })

  it('department_lead maps to 部门主管', () => {
    expect(ORG_ROLE_ZH.department_lead).toBe('部门主管')
  })

  it('operations_lead maps to 运营主管', () => {
    expect(ORG_ROLE_ZH.operations_lead).toBe('运营主管')
    expect(ORG_ROLE_EN.operations_lead).toBe('Operations Lead')
  })

  // --- Hierarchy levels ---

  it('worker is level 0 (lowest)', () => {
    expect(getRoleLevel('worker')).toBe(0)
  })

  it('operations_lead is level 4 (highest)', () => {
    expect(getRoleLevel('operations_lead')).toBe(4)
  })

  it('hierarchy levels are strictly ascending', () => {
    const roles: OrgRole[] = ['worker', 'cell_lead', 'workshop_lead', 'department_lead', 'operations_lead']
    for (let i = 1; i < roles.length; i++) {
      expect(getRoleLevel(roles[i])).toBeGreaterThan(getRoleLevel(roles[i - 1]))
    }
  })

  // --- Lead vs Worker ---

  it('lead roles all return true for isLeadRole', () => {
    for (const role of LEAD_ROLES) {
      expect(isLeadRole(role)).toBe(true)
    }
  })

  it('worker returns false for isLeadRole', () => {
    expect(isLeadRole('worker')).toBe(false)
  })

  it('worker roles contain only worker', () => {
    expect(WORKER_ROLES).toEqual(['worker'])
  })

  // --- Display names ---

  it('getRoleDisplayName returns Chinese for zh', () => {
    expect(getRoleDisplayName('worker', 'zh')).toBe('执行员')
    expect(getRoleDisplayName('cell_lead', 'zh')).toBe('小组长')
  })

  it('getRoleDisplayName returns English for en', () => {
    expect(getRoleDisplayName('worker', 'en')).toBe('Worker')
    expect(getRoleDisplayName('operations_lead', 'en')).toBe('Operations Lead')
  })

  // --- Subordinate / Superior relationships ---

  it('operations_lead can supervise all lower roles', () => {
    const subs = getSubordinateRoles('operations_lead')
    expect(subs).toContain('worker')
    expect(subs).toContain('cell_lead')
    expect(subs).toContain('workshop_lead')
    expect(subs).toContain('department_lead')
    expect(subs).not.toContain('operations_lead')
  })

  it('worker has no subordinates', () => {
    expect(getSubordinateRoles('worker')).toEqual([])
  })

  it('worker can report to all higher roles', () => {
    const superiors = getSuperiorRoles('worker')
    expect(superiors).toContain('cell_lead')
    expect(superiors).toContain('operations_lead')
    expect(superiors).not.toContain('worker')
  })

  it('operations_lead has no superiors', () => {
    expect(getSuperiorRoles('operations_lead')).toEqual([])
  })

  // --- Span of control ---

  it('worker span of control is 0', () => {
    expect(DEFAULT_SPAN_OF_CONTROL.worker).toBe(0)
  })

  it('cell_lead span of control is 5', () => {
    expect(DEFAULT_SPAN_OF_CONTROL.cell_lead).toBe(5)
  })

  it('operations_lead span of control is 2 (manages departments)', () => {
    expect(DEFAULT_SPAN_OF_CONTROL.operations_lead).toBe(2)
  })

  // --- Descriptions ---

  it('every role has zh and en descriptions', () => {
    const allRoles: OrgRole[] = ['worker', 'cell_lead', 'workshop_lead', 'department_lead', 'operations_lead']
    for (const role of allRoles) {
      expect(ORG_ROLE_DESCRIPTIONS[role].zh).toBeTruthy()
      expect(ORG_ROLE_DESCRIPTIONS[role].en).toBeTruthy()
    }
  })

  // --- All role levels defined ---

  it('every OrgRole has a level mapping', () => {
    const allRoles: OrgRole[] = ['worker', 'cell_lead', 'workshop_lead', 'department_lead', 'operations_lead']
    for (const role of allRoles) {
      expect(ORG_ROLE_LEVEL[role]).toBeDefined()
      expect(ORG_ROLE_ZH[role]).toBeDefined()
      expect(ORG_ROLE_EN[role]).toBeDefined()
    }
  })
})
