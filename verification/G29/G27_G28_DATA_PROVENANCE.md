# G29 Data Provenance

## Source Artifacts

G29 compact summaries are derived from sealed local evidence:

- `verification/G27/FLAT_VS_HIERARCHY_AGGREGATES.json`
- `verification/G28/INTERVENTION_AGGREGATES.json`
- `verification/G28/INTERVENTION_BY_ORDER_COMPLEXITY.json`
- `verification/G28/INTERVENTION_RANKING.json`

## Source Commits

```text
G27-S1: 771a58bda0321ae99482d44079eda30cbfb440d6
G28:    ad23f428806018f28631438e30888a51394ed955
```

## UI Data Shape

`src/data/orgStudySummaries.ts` stores compact static summaries only. It does not import raw 144-run matrices into the frontend bundle.

## Non-Claim

G29 displays sealed deterministic evidence. It does not create, mutate, recompute, or reinterpret G27/G28 study results.
