# G25 Complexity Reduction Report

## Status: PASS

## Problem

The game exposed 8 tabs to new players immediately:
```
Dashboard | Orders | Workshops | Agents | Tasks | Artifacts | Ledger | Debugger
```

This is overwhelming for a first-time player who just wants to run a company. The research features (Tasks, Artifacts, Ledger, Debugger) are valuable but shouldn't compete for attention with core gameplay.

## Solution: Core / Advanced Tab Grouping

### Visual Layout

```
[仪表盘] [订单] [车间] [AI 员工] │ ADVANCED [任务] [产出物] [事件日志] [调试器]
 ─────────── Core ───────────      ─────────── Advanced (smaller) ───────────
```

### Implementation

```tsx
// Core tabs — full size, primary position
{coreTabs.map(tab => <button className="tab">{tab.label}</button>)}

// Separator
<span>│</span>
<span>ADVANCED</span>

// Advanced tabs — smaller font, lower opacity
{advancedTabs.map(tab => <button className="tab" style={{fontSize: 11, opacity: 0.85}}>{tab.label}</button>)}
```

### Design Decisions

1. **Not hidden** — Advanced tabs remain visible and accessible. This isn't a paywall; it's information architecture.
2. **Visual hierarchy** — Core tabs get full size and prominence. Advanced tabs are smaller but still one click away.
3. **No feature removal** — All research/debugging capabilities preserved. This is pure UX, not feature cutting.
4. **i18n** — "ADVANCED" label uses `t('advancedTabs')` for Chinese ("高级") / English.

### Before / After

**Before**: 8 equal-weight tabs in a row
```
[仪表盘] [订单] [车间] [AI 员工] [任务] [产出物] [事件日志] [调试器]
```

**After**: 4 core + separator + 4 advanced (smaller)
```
[仪表盘] [订单] [车间] [AI 员工] │ 高级 [任务] [产出物] [事件日志] [调试器]
```

### What New Players See

On first load, the player's attention is naturally drawn to the 4 core tabs. The tutorial guides them through: Dashboard → Orders → Workshops → Agents. After they're comfortable with the basics, they can explore Advanced tabs at their own pace.

### What Researchers Still Have

All advanced features remain one click away: Tasks (pipeline detail), Artifacts (quality/evidence inspection), Ledger (event audit trail), Debugger (scenario analysis, shadow audit samples).
