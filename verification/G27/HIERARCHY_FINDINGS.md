# G27 Hierarchy Findings

## 6 Study Findings (from generateFindings)

1. **Coordination cost**: Hierarchy adds 5-15 tick coordination cost (HIGH confidence)
2. **Handoff events**: Hierarchy requires 6-14 formal handoffs (HIGH confidence)
3. **Quality comparison**: Hierarchy may improve quality for complex orders (MEDIUM confidence)
4. **Latent risk**: Hierarchy merge/select CAN reduce latent risk (MEDIUM confidence)
5. **Complex orders**: Hierarchy quality benefit most visible for complex orders
6. **Simple orders**: Hierarchy adds overhead without clear quality benefit (flat is better for simple)

## Efficiency Ratios

- `qualityPerCoordinationCost`: quality gained per tick of coordination overhead
- `riskAdjustedQuality`: quality minus latent risk estimate
- Simple orders have lower qualityPerCoordinationCost for hierarchy

## Recommendations for G28

- Test hierarchy benefit at different complexity levels (vary complexity 1-10)
- Test different lead profiles (high vs low mergeJudgment)
- Test different span of control (2 vs 4 vs 6 cells)
- Test adding/removing a cell lead as intervention
