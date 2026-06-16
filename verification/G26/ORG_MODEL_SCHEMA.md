# G26 Organization Model Schema

## Entity Relationships

```
OrgUnit (hierarchy node)
  ├── 1:1 leadAgentId → OrgAgent
  ├── 1:N memberAgentIds → OrgAgent[]
  ├── 1:N childUnitIds → OrgUnit[]
  └── 1:1 parentUnitId → OrgUnit

WorkPackage (unit of work)
  ├── 1:N childPackageIds → WorkPackage[]
  ├── 1:1 parentPackageId → WorkPackage
  ├── 1:N workerAgentIds → OrgAgent[]
  ├── 1:N artifactIds → OrgArtifact[]
  └── 1:1 assignedUnitId → OrgUnit

HandoffEvent (transition record)
  ├── 1:1 fromUnitId → OrgUnit
  └── 1:1 toUnitId → OrgUnit

OrgArtifact (worker output)
  └── 1:1 createdByAgentId → OrgAgent
```

## Hierarchy (starter)

```
unit-operations (operations_lead) [ops-lead]
  ├── unit-cell-a (cell_lead) [balanced-lead]
  │   ├── worker-1: FastCoder
  │   ├── worker-2: CarefulValidator
  │   └── worker-3: CreativeEngineer
  └── unit-cell-b (cell_lead) [hands-off-lead]
      ├── worker-4: FastCoder
      ├── worker-5: ReliableAuditor
      └── worker-6: CreativeEngineer
```

## Work Package Flow

```
parent WP (intake, ops unit)
  ├── child WP 1 (execution, cell-a)
  │   ├── worker artifacts × 3
  │   └── cell lead merge → merged artifact
  └── child WP 2 (execution, cell-b)
      ├── worker artifacts × 3
      └── cell lead merge → merged artifact
ops lead select → final artifact
```

## Handoff Types

| Type | From → To | Cost |
|------|----------|------|
| assign | Lead → Worker | 1 + (10-clarity)/3 |
| split | Ops → Cell Lead | 1 + (10-clarity)/3 |
| merge | Cell Lead → Ops | 1 + (10-clarity)/3 |
| escalate | Worker → Lead | 2 + (10-clarity)/2 |
| review | Lead → Client | 1 |
