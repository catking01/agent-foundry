# G31 Policy Search Research UI

Verdict: PASS / local Codex repair after CCA executor failure

## Scope

G31 exposes G30 deterministic organization policy search results in the read-only Research UI.

## Implemented

- Added compact local G30 policy search summary data in `src/data/policySearchSummaries.ts`.
- Added read-only `PolicySearchDashboard` UI in `src/ui/PolicySearchDashboard.tsx`.
- Embedded the policy search dashboard under `ResearchDashboard`.
- Added data and UI tests for matrix shape, rankings, Pareto frontier, scoring policy, risk semantics, non-claims, and read-only controls.

## Data Boundary

- Source artifacts: `verification/G30`.
- Source commit recorded in UI summary: `71201120ee00dde64ef125f830d786c59cd46d95`.
- Matrix shape shown in UI: `12 policies x 8 seeds x 3 representative order classes = 288 runs`.
- The browser UI imports compact static summaries only.
- The raw 288-run matrix is not loaded into the UI bundle.
- No new organization simulation logic was added.

## CCA Note

CCA visible-mode execution was attempted for this task, but both executor attempts failed to produce an accepted worker result/receipt. The final patch was completed and validated by Codex in the main workspace using the G30 local artifacts as the source of truth.

## Validation

- Focused tests: PASS, 3 files / 23 tests.
- Full test suite: PASS, 53 files / 428 passed / 12 skipped.
- TypeScript: PASS.
- Vite build: PASS with existing chunk-size warning.

## Non-Claims

- No real-world organization optimum is claimed.
- No live LLM worker, supervisor, or Runtime Lab capability is claimed.
- Pareto frontier is bounded to the deterministic G30 search space.
- Rankings are deterministic simulator scores, not real organization value functions.
