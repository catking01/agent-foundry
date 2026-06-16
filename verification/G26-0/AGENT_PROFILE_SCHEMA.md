# G26-0 Agent Profile Schema

## Date: 2026-06-16

## Schema Architecture

The research agent profile (`ResearchAgentProfile`) has 6 dimensions:

```
ResearchAgentProfile
├── CapabilityProfile        (what the agent CAN do)
│   ├── Core: planning, engineering, validation, audit, delivery
│   ├── Meta: decomposition, synthesis, evidenceReasoning, errorDetection, riskAssessment
│   └── Domain: domainSkills (per-domain specialization)
├── WorkStyleProfile         (HOW the agent works)
│   └── speedBias, qualityBias, explorationBias, riskAversion,
│       consistency, initiative, patience
├── EvidenceDisciplineProfile (integrity of claims)
│   └── claimCalibration, citationDiscipline, uncertaintyReporting,
│       failureDisclosure, hiddenFailureRisk, overclaimTendency
├── CommunicationProfile     (handoff and collaboration quality)
│   └── handoffClarity, summaryQuality, escalationJudgment,
│       asksForHelp, instructionFollowing, contextRetention
├── LeadershipProfile | null (for lead roles only)
│   └── delegationSkill, mergeJudgment, bottleneckAwareness,
│       conflictResolution, reviewStrictness, spanOfControl
└── AgentStateProfile        (runtime state, changes during sim)
    └── fatigue, morale, load, recentFailures, trustScore, calibrationScore
```

## Relationship to Existing Agent Model

The existing `Agent` type in `src/sim/types.ts` remains the gameplay layer:
```ts
interface Agent {
  planning, coding, validation, auditing,
  creativity, reliability, speed, overclaimRisk,
  fatigue, specialization, status, currentTaskId
}
```

`ResearchAgentProfile` is the research extension — used by scenario runners and organization simulation, NOT by the gameplay UI yet. It adds:
- Meta-cognitive skills (decomposition, synthesis, evidence reasoning)
- Work style biases (not just raw skill)
- Evidence discipline (the core of Agent Foundry's research value)
- Communication quality (critical for hierarchy handoffs)
- Leadership (only for lead roles)
- Runtime state tracking (morale, calibration, trust)

## Factory Functions

- `createDefaultWorkerProfile()` — all defaults, leadership=null
- `createDefaultLeadProfile()` — all defaults, leadership populated
- `isLeadProfile(profile)` — type guard

## Presets

6 presets in `src/data/agentProfilePresets.ts`:
- 4 worker presets (fast, careful, creative, reliable)
- 2 lead presets (balanced cell lead, hands-off workshop lead)
