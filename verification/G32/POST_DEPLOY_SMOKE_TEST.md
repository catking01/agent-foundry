# Post-Deploy Smoke Test

Status: PASS

Target URL: `https://catking01.github.io/agent-foundry/?g32=0b257ca`

## Required Checks

- [x] URL loads
- [x] Research tab visible
- [x] Policy Search Dashboard visible
- [x] Pareto frontier visible
- [x] Objective rankings visible
- [x] Risk semantics warning visible
- [x] Non-claims visible
- [x] Normal demo does not require Ollama
- [x] Normal demo does not require a backend
- [x] No blocking browser console errors

## Evidence

Playwright evidence:

- First corrected public app load: `verification/G32/playwright/public-app-load.yml`
- Research and Policy Search UI: `verification/G32/playwright/research-policy-search.yml`
- Orders tab: `verification/G32/playwright/orders-tab.yml`
- Debugger tab: `verification/G32/playwright/debugger-tab.yml`

Console note: one non-blocking `favicon.ico` 404 remained; no app asset 404 or
runtime-blocking console error remained after the `/agent-foundry/` base rebuild.
