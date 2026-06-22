# G32 Deployment Checklist

Status: DEPLOYED / PUBLIC SMOKE PASS

## Preconditions

- [x] G31 is sealed on `origin/main`.
- [x] Local repository starts at G31 remote seal commit
  `6c9c448aa7920f57af58931b4710280f95ae81ea`.
- [x] G32 scope is release/deployment only.
- [x] CCA visible auxiliary task attempted with task id
  `G32-CCA-RELEASE-T002`.

## Local Validators

- [x] `npm run test`
- [x] `npx tsc -b`
- [x] `npx vite build --base=/agent-factory/`
- [x] `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`

## Main Branch Release

- [x] G32 artifacts committed to `main`
- [x] `origin/main` updated to the G32 release evidence commit
- [x] Remote `main` ref verified during closeout

## GitHub Pages Deployment

- [x] Fresh `dist/` built with requested `/agent-factory/` base for validation evidence
- [x] Fresh `dist/` rebuilt with actual `/agent-foundry/` Pages base after repo-move detection
- [x] `gh-pages` temporary clone prepared
- [x] `dist/` copied to `gh-pages`
- [x] `gh-pages` commit created
- [x] `origin/gh-pages` pushed
- [x] Remote `gh-pages` ref recorded

## Public Smoke

- [x] Public URL loads at `https://catking01.github.io/agent-foundry/`
- [x] Research tab visible
- [x] Research tab opens
- [x] Policy Search Dashboard visible
- [x] Pareto frontier visible
- [x] Objective rankings visible
- [x] Risk semantics warning visible
- [x] Non-claims visible
- [x] Main gameplay dashboard loads
- [x] Agent HUD visible
- [x] Orders tab opens
- [x] Debugger tab loads
- [x] No blocking console errors
- [x] No Ollama/backend/external API required

## Release Tag

- [x] Tag decision recorded
- [x] No tag created in this run; `v0.2.0-research-rc.1` remains available for a later explicit release-tag step.
