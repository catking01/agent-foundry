# G32 Public Research Demo Release

Status: PUBLIC DEPLOYMENT PASS / SMOKE PASS

## Objective

Deploy the sealed G31 Research tab to the public GitHub Pages demo and record
the release evidence for Agent Foundry as a playable plus research dashboard
demo.

## Baseline

- Local branch before G32: `main`
- Starting HEAD: `6c9c448aa7920f57af58931b4710280f95ae81ea`
- G31 implementation commit: `c5916f412ce73c5e7c25e9b259d234411d4e4321`
- G31 remote seal commit: `6c9c448aa7920f57af58931b4710280f95ae81ea`

## Scope

G32 is release and deployment work only. It does not add simulation logic,
change G30/G31 research results, change the main gameplay pipeline, call
Ollama, require a backend, or add browser external API calls.

## Local Validation

Main-session fresh validation on 2026-06-22:

- `npm run test`: PASS, 53 files passed, 428 tests passed, 12 skipped.
- `npx tsc -b`: PASS.
- `npx vite build --base=/agent-factory/`: PASS with the existing chunk-size warning; preserved as requested-base evidence.
- `npx vite build --base=/agent-foundry/`: PASS with the existing chunk-size warning; used for the current GitHub Pages deployment after confirming `origin` is `catking01/agent-foundry`.
- `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`: PASS with warnings from generated CCA receipt/audit absolute local paths.

CCA auxiliary validation task `G32-CCA-RELEASE-T002` ran in visible Agent View
mode and produced a Runtime receipt with no P0 findings. Codex/main session
remains final release authority.

## Deployment

Completed:

- Committed and pushed G32 release evidence to `main`.
- Built static demo with base `/agent-foundry/` for the current repository path.
- Deployed `dist/` to `gh-pages`.
- Verified `origin/gh-pages` at `0b257cae23bb40b78812791fc3cd102805e3f82d`.
- Verified public URL: `https://catking01.github.io/agent-foundry/`.

Path correction:

- The original G32 instruction referenced `https://catking01.github.io/agent-factory/`.
- Public smoke showed that URL returns GitHub Pages `Site not found`.
- `git remote -v` and push output confirm the repository has moved to `catking01/agent-foundry`.
- The first `/agent-foundry/` smoke found 404s for `/agent-factory/assets/...`; rebuilding with base `/agent-foundry/` fixed the public app.

## Public Smoke

Browser smoke verification:

- URL loads at `https://catking01.github.io/agent-foundry/?g32=0b257ca`.
- First-run tutorial visible and dismissed for tab smoke.
- Agent HUD visible.
- Orders tab opens.
- Research tab visible and opens.
- Policy Search Dashboard visible.
- Pareto frontier visible.
- Objective rankings visible.
- Risk semantics warning visible.
- Non-claims visible.
- Debugger tab loads.
- No Ollama, backend, or external API required for normal demo use.
- No blocking browser console errors. The only remaining console error observed after corrected deploy was `favicon.ico` 404.

Playwright snapshots:

- `verification/G32/playwright/public-app-load.yml`: corrected public app load.
- `verification/G32/playwright/research-policy-search.yml`: Research and Policy Search UI.
- `verification/G32/playwright/orders-tab.yml`: Orders tab.
- `verification/G32/playwright/debugger-tab.yml`: Debugger tab.

## Verdict

G32 public research demo release is PASS for the current repository path
`/agent-foundry/`. The old `/agent-factory/` URL is no longer valid after the
repository rename and is recorded as a corrected instruction boundary.
