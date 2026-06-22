# G23 Deployment Checklist

Historical path before repository/path migration. Current canonical demo:
https://catking01.github.io/agent-foundry/

The `agent-factory` build base below is retained as G23 historical evidence,
not as current deployment guidance.

## Pre-deploy

- [x] `npm ci` passes
- [x] `npx tsc -b` passes
- [x] `npx vite build` produces `dist/` (636 modules, 587KB JS)
- [x] `npm run test` passes (40 files, 253 tests)
- [x] README is accurate
- [x] Non-claims and known limitations committed

## Deploy options

### GitHub Pages (recommended)

```bash
npx vite build --base=/agent-factory/
# Deploy dist/ to gh-pages branch or configure Pages in repo settings
```

### Any static host

```bash
npx vite build
# Serve dist/ with any static file server
```

## Post-deploy smoke test

- [ ] App loads without console errors
- [ ] Dashboard tab visible
- [ ] Tutorial checklist visible on first load
- [ ] Agent HUD visible (bottom-right)
- [ ] Accept an order from Orders tab
- [ ] Advance ticks (agents work, artifacts produced)
- [ ] First order delivers
- [ ] Debugger tab loads and runs explainRun
- [ ] No network errors (no Ollama required)

## Ollama opt-in

- [ ] `AGENT_FOUNDRY_ENABLE_OLLAMA=1 npm run test:ollama` works if Ollama is installed locally
- [ ] Shadow audit never called from browser
