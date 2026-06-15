# G22 Release Candidate Checklist

## Build & Test

- [x] `npm ci` passes
- [x] `npx tsc -b` passes (no errors)
- [x] `npx vite build` passes (636 modules)
- [x] `npm run test` passes (40 files, 253 tests, 12 skipped)
- [x] No Ollama required for normal build or tests

## First-Run

- [x] Tutorial renders on first load
- [x] Tutorial can be dismissed (localStorage)
- [x] First order completes within 50 ticks (seed=42: tick 11)
- [x] First order delivers across seeds [1, 42, 99, 2026]

## Deterministic Boundaries

- [x] Tutorial does not mutate GameState
- [x] Agent HUD does not mutate GameState
- [x] Debugger panel does not mutate GameState
- [x] Shadow advisory does not mutate GameState
- [x] Replay hash unaffected by UI

## Ollama Boundaries (opt-in only)

- [x] Ollama requires `AGENT_FOUNDRY_ENABLE_OLLAMA=1`
- [x] Ollama never called from browser
- [x] Shadow audit is advisory only (shouldBlockDelivery=false)
- [x] Shadow audit does not affect replay hash

## Documentation

- [x] README exists
- [x] Non-claims documented
- [x] Known limitations documented
- [x] Milestone chain G0→G22 in verification/

## Known Issues

- [ ] Bundle size ~587KB (JS) — recharts adds ~370KB; future lazy-load recommended
- [ ] No real player playtest data
- [ ] Ollama shadow audit latency ~18s/case — not suitable for real-time
