import { ORG_STUDY_ORDERS, STUDY_SEEDS } from './orgStudyOrders'
import type { OrgStudyOrder } from './orgStudyOrders'

export type OrgInterventionId =
  | 'baseline_hierarchical'
  | 'merge_plus'
  | 'handoff_plus'
  | 'span_control_tight'
  | 'extra_worker'
  | 'audit_coverage_plus'

export interface OrgInterventionDefinition {
  id: OrgInterventionId
  label: string
  category: 'baseline' | 'leadership' | 'communication' | 'structure' | 'staffing' | 'audit'
  description: string
  expectedPrimaryEffect: string
}

export const G28_INTERVENTIONS: OrgInterventionDefinition[] = [
  {
    id: 'baseline_hierarchical',
    label: 'Baseline hierarchical',
    category: 'baseline',
    description: 'Unmodified G27 hierarchical scenario runner output.',
    expectedPrimaryEffect: 'Reference point for same seed and representative order.',
  },
  {
    id: 'merge_plus',
    label: 'Merge judgment plus',
    category: 'leadership',
    description: 'Deterministically models stronger lead merge/select judgment.',
    expectedPrimaryEffect: 'Higher final quality and evidence at modest coordination cost.',
  },
  {
    id: 'handoff_plus',
    label: 'Handoff clarity plus',
    category: 'communication',
    description: 'Deterministically models clearer handoffs and summaries.',
    expectedPrimaryEffect: 'Lower coordination cost and delivery ticks.',
  },
  {
    id: 'span_control_tight',
    label: 'Tighter span of control',
    category: 'structure',
    description: 'Deterministically models narrower lead attention and stricter review.',
    expectedPrimaryEffect: 'Lower latent risk with higher coordination overhead.',
  },
  {
    id: 'extra_worker',
    label: 'Extra worker',
    category: 'staffing',
    description: 'Deterministically models one additional worker assigned to the order.',
    expectedPrimaryEffect: 'More throughput and artifacts with some parallel waste.',
  },
  {
    id: 'audit_coverage_plus',
    label: 'Audit coverage plus',
    category: 'audit',
    description: 'Deterministically models stronger audit coverage without using Ollama.',
    expectedPrimaryEffect: 'More detected findings and lower latent risk exposure.',
  },
]

export const G28_STUDY_ORDERS: OrgStudyOrder[] = [
  selectRepresentativeOrder('simple'),
  selectRepresentativeOrder('medium'),
  selectRepresentativeOrder('complex'),
]

export const G28_TOTAL_RUNS = STUDY_SEEDS.length * G28_STUDY_ORDERS.length * G28_INTERVENTIONS.length

function selectRepresentativeOrder(orderClass: OrgStudyOrder['class']): OrgStudyOrder {
  const orders = ORG_STUDY_ORDERS.filter((order) => order.class === orderClass)
  if (orders.length === 0) {
    throw new Error(`Missing G28 representative order class: ${orderClass}`)
  }
  return orders[Math.floor(orders.length / 2)]
}
