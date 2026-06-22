# G32 Local Release Evidence

Verdict: LOCAL VALIDATION PASS / public deployment evidence recorded separately

## Milestone

G32 marks the public research demo release path for Agent Foundry. This file
records local validation evidence for the sealed G31 Research UI. Public
deployment and browser smoke evidence are tracked in the other G32 artifacts.
The current canonical public demo is
`https://catking01.github.io/agent-foundry/`.

## Sealed G31 Baseline

- G31 implementation commit: `c5916f412ce73c5e7c25e9b259d234411d4e4321`
- G31 remote seal commit: `6c9c448aa7920f57af58931b4710280f95ae81ea`
- G31 pushed to `origin/main`: confirmed by `git ls-remote`
- G31 sealed by CCA task `G31-REMOTE-SEAL-T001`

## Release Validation

All required validators run against the sealed G31 Research UI baseline:

### Tests
- Command: `npx vitest run`
- Result: PASS
- 53 test files passed, 428 tests passed, 12 skipped.

### TypeScript
- Command: `npx tsc -b`
- Result: PASS
- Exit code 0, no diagnostic output.

### Build
- Command: `npx vite build --base=/agent-foundry/`
- Result: PASS
- 645 modules transformed, build completed in ~3s.
- Chunk-size warning is the existing Vite production warning (non-blocking).
- Historical note: the earlier requested `/agent-factory/` build-base check is
  retained only in `BUILD_OUTPUT_AGENT_FACTORY_BASE.txt` as pre-migration
  evidence. It is not the current deployment base.

### Hygiene
- Command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`
- Result: PASS
- No secrets detected, no suspicious paths, git diff clean.

## Included Research Features

- G28: Organization intervention experiments (read-only study dashboard)
- G29: Read-only org study research dashboard
- G30: Deterministic organization policy search (12 policies × 8 seeds × 3 order classes = 288 runs)
- G31: Policy search research UI (sealed, remote-pushed)

## G31 Research UI Scope

The G31 Research UI is read-only and provides:
- Objective rankings (speed, quality, risk reduction, coordination efficiency, balanced)
- Pareto frontier (8 frontier policies, 4 dominated)
- Order complexity breakdown (simple, medium, complex)
- Policy configuration details (12 curated policies)
- Scoring policy formulas
- Risk semantics distinction (detection vs. exposure)
- Data provenance from G30 local artifacts

## Boundary

G32 release verification does not claim:
- Real-world organization optimization
- Live AI agent execution in the demo
- Runtime Lab integration
- Ollama or external LLM participation
- GitHub Pages deployment completion from this file alone
- Exhaustive policy search
- That G30 deterministic results generalize

The release target is a research demo: a deterministic multi-agent organization
simulator with read-only study dashboards and policy search results. Final G32
deployment status is established by `G32_PUBLIC_RESEARCH_DEMO_RELEASE.md`,
`DEPLOYMENT_CHECKLIST.md`, and post-deploy smoke artifacts.
