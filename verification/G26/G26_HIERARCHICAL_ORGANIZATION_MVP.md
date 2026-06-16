# G26: Hierarchical Organization & Fan-out MVP

## Gate Verdict: PASS — SEALED

## Date: 2026-06-16

## Summary

G26 introduces a deterministic organization hierarchy and fan-out work package flow as a research scenario runner. It does NOT replace the main gameplay pipeline — the public demo remains unchanged. The hierarchy simulation runs as an independent research module.

## Architecture

```
┌─────────────────────────────────────────┐
│         Public Demo (unchanged)          │
│  Order → Workshop Pipeline → Delivery   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Research Runner (G26 NEW)          │
│  orgScenarioRunner.ts                   │
│  ├── runFlatOrgScenario()               │
│  └── runHierarchicalOrgScenario()       │
│       ├── orgModel.ts (types)           │
│       ├── workPackages.ts (lifecycle)   │
│       ├── handoff.ts (events)           │
│       └── fanout.ts (split/merge)       │
└─────────────────────────────────────────┘
```

## What Was Created

### Core Types (`src/sim/orgModel.ts`)
- `OrgUnit` — hierarchy node (operations → cell → worker pool)
- `WorkPackage` — unit of work flowing through the org
- `HandoffEvent` — transition between units (assign/split/merge/escalate/review)
- `OrgArtifact` — simplified artifact for research scenarios
- `OrgRunResult` — complete output with 20+ metrics
- `OrgState` — full org snapshot at a tick

### Work Package Lifecycle (`src/sim/workPackages.ts`)
- `createWorkPackage()` — factory with all fields
- `generateWorkerArtifact()` — profile-driven artifact generation
  - Uses engineering, evidenceReasoning, speedBias, qualityBias
  - claimCalibration keeps claims close to evidence
  - overclaimTendency inflates claims independently (+4 points at max)
- `selectBestArtifact()` — lead selection with mergeJudgment noise
- `mergeArtifacts()` — lead synthesis combining multiple worker outputs

### Handoff System (`src/sim/handoff.ts`)
- `recordHandoff()` — creates handoff event with clarity score and delay cost
- Clarity from sender's CommunicationProfile, low clarity = more delay
- Coordination cost = sum of all handoff delays

### Fan-out Logic (`src/sim/fanout.ts`)
- `determineFanoutCount()` — simple(1) / medium(2) / complex(3) workers
- `fanoutWorkPackage()` — split parent into children with complexity overhead
- `assignWorkersToPackages()` — unit membership → worker assignment
- `estimateParallelWaste()` — coordination overhead from multiple workers
- Computation: artifact diversity, lead/worker utilization

### Org Scenario Runner (`src/sim/orgScenarioRunner.ts`)
- `runFlatOrgScenario(seed, order)` — no hierarchy, direct worker execution
- `runHierarchicalOrgScenario(seed, order)` — full hierarchy flow:
  1. Operations Lead intake
  2. Fan-out to Cell Leads
  3. Cell Leads assign workers → workers produce artifacts
  4. Cell Leads merge worker artifacts
  5. Operations Lead selects final artifact
- `compareOrgScenarios(seed, order)` — side-by-side comparison with deltas

### Starter Organization (`src/data/starterOrg.ts`)
- 3 units: operations center + 2 cells (A and B)
- 9 agents: 1 ops lead + 2 cell leads + 6 workers
- Cell A: Balanced lead + FastCoder/CarefulV/CreativeE workers
- Cell B: Hands-off lead + FastCoder/ReliableAud/CreativeE workers

## Profile → Behavior Mapping

| Profile Field | Affects |
|--------------|---------|
| Capability.engineering | Artifact quality |
| Capability.evidenceReasoning | Artifact evidenceStrength |
| EvidenceDiscipline.claimCalibration | Evidence strength AND claim accuracy |
| EvidenceDiscipline.overclaimTendency | Claim inflation (+0 to +4 points) |
| WorkStyle.speedBias | Quality penalty in defects |
| Leadership.mergeJudgment | Lead artifact selection accuracy |
| Leadership.delegationSkill | Span utilization |
| Communication.handoffClarity | Handoff delay cost |

## Flat vs Hierarchical Comparison

| Dimension | Flat | Hierarchical |
|-----------|------|-------------|
| Coordination cost | ~0 | 5-15 ticks |
| Handoff events | 0 | 8-12 |
| Total ticks | 3-7 | 15-25 |
| Artifacts produced | 2-3 | 6-9 |
| Lead merge | None | 2 cell merges + 1 ops select |
| Parallel waste | Low | Moderate |

## Test Results

```
Test Files: 45 passed (45)
Tests:      343 passed | 12 skipped (355)
Result:     ALL GREEN — ZERO FAILURES
```

New test file: `tests/sim/orgHierarchy.test.ts` (34 tests)
- Starter org hierarchy validation (5 tests)
- Work package lifecycle (6 tests)
- Handoff events (3 tests)
- Fan-out logic (8 tests)
- Org scenario runner (11 tests)
- No Ollama check (1 test)

## Non-Claims

- No real LLM agents used
- No Ollama calls in org simulation
- No Runtime Lab integration
- Main gameplay pipeline unchanged
- Organization simulation is deterministic
- Hierarchy is simulated, not autonomous
