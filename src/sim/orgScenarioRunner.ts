// ============================================================
// G26: Organization Scenario Runner
// ============================================================
//
// Runs flat and hierarchical organization scenarios and
// compares the results. This is the RESEARCH entry point
// for G26 — it does NOT modify the main gameplay pipeline.
//
// Flat mode:
//   All workers directly execute subtasks. No lead merge.
//   Minimal coordination cost. No formal handoffs.
//
// Hierarchical mode:
//   Operations lead intake → cell lead fan-out → workers execute
//   → cell lead merge → final artifact. Handoffs recorded.
//   Coordination costs accumulate.
// ============================================================

import type { OrgUnit, OrgArtifact, OrgRunResult, OrgRunMetrics, WorkPackage } from './orgModel'
import type { ResearchAgentProfile } from './agentProfiles'
import type { OrgAgent } from '../data/starterOrg'
import {
  buildOrgUnitMap,
  buildOrgAgentMap,
  getWorkersByUnit,
  getLeadAgent,
} from '../data/starterOrg'
import { createWorkPackage, generateWorkerArtifact, mergeArtifacts, selectBestArtifact, resetPackageCounter } from './workPackages'
import { recordHandoff, calculateCoordinationCost, resetHandoffCounter } from './handoff'
import {
  determineFanoutCount,
  fanoutWorkPackage,
  assignWorkersToPackages,
  collectArtifacts,
  estimateParallelWaste,
  calculateLeadUtilization,
  calculateWorkerUtilization,
  computeArtifactDiversity,
} from './fanout'
import { mulberry32, clamp } from './rng'

// ============================================================
// Flat Org Runner
// ============================================================

