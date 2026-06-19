# G28 Baseline Linkage To G27

G28 uses the G27-S1 deterministic hierarchical scenario runner as the baseline for each same-seed and same-order comparison.

## Baseline Commit

```text
G27-S1 commit: 771a58bda0321ae99482d44079eda30cbfb440d6
```

## Baseline Mapping

Each non-baseline G28 run stores `baselineId`, which points to the matching `baseline_hierarchical` run with the same:

- seed
- orderClass
- orderInstanceId

Delta metrics are computed only against that matching baseline row.

## Scope

G28 does not replace the G27 baseline. It adds deterministic intervention transforms on top of the baseline study record so intervention deltas can be recomputed from raw JSON.
