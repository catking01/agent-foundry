# G21 UX Friction Report

## First-order completion flow

- Accept → tick 0: order accepted immediately
- Validation → tick 9: auto-pipeline validates artifacts
- Audit → tick 10: auto-pipeline audits artifacts
- Delivered → tick 11: order delivered automatically

**Assessment**: First order completes in ~11 ticks with no player intervention beyond accepting.
The auto-scheduler efficiently assigns agents to queued tasks. Friction is low for the happy path.

## Current friction points

| Issue | Severity | Mitigation |
|---|---|---|
| Tab discovery — new player may not know to click Orders tab | Medium | Tutorial hint says "Go to Orders tab" |
| Auto-run not obvious — player must click "Tick →" or "Auto" | Medium | Tutorial mentions "advance tick" implicitly via HUD |
| HUD collapse/expand not obvious | Low | HUD is always visible in collapsed state |
| Debugger panel may overwhelm new player | Low | Debugger is a separate tab, not in tutorial flow |

## Remaining UX work (future)

- Tab highlight/callout on first run
- "Advance tick" button pulse during tutorial
- HUD expand animation hint
- Bundle size optimization (587KB — lazy-load debugger + recharts)
