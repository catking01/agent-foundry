# G25 Core Gameplay Simplification & Upgrade Loop

## Gate Verdict: PASS

## Date: 2026-06-16

## Summary

G25 addresses the critical feedback that Agent Foundry is a strong research sandbox but a weak game. The core issues were:
1. Workshop upgrade button existed but did nothing (no onClick handler)
2. No upgrade feedback (no disabled reason, no level indicator)
3. First-screen complexity too high for new players
4. Tutorial didn't guide players to upgrade

## Changes Made

### 1. Workshop Upgrade End-to-End (FIXED)

**Root cause**: `UPGRADE_WORKSHOP` action was fully implemented in `actions.ts` (cash deduction, level/capacity/efficiency increase, ledger event) but `WorkshopMap.tsx` had no `onDispatch` prop and no onClick handler — the upgrade button was a dead disabled element.

**Fix**:
- Added `onDispatch` prop to `WorkshopMap`
- Wired onClick to dispatch `UPGRADE_WORKSHOP` action
- Added `MAX_LEVEL = 5` guard (both in UI and in `actions.ts`)
- Added disabled reason text: "已达最高等级" (max level) or "需要 $X" (need cash)
- Max-level workshops show purple "MAX" badge instead of disabled button
- Button text shows target level: "升级到 Lv.2 ($1,200)"

### 2. Tab Grouping (Core / Advanced)

Tabs now visually grouped:
- **Core**: Dashboard, Orders, Workshops, Agents (bold, primary position)
- **Advanced**: Tasks, Artifacts, Ledger, Debugger (smaller, after separator)

New players see 4 tabs instead of 8. Research features preserved behind Advanced group.

### 3. Tutorial Updates

- Added "升级一个车间" (Upgrade a workshop) step after delivery step
- Step checks `workshops.some(w => w.level >= 2)`
- Onboarding Phase 4 now mentions upgrading after earning money

### 4. i18n Keys Added

- `upgradeTo`, `maxLevelReached`, `needCash`, `notEnoughCash`
- `coreTabs`, `advancedTabs`
- `upgradeWorkshopStep`, `upgradeHint`

## Files Changed

| File | Change |
|------|--------|
| `src/ui/WorkshopMap.tsx` | Major: onDispatch, onClick, disabled reasons, max level |
| `src/App.tsx` | Pass onDispatch, tab grouping |
| `src/game/actions.ts` | Add max level guard |
| `src/i18n/translations.ts` | 8 new translation keys |
| `src/ui/TutorialChecklist.tsx` | Add upgrade step |
| `src/ui/OnboardingOverlay.tsx` | Mention upgrades in Phase 4 |
| `tests/game/workshopUpgrade.test.ts` | 11 new tests |

## Gate Checklist

- [x] Workshop upgrade works end-to-end
- [x] Upgrade deducts cash
- [x] Upgrade increases level
- [x] Upgrade increases capacity (+1 per level)
- [x] Upgrade increases efficiency (+0.1 per level)
- [x] Upgrade records ledger event (WORKSHOP_UPGRADED)
- [x] Upgrade button explains why disabled
- [x] Max level protection (level 5)
- [x] First-order completion enables at least one upgrade (starting cash 80000, cheapest upgrade 500)
- [x] Upgrade visibly changes workshop stats
- [x] Advanced tabs visually separated from Core
- [x] Tutorial includes upgrade step
- [x] 11/11 new tests pass
- [x] TypeScript compiles clean
- [x] Build passes
- [x] No deterministic boundary violation
- [x] No Ollama required

## Pre-existing Test Failures (NOT caused by G25)

- `longRunBalanceTuning.test.ts > speed-first overclaim findings remain higher than quality-first`
- `strategyDominance.test.ts > speed-first has higher overclaim risk than quality-first and balanced`

These are strategy balance tuning issues. quality-first is now finding MORE overclaims (45.5) than speed-first (27.25), which is a known tuning artifact. Not addressed in G25.
