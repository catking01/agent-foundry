# G25 Upgrade Feedback Report

## Status: PASS

## Before G25: The Dead Button Problem

The upgrade button in WorkshopMap was a textbook example of broken UX:

```tsx
<button className="small" disabled={state.cash < ws.upgradeCost}>
  {t('upgrade')} (${ws.upgradeCost})
</button>
```

Problems:
1. **No onClick handler** — button did nothing even when enabled
2. **No disabled reason** — player sees a greyed-out button with no explanation
3. **No max level** — no ceiling on upgrades
4. **No visual change on upgrade** — level badge existed but no indication of progress

## After G25: Complete Feedback Loop

### 1. Clickable Button
Button now dispatches `UPGRADE_WORKSHOP` action via `onDispatch` prop. Click → immediate state change.

### 2. Clear Affordability Feedback

| Scenario | What Player Sees |
|----------|-----------------|
| Can afford | Blue enabled button: "升级到 Lv.2 ($1,200)" |
| Can't afford | Grey disabled button + red text: "需要 $800" |
| Max level | Purple "Lv.5 MAX" badge + purple text: "已达最高等级" |

### 3. Visible Stat Changes

After upgrade, the workshop panel immediately shows:
- Level badge increments (Lv.1 → Lv.2)
- Capacity number increases (e.g., 3 → 4)
- Efficiency percentage increases (e.g., 100% → 110%)
- Maintenance cost increases (visible trade-off)
- New upgrade cost shown for next level

### 4. Ledger Confirmation

Each upgrade creates a `WORKSHOP_UPGRADED` event visible in the Ledger tab:
```
Tick N | WORKSHOP_UPGRADED | player → workshop-engineering
Details: { newLevel: 2, cost: 1200 }
```

### 5. Cash Deduction

Cash decreases immediately. Visible in Dashboard header and HUD.

### 6. Tutorial Integration

Tutorial checklist step 7: "升级一个车间" — guides player to discover upgrade after first delivery.

## Edge Cases Covered

| Edge Case | Behavior |
|-----------|----------|
| Not enough cash | Button disabled + red reason text |
| Max level (5) | Button hidden, purple MAX badge + message |
| Non-existent workshop | `applyPlayerAction` returns state unchanged |
| Multiple upgrades | Each increases cost by 1.5x, maintenance by 1.2x |
| Upgrade during auto-run | Works normally (state updates through reducer) |
| Replay determinism | Upgrade is a PlayerAction, fully replayable |
