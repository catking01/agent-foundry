# Research Report

## Current Stable Findings

- The repository root for implementation work is `agent-foundry/`.
- The project is a private React 18, TypeScript, Vite application with Vitest tests.
- Main commands are declared in `package.json`: `npm run dev`, `npm run build`, `npm run test`, `npm run test:watch`, `npm run test:ollama`, and `npm run test:shadow-benchmark`.
- Contributor guidance has been added in `AGENTS.md` based on inspected project files and recent commit history.
- `AGENTS.md` is 358 words and passed whitespace validation.
- Scoped pre-close hygiene passed for `AGENTS.md`, `.codex/research_record.md`, and `.codex/research_report.md`.
- G27-S1 machine-readable study artifacts have been generated for the deterministic flat-vs-hierarchy study.
- G27's actual matrix shape is documented as `8 seeds x 2 modes x 3 order classes x 3 concrete order instances per class = 144 runs`.
- `verification/G27/AGGREGATE_RECOMPUTE_CHECK.json` reports PASS for raw-matrix run count, coverage, missing combinations, and aggregate mean recomputation.
- G27-S1 validation passed locally: `npm run test` (46 files, 375 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with a chunk-size warning only.
- G28 organization intervention experiments have been implemented as a deterministic study layer linked to the G27-S1 hierarchical baseline.
- G28 matrix shape is `8 seeds x 3 representative orders x 6 interventions = 144 runs`.
- G28 intervention artifacts include raw matrix, aggregates, delta report, complexity breakdown, ranking, baseline linkage, risk semantics, findings, non-claims, test output, and build output.
- G28 validation passed locally: focused G28 tests (14 passed), `npm run test` (47 files, 389 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.
- G29 organization study UI has been implemented as a read-only Research tab over compact local G27/G28 summary data.
- G29 Research Dashboard shows deterministic study results, G27 flat-vs-hierarchy summary, G28 intervention ranking, delta metrics, complexity highlights, risk semantics, and non-claims.
- G29 validation passed locally: focused G29 tests (2 files, 8 passed), `npm run test` (49 files, 397 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.
- G30 organization policy search has been implemented as a deterministic research runner over 12 curated organization policies.
- G30 matrix shape is `12 policies x 8 seeds x 3 representative orders = 288 runs`.
- G30 artifacts include raw policy matrix, policy aggregates, objective rankings, order complexity breakdown, Pareto frontier, aggregate recompute check, search-space documentation, scoring-policy documentation, baseline linkage, sensitivity report, non-claims, test output, and build output.
- G30 validation passed locally: focused G30 tests (2 files, 13 passed), `npm run test` (51 files, 410 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.
- G31 policy search research UI has been implemented as a read-only Research dashboard section over compact local G30 summary data.
- G31 shows the G30 matrix shape, objective rankings, Pareto frontier, dominated policies, policy config details, order complexity breakdown, scoring policy, risk semantics, and non-claims.
- G31 validation passed locally: focused G31 tests (3 files, 23 passed), `npm run test` (53 files, 428 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.
- G31 CCA visible-mode executor attempts were made, but no accepted CCA worker result/completion receipt was produced; final implementation evidence is Codex local validation plus repository artifacts.
- G31 remote seal has been completed for implementation commit `c5916f412ce73c5e7c25e9b259d234411d4e4321`: `origin/main` was verified at that SHA after push.
- G31 remote-seal CCA audit task `G31-REMOTE-SEAL-T001` verified the local/remote SHA match and required G31 files; its late `worker_result.json` reported `status: done`, while the original Runtime receipt retained a `worker_result_missing` timing caveat.
- G31 remote-seal fresh validation passed after push: `npm run test` (53 files, 428 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-factory/` with the existing chunk-size warning.
- G32 public research demo release deployed the G31 Research UI to GitHub Pages for the current repository path.
- The old documented public URL `https://catking01.github.io/agent-factory/` is obsolete after the repository move; public smoke found GitHub Pages `Site not found` there.
- The active public research demo URL is `https://catking01.github.io/agent-foundry/`.
- G32 corrected the deployment build base from requested `/agent-factory/` to actual `/agent-foundry/` after verifying `origin` is `git@github.com:catking01/agent-foundry.git`.
- G32 `origin/gh-pages` was verified at `0b257cae23bb40b78812791fc3cd102805e3f82d` after the corrected deployment.
- G32 main-session validation passed: `npm run test` (53 files, 428 passed, 12 skipped), `npx tsc -b`, `npx vite build --base=/agent-factory/`, and corrected deployment build `npx vite build --base=/agent-foundry/`; Vite retained the existing chunk-size warning.
- G32 public smoke passed on `https://catking01.github.io/agent-foundry/?g32=0b257ca`: app load, first-run tutorial handling, Agent HUD, Orders tab, Research tab, Policy Search Dashboard, objective rankings, Pareto frontier, risk semantics, non-claims, and Debugger tab were observed.
- G32 CCA visible task `G32-CCA-RELEASE-T002` completed as auxiliary executor evidence with no P0 findings; Codex/main session retained final release authority.
- G32-S1 canonical URL consistency seal updated current-facing demo references to `https://catking01.github.io/agent-foundry/` and current build/deploy docs to `--base=/agent-foundry/`.
- G32-S1 updated balance export repo metadata from `catking01/agent-factory` to `catking01/agent-foundry`; this is metadata only and does not change deterministic simulation behavior.
- G32-S1 added migration notes to G23/G24 historical deployment/tag/smoke docs where old `agent-factory` URLs or build bases remain.
- G32-S1 validation passed locally: `npm run test` (53 files, 428 passed, 12 skipped), `npx tsc -b`, and `npx vite build --base=/agent-foundry/` with the existing chunk-size warning.
- G32-S1 CCA task `G32-S1-CANONICAL-URL-T001` generated a valid execution receipt/review/audit with no P0 findings; Codex main-session review applied an additional release-doc repair before final validation.

## Open Risks

- G27-S1 does not claim hierarchy is better than flat, does not generalize to real organizations, and does not use real LLM agents.
- G28 intervention transforms are deterministic research-layer model adjustments, not new real agent capabilities.
- G28 does not claim any intervention is better for real organizations.
- G29 is a static summary UI; it does not expose raw G27/G28 matrix downloads and does not generate new study runs.
- G29 does not claim real-world organization validity, real AI-agent capability, Runtime Lab validation, or production governance readiness.
- G30 searches a curated deterministic policy set, not an exhaustive organization-design space.
- G30 reports objective-specific rankings and Pareto frontier; it does not claim a single best real-world organization policy.
- G31 is a static summary UI; it does not expose the raw G30 288-run matrix in the browser bundle and does not generate new policy-search runs.
- G31 does not claim a real-world optimal organization policy, real AI-agent execution, Runtime Lab validation, Ollama participation, or production governance readiness.
- G31 remote seal does not start G32, deploy GitHub Pages, tag a release, or change public demo deployment state.
- The Vite build still reports the existing chunk-size warning for the main bundle.
- G32's public URL changed from the earlier `agent-factory` path to `agent-foundry` because the GitHub repository moved; old links to `/agent-factory/` are not verified as live.
- G32 does not change research logic, gameplay logic, G30/G31 results, or app source code; it is a release/deployment evidence milestone.
- G32 public smoke observed a non-blocking missing `favicon.ico`; no app asset or runtime-blocking console error remained after the corrected base-path deployment.
- Historical verification and raw-output files still contain `agent-factory` references by design; G32-S1 classifies them as historical, diagnostic, raw-output, or before/after explanation rather than current deployment guidance.