export function runFlatOrgScenario(
  seed: number,
  orderParams: {
    id: string
    title: string
    complexity: number
  }
): OrgRunResult {
  resetPackageCounter()
  resetHandoffCounter()

  const rng = mulberry32(seed)
  const tick = 0
  const unitMap = buildOrgUnitMap()
  const agentMap = buildOrgAgentMap()

  const allWorkers = Object.values(agentMap).filter((a) => a.role === 'worker')
  const handoffEvents: import('./orgModel').HandoffEvent[] = []
  const allArtifacts: Record<string, OrgArtifact> = {}

  // Determine how many workers based on complexity
  const workerCount = Math.min(allWorkers.length, determineFanoutCount(orderParams.complexity, 6))
  const selectedWorkers = allWorkers.slice(0, workerCount)

  // Create one parent work package (no hierarchy)
  const parentPackage = createWorkPackage({
    orderId: orderParams.id,
    parentPackageId: null,
    assignedUnitId: 'unit-flat',
    leadAgentId: null,
    workerAgentIds: selectedWorkers.map((w) => w.id),
    stage: 'execution',
    complexity: orderParams.complexity,
    tick,
  })
  parentPackage.status = 'in_progress'

  // Each worker generates an artifact
  const workerPackages: WorkPackage[] = []
  let execTick = tick + 1

  for (const worker of selectedWorkers) {
    const wpRng = mulberry32(seed + execTick * 1009 + worker.id.length)
    const art = generateWorkerArtifact(wpRng, {
      packageId: parentPackage.id,
      orderId: orderParams.id,
      agentId: worker.id,
      engineering: worker.profile.capability.engineering,
      evidenceReasoning: worker.profile.capability.evidenceReasoning,
      speedBias: worker.profile.workStyle.speedBias,
      qualityBias: worker.profile.workStyle.qualityBias,
      claimCalibration: worker.profile.evidenceDiscipline.claimCalibration,
      overclaimTendency: worker.profile.evidenceDiscipline.overclaimTendency,
      tick: execTick,
    })

    allArtifacts[art.id] = art
    parentPackage.artifactIds.push(art.id)

    // Create a child package for tracking
    const childPkg = createWorkPackage({
      orderId: orderParams.id,
      parentPackageId: parentPackage.id,
      assignedUnitId: worker.assignedUnitId,
      leadAgentId: null,
      workerAgentIds: [worker.id],
      stage: 'execution',
      complexity: Math.round(orderParams.complexity / workerCount),
      tick: execTick,
    })
    childPkg.status = 'completed'
    childPkg.artifactIds.push(art.id)
    childPkg.completedAtTick = execTick
    workerPackages.push(childPkg)

    execTick++
  }

  parentPackage.childPackageIds = workerPackages.map((p) => p.id)
  parentPackage.status = 'completed'
  parentPackage.completedAtTick = execTick

  // In flat mode, pick the best artifact directly (no lead merge)
  const allWorkerArtifacts = collectArtifacts(workerPackages, allArtifacts)
  const finalArtifact = selectBestArtifact(allWorkerArtifacts, 5, mulberry32(seed + 9999))

  // Detect overclaims in the final artifact
  const detectedOverclaimFindings = finalArtifact && finalArtifact.overclaimGap > 0 ? 1 : 0

  // Estimate latent risk
  const latentRiskEstimate = allWorkerArtifacts.reduce(
    (sum, a) => sum + a.overclaimGap * 0.5, 0
  )

  const metrics: OrgRunMetrics = {
    fanoutCount: workerCount,
    subtaskCount: workerPackages.length,
    handoffCount: handoffEvents.length,
    coordinationCost: calculateCoordinationCost(handoffEvents),
    mergeDelay: 0,
    leadUtilization: 0,
    workerUtilization: calculateWorkerUtilization(workerCount, allWorkers.length),
    bottleneckUnitId: null,
    artifactDiversity: computeArtifactDiversity(allWorkerArtifacts),
    parallelWaste: estimateParallelWaste({
      workerCount,
      mergeJudgment: 5,
      handoffClarity: 5,
    }),
    finalQuality: finalArtifact?.quality ?? null,
    finalEvidenceStrength: finalArtifact?.evidenceStrength ?? null,
    finalClaimLevel: finalArtifact?.claimLevel ?? null,
    overclaimGap: finalArtifact?.overclaimGap ?? null,
    detectedOverclaimFindings,
    latentRiskEstimate: Math.round(latentRiskEstimate * 100) / 100,
    evidenceIntegrityDelta: finalArtifact
      ? Math.round((finalArtifact.evidenceStrength - finalArtifact.claimLevel) * 10) / 10
      : 0,
    totalTicks: execTick,
    artifactsProduced: allWorkerArtifacts.length,
  }

  return {
    seed,
    orderId: orderParams.id,
    orderTitle: orderParams.title,
    orderComplexity: orderParams.complexity,
    mode: 'flat',
    finalArtifactId: finalArtifact?.id ?? null,
    artifactIds: Object.keys(allArtifacts),
    workPackageIds: [parentPackage.id, ...workerPackages.map((p) => p.id)],
    handoffEvents,
    metrics,
  }
}

// ============================================================
// Hierarchical Org Runner
// ============================================================

