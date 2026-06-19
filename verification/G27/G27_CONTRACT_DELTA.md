# G27 Contract Delta

## Verdict

The G27 implementation intentionally expands the original minimum study matrix.

## Original Contract

```text
8 seeds x 2 modes x 3 order classes = 48 runs
```

The original contract treated each order class as a single representative scenario.

## Implemented Matrix

```text
8 seeds x 2 modes x 3 order classes x 3 concrete order instances per class = 144 runs
```

The additional dimension is:

```text
orderClassInstanceIndex
```

Each complexity class has three concrete order instances:

- simple: complexity 1, 2, 3
- medium: complexity 4, 5, 6
- complex: complexity 7, 8, 9

## Why This Is A Superset

The 144-run matrix preserves the original seed, mode, and order-class coverage while replacing one representative order per class with three concrete orders per class. Aggregates are reported by:

- mode
- orderClass
- mode + orderClass
- order instance

## Audit Implication

G27 is not sealed by Markdown findings alone. The seal requires raw matrix JSON, aggregate JSON, complexity breakdown JSON, coordination cost curve JSON, and recompute evidence generated from the raw matrix.
