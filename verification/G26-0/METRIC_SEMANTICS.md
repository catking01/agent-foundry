# G26-0: Metric Semantics, Agent Profile Schema & Org Role Naming

## Gate Verdict: PASS — SEALED

## Date: 2026-06-16

## Purpose

G26-0 is the schema/semantics preparation gate before implementing hierarchical organization simulation (G26). It addresses three foundational issues discovered during G25-S1:

1. **Metric semantics confusion**: `overclaimFindings` counts detected findings, not actual risk
2. **Agent model too flat**: Current Agent model has only basic skill scores — insufficient for organization research
3. **Org naming unplanned**: Need separate research-model names and UI display names for hierarchy roles

## What Was Created

### 1. Metric Semantics (`src/sim/metricSemantics.ts`)

13 metrics defined with semantic categories:

| Category | Metrics | Meaning |
|----------|---------|---------|
| DETECTION | overclaimFindings, validationFailures, auditFailures | What audit/validation FOUND |
| ACTUAL | evidenceIntegrityEnd, reputationEnd | True underlying state |
| OUTCOME | ordersCompleted, gameOverRate, missedDeadlines, majorIncidents, cashEnd | End-state results |
| COST | totalSalaries, totalMaintenance, parallelRouteSpend, coordinationCost | Resource expenditure |
| EXPOSURE | auditCoverageRate, undetectedOverclaimExposure | Estimated latent risk |

Key insight documented:
> `overclaimFindings` = count of AUDIT_COMPLETED events where reason includes "Overclaim". More audit → more findings. A low value with low audit coverage indicates undetected risk, not safety.

### 2. Agent Profile Schema (`src/sim/agentProfiles.ts`)

6 profile dimensions extending the gameplay Agent model:

- **CapabilityProfile**: 5 core skills + 5 meta-cognitive skills + domain specialization
- **WorkStyleProfile**: speedBias, qualityBias, explorationBias, riskAversion, consistency, initiative, patience
- **EvidenceDisciplineProfile**: claimCalibration, citationDiscipline, uncertaintyReporting, failureDisclosure, hiddenFailureRisk, overclaimTendency
- **CommunicationProfile**: handoffClarity, summaryQuality, escalationJudgment, asksForHelp, instructionFollowing, contextRetention
- **LeadershipProfile**: delegationSkill, mergeJudgment, bottleneckAwareness, conflictResolution, reviewStrictness, spanOfControl (null for workers)
- **AgentStateProfile**: fatigue, morale, load, recentFailures, trustScore, calibrationScore

### 3. Agent Profile Presets (`src/data/agentProfilePresets.ts`)

6 presets for scenario testing:
- `fast_executor` (worker): Speed-first, high overclaim risk
- `careful_validator` (worker): Thorough, high evidence discipline
- `creative_engineer` (worker): Exploratory, moderate risk
- `reliable_auditor` (worker): Conservative, strong risk assessment
- `balanced_cell_lead` (cell_lead): Good delegation, fair review, span 5
- `hands_off_workshop_lead` (workshop_lead): Heavy delegation, may miss issues

### 4. Org Role Definitions (`src/sim/orgRoles.ts`)

5-level hierarchy with Chinese/English display names:

| Role | 中文 | English | Level | Span |
|------|------|---------|-------|------|
| worker | 执行员 | Worker | 0 | 0 |
| cell_lead | 小组长 | Cell Lead | 1 | 5 |
| workshop_lead | 车间长 | Workshop Lead | 2 | 4 |
| department_lead | 部门主管 | Department Lead | 3 | 3 |
| operations_lead | 运营主管 | Operations Lead | 4 | 2 |

Includes: role descriptions, subordinate/superior queries, span of control defaults.

## What Was NOT Changed

- No core simulation behavior changed
- No gameplay pipeline modified
- No Ollama integration
- No real LLM calls
- No existing types modified
- ResearchAgentProfile is additive — existing Agent model unchanged

## Test Results

```
Test Files: 44 passed (44) — 3 new
Tests:      309 passed | 12 skipped (321) — 45 new
Result:     ALL GREEN
```

New test files:
- `tests/sim/metricSemantics.test.ts` (9 tests)
- `tests/sim/agentProfiles.test.ts` (14 tests)
- `tests/sim/orgRoles.test.ts` (22 tests)
