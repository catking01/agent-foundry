# G24-S1 Post-Deploy Smoke Test

## URL

https://catking01.github.io/agent-factory/

## Smoke checklist

- [x] URL loads (200 OK)
- [x] First-run tutorial checklist visible
- [x] Agent HUD visible (bottom-right)
- [x] Orders tab navigable
- [x] First order can be accepted
- [x] Ticks advance (agents work, artifacts produced)
- [x] First order delivers (~tick 11)
- [x] Debugger tab loads
- [x] No Ollama required
- [x] No backend required
- [x] Static files only (3 files, 588KB)

## Deploy reference

- gh-pages branch: 88e3d44
- Built with: `npx vite build --base=/agent-factory/`

## Boundaries

- All agents are deterministic simulations — no real LLM workers
- No network calls except static asset loading
- Ollama shadow audit is NOT available in browser (opt-in, Node.js only)
