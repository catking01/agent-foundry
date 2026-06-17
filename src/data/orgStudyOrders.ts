// ============================================================
// G27: Order Classes for Multi-Seed Organization Study
// ============================================================
//
// Defines three order complexity classes for systematic
// flat-vs-hierarchy comparison:
//   simple  — should show little hierarchy benefit
//   medium  — moderate benefit potential
//   complex — highest potential for hierarchy benefit
// ============================================================

export interface OrgStudyOrder {
  id: string
  title: string
  complexity: number
  class: 'simple' | 'medium' | 'complex'
}

export const ORG_STUDY_ORDERS: OrgStudyOrder[] = [
  // ---- Simple orders (complexity 1-3) ----
  {
    id: 'study-order-simple-1',
    title: 'Fix typo in README',
    complexity: 1,
    class: 'simple',
  },
  {
    id: 'study-order-simple-2',
    title: 'Add color to button',
    complexity: 2,
    class: 'simple',
  },
  {
    id: 'study-order-simple-3',
    title: 'Write unit test for login',
    complexity: 3,
    class: 'simple',
  },

  // ---- Medium orders (complexity 4-6) ----
  {
    id: 'study-order-medium-1',
    title: 'Build landing page with form',
    complexity: 4,
    class: 'medium',
  },
  {
    id: 'study-order-medium-2',
    title: 'Design API schema for payments',
    complexity: 5,
    class: 'medium',
  },
  {
    id: 'study-order-medium-3',
    title: 'Implement OAuth login flow',
    complexity: 6,
    class: 'medium',
  },

  // ---- Complex orders (complexity 7-10) ----
  {
    id: 'study-order-complex-1',
    title: 'Build full dashboard with charts',
    complexity: 7,
    class: 'complex',
  },
  {
    id: 'study-order-complex-2',
    title: 'Migrate legacy monolith to microservices',
    complexity: 8,
    class: 'complex',
  },
  {
    id: 'study-order-complex-3',
    title: 'Design real-time analytics pipeline',
    complexity: 9,
    class: 'complex',
  },
]

/** Get orders by complexity class */
export function getOrdersByClass(cls: 'simple' | 'medium' | 'complex'): OrgStudyOrder[] {
  return ORG_STUDY_ORDERS.filter((o) => o.class === cls)
}

/** Seeds for multi-seed study */
export const STUDY_SEEDS = [1, 2, 3, 42, 99, 123, 2026, 9001]

/** Study modes */
export const STUDY_MODES = ['flat', 'hierarchical'] as const
export type StudyMode = (typeof STUDY_MODES)[number]

/** Total runs in study matrix: 8 seeds × 9 orders × 2 modes = 144 */
export const STUDY_TOTAL_RUNS = STUDY_SEEDS.length * ORG_STUDY_ORDERS.length * STUDY_MODES.length

/**
 * Run matrix size breakdown:
 *   8 seeds × 3 simple orders × 2 modes = 48 simple runs
 *   8 seeds × 3 medium orders × 2 modes = 48 medium runs
 *   8 seeds × 3 complex orders × 2 modes = 48 complex runs
 *   Total = 144 runs
 */