export function runHierarchicalOrgScenario(
  seed: number,
  orderParams: {
    id: string
    title: string
    complexity: number
  }
): OrgRunResult {
  resetPackageCounter()
  resetHandoffCounter()

  const rng = mulberry32(seed)
  const unitMap = buildOrgUnitMap()
  const agentMap = buildOrgAgentMap()
  const handoffEvents: import('./orgModel').HandoffEvent[] = []
  const allArtifacts: Record<string, OrgArtifact> = {}
  let currentTick = 0

  // ---- Phase 1: Operations Lead Intake ----
  const opsUnit = Object.values(unitMap).find((u) => u.role === 'operations_lead')
  const opsLead = opsUnit ? agentMap[opsUnit.leadAgentId!] : undefined

  if (!opsUnit || !opsLead) {
    throw new Error('Hierarchical org requires an operations lead unit with a lead agent.')
  }

  const parentPackage = createWorkPackage({
    orderId: orderParams.id,
    parentPackageId: null,
    assignedUnitId: opsUnit.id,
    leadAgentId: opsLead.id,
    workerAgentIds: [],
    stage: 'intake',
    complexity: orderParams.complexity,
    tick: currentTick,
  })
  parentPackage.status = 'in_progress'
  currentTick++

  // ---- Phase 2: Fan-out to Cell Leads ----
  const cellUnits = opsUnit.childUnitIds.map((id) => unitMap[id]).filter(Boolean)
  const fanoutCount = Math.min(cellUnits.length, determineFanoutCount(orderParams.complexity, opsUnit.spanOfControl))

  // Handoff: operations → each cell lead
  for (let i = 0; i < fanoutCount; i++) {
    const cellUnit = cellUnits[i]
    const cellLead = cellUnit.leadAgentId ? agentMap[cellUnit.leadAgentId] : undefined
    const clarity = cellLead?.profile.communication.handoffClarity ?? 7

    handoffEvents.push(recordHandoff({
      fromUnitId: opsUnit.id,
      toUnitId: cellUnit.id,
      handoffType: 'split',
      clarityScore: clarity,
      seed,
      tick: currentTick,
      orderId: orderParams.id,
      packageId: parentPackage.id,
    }))

    parentPackage.handoffCount++
    parentPackage.coordinationCost += Math.max(0, Math.round(1 + (10 - clarity) / 3))
  }
  currentTick++

  // Create child packages for each cell
  const childPackages = fanoutWorkPackage(parentPackage, cellUnits.slice(0, fanoutCount).map((u) => u.id), currentTick)
  parentPackage.childPackageIds = childPackages.map((p) => p.id)

  // ---- Phase 3: Cell Leads assign workers and execute ----
  const allChildPackages = assignWorkersToPackages(childPackages, unitMap)

  for (const childPkg of allChildPackages) {
    childPkg.status = 'in_progress'
    currentTick++

    const cellUnit = unitMap[childPkg.assignedUnitId]
    const cellLead = cellUnit?.leadAgentId ? agentMap[cellUnit.leadAgentId] : undefined
    const cellWorkers = childPkg.workerAgentIds.map((id) => agentMap[id]).filter(Boolean)

    // Handoff: cell lead → each worker
    for (const worker of cellWorkers) {
      const clarity = cellLead?.profile.communication.handoffClarity ?? 7
      handoffEvents.push(recordHandoff({
        fromUnitId: childPkg.assignedUnitId,
        toUnitId: worker.assignedUnitId,
        handoffType: 'assign',
        clarityScore: clarity,
        seed,
        tick: currentTick,
        orderId: orderParams.id,
        packageId: childPkg.id,
      }))
      childPkg.handoffCount++
      childPkg.coordinationCost += Math.max(0, Math.round(1 + (10 - clarity) / 3))
    }

    // Each worker generates an artifact
    for (const worker of cellWorkers) {
      const wpRng = mulberry32(seed + currentTick * 1009 + worker.id.length)
      const art = generateWorkerArtifact(wpRng, {
        packageId: childPkg.id,
        orderId: orderParams.id,
        agentId: worker.id,
        engineering: worker.profile.capability.engineering,
        evidenceReasoning: worker.profile.capability.evidenceReasoning,
        speedBias: worker.profile.workStyle.speedBias,
        qualityBias: worker.profile.workStyle.qualityBias,
        claimCalibration: worker.profile.evidenceDiscipline.claimCalibration,
        overclaimTendency: worker.profile.evidenceDiscipline.overclaimTendency,
        tick: currentTick,
      })

      allArtifacts[art.id] = art
      childPkg.artifactIds.push(art.id)
      currentTick++
    }

    childPkg.status = 'completed'
    childPkg.completedAtTick = currentTick
  }

  // ---- Phase 4: Cell Leads merge worker artifacts ----
  const cellFinalArtifacts: OrgArtifact[] = []

  for (const childPkg of allChildPackages) {
    currentTick++
    const cellUnit = unitMap[childPkg.assignedUnitId]
    const cellLead = cellUnit?.leadAgentId ? agentMap[cellUnit.leadAgentId] : undefined
    const cellArtifacts = collectArtifacts([childPkg], allArtifacts)

    if (cellArtifacts.length === 0) continue

    const mergeRng = mulberry32(seed + currentTick * 1009)
    const merged = mergeArtifacts(
      cellArtifacts,
      {
        mergeJudgment: cellLead?.profile.leadership?.mergeJudgment ?? 5,
        handoffClarity: cellLead?.profile.communication.handoffClarity ?? 5,
        synthesis: cellLead?.profile.capability.synthesis ?? 5,
      },
      orderParams.id,
      childPkg.id,
      currentTick,
      mergeRng
    )

    allArtifacts[merged.id] = merged
    cellFinalArtifacts.push(merged)

    // Handoff: cell lead merge → operations for review
    handoffEvents.push(recordHandoff({
      fromUnitId: childPkg.assignedUnitId,
      toUnitId: opsUnit.id,
      handoffType: 'merge',
      clarityScore: cellLead?.profile.communication.summaryQuality ?? 7,
      seed,
      tick: currentTick,
      orderId: orderParams.id,
      packageId: childPkg.id,
    }))
    parentPackage.handoffCount++
    parentPackage.coordinationCost += 1
    currentTick++
  }

  // ---- Phase 5: Operations Lead selects final artifact ----
  currentTick++
  const finalSelectRng = mulberry32(seed + currentTick * 1009)
  const finalArtifact = selectBestArtifact(
    cellFinalArtifacts,
    opsLead.profile.leadership?.mergeJudgment ?? 7,
    finalSelectRng
  )

  if (finalArtifact) {
    handoffEvents.push(recordHandoff({
      fromUnitId: opsUnit.id,
      toUnitId: 'client',
      handoffType: 'review',
      clarityScore: opsLead.profile.communication.summaryQuality ?? 7,
      seed,
      tick: currentTick,
      orderId: orderParams.id,
      packageId: parentPackage.id,
    }))
  }

  parentPackage.status = 'completed'
  parentPackage.completedAtTick = currentTick

  // ---- Compute Metrics ----
  const allArtifactsFlat = Object.values(allArtifacts)
  const totalWorkers = Object.values(agentMap).filter((a) => a.role === 'worker').length
  const activeWorkers = new Set<string>()
  for (const pkg of allChildPackages) {
    for (const wid of pkg.workerAgentIds) activeWorkers.add(wid)
  }
  const leadAgents = Object.values(agentMap).filter((a) => a.role !== 'worker')
  const activeLeads = leadAgents.filter((l) => {
    const unit = unitMap[l.assignedUnitId]
    return unit && opsUnit.childUnitIds.includes(unit.id)
  })

  const detectedOverclaimFindings = allArtifactsFlat.filter((a) => a.overclaimGap > 1).length
  const latentRiskEstimate = allArtifactsFlat.reduce((sum, a) => sum + a.overclaimGap * 0.4, 0)

  const metrics: OrgRunMetrics = {
    fanoutCount: fanoutCount,
    subtaskCount: allChildPackages.length,
    handoffCount: handoffEvents.length,
    coordinationCost: calculateCoordinationCost(handoffEvents) + parentPackage.coordinationCost,
    mergeDelay: currentTick - 2, // ticks spent in merge/selection phases
    leadUtilization: calculateLeadUtilization(allChildPackages.length, opsUnit.spanOfControl),
    workerUtilization: calculateWorkerUtilization(activeWorkers.size, totalWorkers),
    bottleneckUnitId: findBottleneckUnit(allChildPackages, unitMap),
    artifactDiversity: computeArtifactDiversity(allArtifactsFlat),
    parallelWaste: estimateParallelWaste({
      workerCount: activeWorkers.size,
      mergeJudgment: opsLead.profile.leadership?.mergeJudgment ?? 5,
      handoffClarity: opsLead.profile.communication.handoffClarity ?? 5,
    }),
    finalQuality: finalArtifact?.quality ?? null,
    finalEvidenceStrength: finalArtifact?.evidenceStrength ?? null,
    finalClaimLevel: finalArtifact?.claimLevel ?? null,
    overclaimGap: finalArtifact?.overclaimGap ?? null,
    detectedOverclaimFindings,
    latentRiskEstimate: Math.round(latentRiskEstimate * 100) / 100,
    evidenceIntegrityDelta: finalArtifact
      ? Math.round((finalArtifact.evidenceStrength - finalArtifact.claimLevel) * 10) / 10
      : 0,
    totalTicks: currentTick,
    artifactsProduced: allArtifactsFlat.length,
  }

  return {
    seed,
    orderId: orderParams.id,
    orderTitle: orderParams.title,
    orderComplexity: orderParams.complexity,
    mode: 'hierarchical',
    finalArtifactId: finalArtifact?.id ?? null,
    artifactIds: Object.keys(allArtifacts),
    workPackageIds: [parentPackage.id, ...allChildPackages.map((p) => p.id)],
    handoffEvents,
    metrics,
  }
}

