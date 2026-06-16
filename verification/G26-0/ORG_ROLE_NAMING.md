# G26-0 Organization Role Naming

## Date: 2026-06-16

## Naming Convention

Internal enum (`OrgRole`) uses English identifiers. UI uses Chinese display names.

| Internal ID | 中文 (UI) | English (UI) | Level | Reports To |
|-------------|-----------|---------------|-------|------------|
| `worker` | 执行员 | Worker | 0 | cell_lead+ |
| `cell_lead` | 小组长 | Cell Lead | 1 | workshop_lead+ |
| `workshop_lead` | 车间长 | Workshop Lead | 2 | department_lead+ |
| `department_lead` | 部门主管 | Department Lead | 3 | operations_lead |
| `operations_lead` | 运营主管 | Operations Lead | 4 | (none) |

## Why Not Military Names

"小队长/中队长/大队长" was considered but rejected for UI because:
- Military connotations don't fit an AI company/workshop theme
- "车间长" maps naturally to the existing Workshop concept
- "部门主管" is standard corporate terminology
- "运营主管" clearly communicates top-level operations role

Research documentation may reference the hierarchy as:
```
worker → cell → workshop → department → operations
```

## Role Functions

- **执行员 (Worker)**: Executes concrete tasks. No management responsibility.
- **小组长 (Cell Lead)**: Manages 3-5 workers. Fan-out/merge node. Key coordination point.
- **车间长 (Workshop Lead)**: Manages multiple cells. Resource allocation, bottleneck mitigation.
- **部门主管 (Department Lead)**: Cross-workshop coordination. Strategic alignment.
- **运营主管 (Operations Lead)**: Top operations. Order intake, org structure, strategic resource allocation.
