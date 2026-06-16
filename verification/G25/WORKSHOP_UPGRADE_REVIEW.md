# G25 Workshop Upgrade Review

## Status: PASS

## Pre-G25 State

The `UPGRADE_WORKSHOP` action existed in the codebase but was unreachable from the UI:

```tsx
// WorkshopMap.tsx — BEFORE
<button className="small" disabled={state.cash < ws.upgradeCost}>
  {t('upgrade')} (${ws.upgradeCost})
</button>
```

- No `onDispatch` prop on WorkshopMap
- No onClick handler
- Button permanently disabled (no action even if affordable)
- No explanation for disabled state
- No max level concept

## Post-G25 State

```tsx
// WorkshopMap.tsx — AFTER
<button
  className="small"
  disabled={!canUpgrade}
  onClick={() => onDispatch({
    type: 'UPGRADE_WORKSHOP',
    workshopId: ws.id,
    upgradeId: 'level',
    tick: state.tick,
  })}
>
  {t('upgradeTo')}{ws.level + 1} (${ws.upgradeCost.toLocaleString()})
</button>
{!canAfford && (
  <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 3 }}>
    {disabledReason}
  </div>
)}
```

## Upgrade Mechanics

| Property | Level 1 → 2 | Level 2 → 3 | ... | Level 4 → 5 |
|----------|-------------|-------------|-----|-------------|
| capacity | +1 | +1 | +1 | +1 |
| efficiencyBonus | +0.1 | +0.1 | +0.1 | +0.1 |
| upgradeCost | ×1.5 | ×1.5 | ×1.5 | ×1.5 |
| maintenanceCost | ×1.2 | ×1.2 | ×1.2 | ×1.2 |

Max level: 5

## Starting Workshop Costs

| Workshop | Level 1 Cost | After L1→2 | After L2→3 |
|----------|-------------|------------|------------|
| Delivery | $500 | $750 | $1,125 |
| Planning | $800 | $1,200 | $1,800 |
| Validation | $1,000 | $1,500 | $2,250 |
| Engineering | $1,200 | $1,800 | $2,700 |
| Audit | $1,500 | $2,250 | $3,375 |

Starting cash: $80,000 — player can afford at least one upgrade immediately.

## UI States

| State | Button | Badge | Message |
|-------|--------|-------|---------|
| Affordable, not max | "升级到 Lv.X ($Y)" (enabled) | Lv.X (blue) | — |
| Not affordable | "升级到 Lv.X ($Y)" (disabled) | Lv.X (blue) | "需要 $Z" (red) |
| Max level (5) | (hidden) | Lv.5 MAX (purple) | "已达最高等级" (purple) |

## Test Coverage

11 new tests in `tests/game/workshopUpgrade.test.ts`:
1. Deducts cash on upgrade
2. Increases workshop level
3. Increases capacity on upgrade
4. Increases efficiency on upgrade
5. Cannot upgrade without enough cash
6. Cannot upgrade past max level (5)
7. Records ledger event on upgrade
8. First-order completion enables at least one upgrade
9. Upgrade cost increases after each level
10. Maintenance cost increases after upgrade
11. Cannot upgrade non-existent workshop