// ============================================================
// Comparison Runner
// ============================================================

export interface OrgComparison {
  seed: number
  orderId: string
  orderTitle: string
  orderComplexity: number
  flat: OrgRunResult
  hierarchical: OrgRunResult
  deltas: {
    qualityDelta: number | null
    evidenceDelta: number | null
    claimDelta: number | null
    overclaimGapDelta: number | null
    coordinationCostDelta: number
    handoffCountDelta: number
    tickDelta: number
    artifactCountDelta: number
    latentRiskDelta: number
    detectedFindingsDelta: number
  }
}

/**
 * Run both flat and hierarchical scenarios and compare.
 */
export function compareOrgScenarios(
  seed: number,
  orderParams: { id: string; title: string; complexity: number }
): OrgComparison {
  const flat = runFlatOrgScenario(seed, orderParams)
  const hierarchical = runHierarchicalOrgScenario(seed + 1, orderParams)

  const delta = (a: number | null, b: number | null): number => {
    if (a === null || b === null) return 0
    return Math.round((b - a) * 100) / 100
  }

  return {
    seed,
    orderId: orderParams.id,
    orderTitle: orderParams.title,
    orderComplexity: orderParams.complexity,
    flat,
    hierarchical,
    deltas: {
      qualityDelta: delta(flat.metrics.finalQuality, hierarchical.metrics.finalQuality),
      evidenceDelta: delta(flat.metrics.finalEvidenceStrength, hierarchical.metrics.finalEvidenceStrength),
      claimDelta: delta(flat.metrics.finalClaimLevel, hierarchical.metrics.finalClaimLevel),
      overclaimGapDelta: delta(flat.metrics.overclaimGap, hierarchical.metrics.overclaimGap),
      coordinationCostDelta: hierarchical.metrics.coordinationCost - flat.metrics.coordinationCost,
      handoffCountDelta: hierarchical.metrics.handoffCount - flat.metrics.handoffCount,
      tickDelta: hierarchical.metrics.totalTicks - flat.metrics.totalTicks,
      artifactCountDelta: hierarchical.metrics.artifactsProduced - flat.metrics.artifactsProduced,
      latentRiskDelta: delta(flat.metrics.latentRiskEstimate, hierarchical.metrics.latentRiskEstimate),
      detectedFindingsDelta: hierarchical.metrics.detectedOverclaimFindings - flat.metrics.detectedOverclaimFindings,
    },
  }
}

// ============================================================
// Helpers
// ============================================================

function findBottleneckUnit(
  packages: WorkPackage[],
  unitMap: Record<string, OrgUnit>
): string | null {
  if (packages.length === 0) return null

  // Bottleneck = unit whose packages took the most coordination cost
  const unitCosts: Record<string, number> = {}
  for (const pkg of packages) {
    unitCosts[pkg.assignedUnitId] = (unitCosts[pkg.assignedUnitId] || 0) + pkg.coordinationCost
  }

  let maxCost = 0
  let bottleneckId: string | null = null
  for (const [unitId, cost] of Object.entries(unitCosts)) {
    if (cost > maxCost) {
      maxCost = cost
      bottleneckId = unitId
    }
  }

  return bottleneckId
}
