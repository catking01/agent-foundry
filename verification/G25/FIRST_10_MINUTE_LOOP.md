# G25 First 10-Minute Loop

## Status: IMPROVED (partial)

## Target Experience

The goal was:
```
接第一单 → agent 自动工作 → 交付 → 获得钱 → 升级 Engineering → 接第二单 → 明显更快
```

## What G25 Achieves

### Minute 0: Concept Onboarding (unchanged)
- 4-phase overlay explains: who you are, workshop pipeline, key metrics, ready for first order
- Player clicks "开始第一单"

### Minute 1: Accept Order (unchanged)
- Player goes to Orders tab, clicks "接单" on an available order
- Tutorial checklist tracks this as step 1

### Minutes 2-3: Watch Agents Work (unchanged)
- HUD shows agent activities
- Workshop loads update in real-time

### Minute 4: First Delivery (unchanged)
- Order completes, player gets cash reward
- Tutorial step 6 (delivery) completes

### Minute 5: Upgrade (NEW)
- Tutorial step 7 appears: "升级一个车间"
- Player goes to Workshops tab
- Upgrade button now WORKS — shows "升级到 Lv.2 ($1,200)"
- Player clicks, cash deducted, workshop level/capacity/efficiency increase
- Step completes when any workshop reaches level 2

### Minutes 6-10: Second Order (improved)
- Player accepts second order
- Upgraded workshop handles tasks faster (more capacity, better efficiency)
- The improvement is visible in the Workshop load bars

## Remaining Gaps

1. **No explicit comparison UI**: Player can't easily compare "before upgrade" vs "after upgrade" throughput without paying close attention
2. **Upgrade visual effect**: No animation or celebration on upgrade — just stat changes
3. **First order is still not guaranteed to be simple**: The player can accept any order, including the complex research paper one
4. **No guided "which workshop to upgrade" recommendation**: Tutorial says "建议先升级工程或规划" but doesn't prevent upgrading Delivery first

## Recommendations for G26

- Add a "教学订单" (tutorial order) that's always available first and extra simple
- Add a subtle animation/flash on upgrade
- Add a "before/after" comparison toast or panel on upgrade
- Consider locking complex orders until first delivery completes
