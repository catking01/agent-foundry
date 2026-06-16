// ============================================================
// G26: Fan-out Logic
// ============================================================
//
// Handles splitting work packages into subtasks (fan-out)
// and merging results back (fan-in). This is the core of
// hierarchical organization simulation.
//
// Fan-out = lead splits complex order into N child packages
// Fan-in  = lead merges/selects worker artifacts into final
// ============================================================

import type { WorkPackage, OrgUnit, OrgArtifact } from './orgModel'
import { createWorkPackage } from './workPackages'

/**
 * Determine how many child work packages to create from a parent.
 * Based on order complexity and lead's span of control.
 *
 * Simple orders (complexity <= 3): no fan-out (1 worker)
 * Medium orders (4-6): 2 workers
 * Complex orders (7-10): 3 workers
 */
export function determineFanoutCount(
  orderComplexity: number,
  leadSpanOfControl: number
): number {
  if (orderComplexity <= 3) return 1
  if (orderComplexity <= 6) return Math.min(2, leadSpanOfControl)
  return Math.min(3, leadSpanOfControl)
}

/**
 * Split a parent work package into child packages.
 * Each child gets a fraction of the parent's complexity.
 * Returns the child packages (not yet assigned to workers).
 */
export function fanoutWorkPackage(
  parentPackage: WorkPackage,
  childUnitIds: string[],
  tick: number
): WorkPackage[] {
  const fanoutCount = childUnitIds.length
  if (fanoutCount === 0) return []

  // Distribute complexity across children (with some overhead from splitting)
  const overhead = 1 + (fanoutCount - 1) * 0.15 // 15% overhead per additional child
  const childComplexity = Math.max(1, Math.round(
    (parentPackage.complexity * overhead) / fanoutCount
  ))

  const children: WorkPackage[] = []
  for (let i = 0; i < fanoutCount; i++) {
    const child = createWorkPackage({
      orderId: parentPackage.orderId,
      parentPackageId: parentPackage.id,
      assignedUnitId: childUnitIds[i],
      leadAgentId: null, // will be assigned later
      workerAgentIds: [],
      stage: 'execution',
      complexity: childComplexity,
      tick,
    })
    children.push(child)
  }

  return children
}

/**
 * Assign workers to child packages based on unit membership.
 * Each child package gets workers from its assigned unit.
 */
export function assignWorkersToPackages(
  childPackages: WorkPackage[],
  units: Record<string, OrgUnit>
): WorkPackage[] {
  return childPackages.map((pkg) => {
    const unit = units[pkg.assignedUnitId]
    if (!unit) return pkg
    return {
      ...pkg,
      workerAgentIds: [...unit.memberAgentIds],
      status: 'in_progress' as const,
    }
  })
}

/**
 * Collect all artifacts produced by workers across child packages.
 */
export function collectArtifacts(
  childPackages: WorkPackage[],
  allArtifacts: Record<string, OrgArtifact>
): OrgArtifact[] {
  const result: OrgArtifact[] = []
  for (const pkg of childPackages) {
    for (const artId of pkg.artifactIds) {
      const art = allArtifacts[artId]
      if (art) result.push(art)
    }
  }
  return result
}

/**
 * Estimate parallel waste — work duplication or conflict from
 * having multiple workers on the same order.
 *
 * Higher when:
 * - More parallel workers
 * - Lower lead coordination (mergeJudgment)
 * - Lower handoff clarity
 */
export function estimateParallelWaste(params: {
  workerCount: number
  mergeJudgment: number
  handoffClarity: number
}): number {
  if (params.workerCount <= 1) return 0

  const baseWaste = (params.workerCount - 1) * 0.15 // 15% waste per extra worker
  const coordinationFactor = (20 - params.mergeJudgment - params.handoffClarity) / 20
  return Math.max(0, Math.round(baseWaste * coordinationFactor * 100) / 100)
}

/**
 * Calculate lead utilization based on how many packages they're managing.
 */
export function calculateLeadUtilization(
  managedPackageCount: number,
  spanOfControl: number
): number {
  if (spanOfControl <= 0) return 0
  return Math.min(1, managedPackageCount / spanOfControl)
}

/**
 * Calculate worker utilization based on active assignments.
 */
export function calculateWorkerUtilization(
  activeWorkerCount: number,
  totalWorkerCount: number
): number {
  if (totalWorkerCount <= 0) return 0
  return Math.min(1, activeWorkerCount / totalWorkerCount)
}

/**
 * Compute artifact diversity — how different the worker artifacts are.
 * Higher diversity = workers took different approaches (good for selection).
 * Lower diversity = workers produced similar outputs (parallel waste).
 *
 * Measured as standard deviation of quality scores.
 */
export function computeArtifactDiversity(artifacts: OrgArtifact[]): number {
  if (artifacts.length <= 1) return 0
  const qualities = artifacts.map((a) => a.quality)
  const mean = qualities.reduce((s, q) => s + q, 0) / qualities.length
  const variance = qualities.reduce((s, q) => s + (q - mean) ** 2, 0) / qualities.length
  return Math.round(Math.sqrt(variance) * 100) / 100
}
