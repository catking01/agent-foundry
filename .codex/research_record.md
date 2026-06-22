# Research Record

## 2026-06-19 19:40:14 CST

- Task: create a repository contributor guide at `AGENTS.md`.
- Scope inspected: `README.md`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/`, `tests/`, recent Git commit subjects.
- Findings: project is a React 18 + TypeScript + Vite app; tests use Vitest, Testing Library for UI, and opt-in Ollama tests gated by `AGENT_FOUNDRY_ENABLE_OLLAMA=1`; source is organized by `sim`, `game`, `data`, `ui`, `ai`, `i18n`, and `styles`; recent commit subjects use milestone-style prefixes (`G27: ...`) and imperative fixes (`Fix ...`).
- Decision: generate a concise Markdown contributor guide tailored to the observed repository structure and scripts.
- Verification pending at write time: word count, Markdown diff check, Git status, hygiene gate.

## 2026-06-19 19:40:14 CST Validation Update

- `AGENTS.md` word count: 358 words, within the requested 200-400 word range.
- `git diff --check`: PASS.
- Scoped hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode scoped --paths AGENTS.md .codex/research_record.md .codex/research_report.md`.
- Scoped hygiene result: PASS for `AGENTS.md`, `.codex/research_record.md`, and `.codex/research_report.md`.
- Git status after writes: `AGENTS.md` and `.codex/` are new untracked files.

## 2026-06-19 20:38:54 CST

- Task: implement `G27-S1_MACHINE_READABLE_STUDY_ARTIFACT_SEAL`.
- Scope inspected: `src/sim/orgMultiSeedStudy.ts`, `src/sim/orgScenarioRunner.ts`, `src/sim/orgModel.ts`, `src/data/orgStudyOrders.ts`, `tests/sim/orgMultiSeedStudy.test.ts`, and `verification/G27/`.
- Finding: G27's actual matrix shape is `8 seeds x 2 modes x 3 order classes x 3 concrete order instances per class = 144 runs`; the extra dimension is `orderClassInstanceIndex`.
- Decision: treat 144 runs as a documented superset of the original 48-run minimum, not as a failed implementation, provided machine-readable artifacts and recompute evidence are present.
- Added evidence generator: `scripts/generateG27Artifacts.ts`.
- Added seal/export logic: `src/sim/orgStudyArtifactSeal.ts`.
- Added test coverage in `tests/sim/orgMultiSeedStudy.test.ts` for raw matrix shape, required flattened fields, aggregate recompute PASS, complexity breakdown, coordination curve coverage, and artifact completeness assertion.
- Generated artifacts: `ORG_MULTI_SEED_MATRIX.json`, `FLAT_VS_HIERARCHY_AGGREGATES.json`, `ORDER_COMPLEXITY_BREAKDOWN.json`, `COORDINATION_COST_CURVE.json`, `AGGREGATE_RECOMPUTE_CHECK.json`, `G27_CONTRACT_DELTA.md`, `RAW_MATRIX_SCHEMA.md`, `WORKTREE_HYGIENE_REPORT.md`, and `G27_SEAL_VERDICT.md`.
- Risk semantics update: `detectedOverclaimFindings` remains a detection metric; `latentRiskEstimate` remains the risk/exposure comparison metric; derived `auditCoverageRate` and `undetectedOverclaimExposure` are artifact-level proxies only.
- Validation: `npm run test` PASS with 46 test files passed, 375 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with chunk-size warning.
- Hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result: PASS with no warnings; scope statement is active baseline warning state only, not full repository cleanliness.

## 2026-06-19 21:02:08 CST

- Task: implement `G28_ORGANIZATION_INTERVENTION_EXPERIMENTS`.
- Scope inspected: G27-S1 memory event `G27-S1-771a58b`, `src/sim/orgScenarioRunner.ts`, `src/sim/orgStudyArtifactSeal.ts`, `src/data/orgStudyOrders.ts`, `src/data/starterOrg.ts`, and G27 verification artifacts.
- Work contract: deterministic research-runner intervention study only; no UI, no Ollama, no Runtime Lab, no main gameplay pipeline change, and no real-world organization claim.
- Design decision: G28 uses one representative order per complexity class and six interventions for a 144-run MVP: `8 seeds x 3 representative orders x 6 interventions`.
- Design decision: G28 applies deterministic intervention transforms to the matching G27 hierarchical baseline study record instead of changing the G26/G27 core runner.
- Added data definitions: `src/data/orgInterventions.ts`.
- Added study implementation: `src/sim/orgInterventionStudy.ts`.
- Added generator: `scripts/generateG28Artifacts.ts`.
- Added tests: `tests/sim/orgInterventionStudy.test.ts`, including matrix shape, baseline linkage, delta recomputation, intervention effect, risk semantics, aggregate, ranking, and artifact checks.
- Generated artifacts: `ORG_INTERVENTION_MATRIX.json`, `INTERVENTION_AGGREGATES.json`, `INTERVENTION_DELTA_REPORT.json`, `INTERVENTION_BY_ORDER_COMPLEXITY.json`, `INTERVENTION_RANKING.json`, `BASELINE_LINKAGE_TO_G27.md`, `INTERVENTION_RISK_SEMANTICS.md`, `INTERVENTION_FINDINGS.md`, `NON_CLAIMS.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Validation: focused G28 test PASS with 14 tests; `npm run test` PASS with 47 test files passed, 389 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with chunk-size warning.
- G28 source-only Ollama/network scan: PASS; no `ollama`, `AGENT_FOUNDRY_ENABLE_OLLAMA`, or `fetch(` references in G28 source/test/generator files.
- Hygiene command before staging: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result before staging: PASS with no warnings; note that untracked `verification/G28/` was skipped as a directory, so staged hygiene must be rerun before close.
- Staged hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Staged hygiene result: PASS with no warnings; scanned G28 source, tests, scripts, and `verification/G28` artifact files.

## 2026-06-19 22:51:00 CST

- Task: implement `G29_ORG_STUDY_UI_AND_RESEARCH_DASHBOARD`.
- Scope inspected: `src/App.tsx`, existing UI components/styles, G27/G28 verification artifacts, existing UI tests, and current `.codex` records.
- Work contract: read-only Research Dashboard only; no new organization simulation logic, no G27/G28 result changes, no main gameplay pipeline replacement, no Ollama, no external APIs, no Runtime Lab, and no real-world organization claim.
- Design decision: use compact static TypeScript summaries in `src/data/orgStudySummaries.ts` instead of browser-side external fetches or raw matrix bundling.
- Added UI: `src/ui/ResearchDashboard.tsx`.
- Updated navigation: `src/App.tsx` now includes a `Research` tab that renders the read-only dashboard.
- Added tests: `tests/data/orgStudySummaries.test.ts` and `tests/ui/ResearchDashboard.test.tsx`.
- Generated artifacts: `G29_ORG_STUDY_UI.md`, `RESEARCH_DASHBOARD_SCREENFLOW.md`, `G27_G28_DATA_PROVENANCE.md`, `RISK_SEMANTICS_UI_RECHECK.md`, `READ_ONLY_BOUNDARY_RECHECK.md`, `NON_CLAIMS.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Validation: focused G29 tests PASS with 2 test files and 8 tests; `npm run test` PASS with 49 test files passed, 397 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with the existing chunk-size warning.
- G29 source/data/test boundary scan: PASS; no `applyPlayerAction`, `onDispatch`, `setState`, `fetch(`, `ollama`, `AGENT_FOUNDRY_ENABLE_OLLAMA`, `PlayerAction`, or `GameState` references in the G29 source/data/test path.
- Non-claims preserved: deterministic simulator summaries only; no real organization proof, no real AI agents, no Runtime Lab validation, no production governance claim, and no claim that hierarchy or a G28 intervention is generally better in real organizations.
- Hygiene command before staging: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result before staging: PASS, but untracked `tests/data` and `verification/G29` directories were skipped as directories.
- Staged hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Staged hygiene result: PASS with no skipped paths; scanned G29 source, tests, evidence artifacts, and `.codex` records.

## 2026-06-20 15:40:51 CST

- Task: implement `G30_ORG_POLICY_SEARCH`.
- Scope inspected: G27/G28 organization study code, `src/data/orgStudyOrders.ts`, `src/data/orgInterventions.ts`, `src/sim/orgInterventionStudy.ts`, `src/sim/orgMultiSeedStudy.ts`, `src/sim/orgStudyArtifactSeal.ts`, G28 artifact generator, G28 tests, G29 evidence records, and local repository guidance.
- Project memory recall: no matching graph-memory events were returned for G27-S1 through G29, so local `.codex` records and repository artifacts were used as the verified evidence source.
- Work contract: deterministic policy search runner only; no UI, no new real LLM agents, no Ollama, no Runtime Lab, no main gameplay pipeline change, no public demo gameplay behavior change, and no real-world organization conclusion.
- TDD evidence: focused G30 tests were written first and initially failed because `src/data/orgPolicyConfigs.ts`, `src/sim/orgPolicySearch.ts`, and `src/sim/paretoFrontier.ts` did not exist.
- Added policy definitions: `src/data/orgPolicyConfigs.ts` with 12 curated policies and 5 scoring objectives.
- Added Pareto logic: `src/sim/paretoFrontier.ts` with dominance and frontier computation.
- Added policy search runner: `src/sim/orgPolicySearch.ts`, producing a 288-run matrix and derived aggregate/ranking/Pareto artifacts.
- Added generator: `scripts/generateG30Artifacts.ts`.
- Added tests: `tests/sim/orgPolicySearch.test.ts` and `tests/sim/paretoFrontier.test.ts`.
- Generated artifacts: `ORG_POLICY_SEARCH_MATRIX.json`, `POLICY_AGGREGATES.json`, `PARETO_FRONTIER.json`, `POLICY_RANKING_BY_OBJECTIVE.json`, `POLICY_BY_ORDER_COMPLEXITY.json`, `AGGREGATE_RECOMPUTE_CHECK.json`, `G30_ORG_POLICY_SEARCH.md`, `POLICY_SENSITIVITY_REPORT.md`, `SEARCH_SPACE.md`, `SCORING_POLICY.md`, `BASELINE_LINKAGE_TO_G28.md`, `NON_CLAIMS.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Artifact evidence: `ORG_POLICY_SEARCH_MATRIX.json` has 288 runs, 12 policies, 8 seeds, 3 order classes, 5 objectives, and `AGGREGATE_RECOMPUTE_CHECK.json` reports PASS.
- Validation: focused G30 tests PASS with 2 test files and 13 tests; `npm run test` PASS with 51 test files passed, 410 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with the existing chunk-size warning.
- G30 runtime/source boundary scan: PASS; no `fetch(`, `AGENT_FOUNDRY_ENABLE_OLLAMA`, AI import, or `ollama` reference in `src/data/orgPolicyConfigs.ts`, `src/sim/orgPolicySearch.ts`, or `src/sim/paretoFrontier.ts`; the artifact generator has no `fetch(` or Ollama environment switch.
- Non-claims preserved: deterministic simulator policy search only; no single best real-world organization policy, no real AI agents, no Runtime Lab validation, no public demo gameplay change, and detected overclaim findings remain a detection metric.
- Hygiene command before staging: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Hygiene result before staging: PASS, but untracked `verification/G30` was skipped as a directory.
- Staged hygiene command: `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast`.
- Staged hygiene result: PASS with no skipped paths; scanned G30 source, tests, generator, evidence artifacts, and `.codex` records.

## 2026-06-22 15:49:46 CST

- Task: implement `G31_POLICY_SEARCH_RESEARCH_UI`.
- Scope inspected: G30 verification artifacts, `src/data/orgPolicyConfigs.ts`, `src/ui/ResearchDashboard.tsx`, G29/G30 research records, and current UI/data tests.
- Work contract: read-only Research UI only; no new organization simulation logic, no G30 result changes, no main gameplay pipeline change, no Ollama, no external APIs, no Runtime Lab integration, and no real-world organization claim.
- CCA attempt: visible-mode Claude Code CLI / DeepSeek execution was attempted via CCA task IDs `G31-POLICY-SEARCH-UI-T001` and `G31-POLICY-SEARCH-UI-T002`.
- CCA result: T001 aborted and T002 failed to produce an accepted `worker_result.json`/completion receipt, so CCA was not counted as a successful external executor result.
- Fallback decision: Codex main session completed a local repair using the G30 artifacts as source of truth, after rejecting invented/normalized CCA-generated summary values.
- Added compact data summary: `src/data/policySearchSummaries.ts`, sourced from `verification/G30/POLICY_RANKING_BY_OBJECTIVE.json`, `PARETO_FRONTIER.json`, `POLICY_BY_ORDER_COMPLEXITY.json`, `SCORING_POLICY.md`, and `src/data/orgPolicyConfigs.ts`.
- Added UI: `src/ui/PolicySearchDashboard.tsx`, embedded under `src/ui/ResearchDashboard.tsx`.
- Added tests: `tests/data/policySearchSummaries.test.ts` and `tests/ui/PolicySearchDashboard.test.tsx`; updated `tests/ui/ResearchDashboard.test.tsx`.
- Generated artifacts: `verification/G31/G31_POLICY_SEARCH_RESEARCH_UI.md`, `POLICY_SEARCH_SCREENFLOW.md`, `G30_DATA_PROVENANCE.md`, `PARETO_FRONTIER_UI_RECHECK.md`, `SCORING_POLICY_UI_RECHECK.md`, `RISK_SEMANTICS_UI_RECHECK.md`, `READ_ONLY_BOUNDARY_RECHECK.md`, `NON_CLAIMS.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Validation: focused G31 tests PASS with 3 files and 23 tests; `npm run test` PASS with 53 files passed, 428 passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with the existing chunk-size warning.
- G31 boundary scan: PASS; no `fetch(`, `ollama`, `AGENT_FOUNDRY_ENABLE_OLLAMA`, `PlayerAction`, `GameState`, `applyPlayerAction`, `onDispatch`, or `setState` references in the G31 data/UI/test path.
- Non-claims preserved: deterministic simulator summary UI only; no real organization optimum, no real AI agents, no Runtime Lab validation, no Ollama participation, and no claim that a G30 policy is generally best for real organizations.

## 2026-06-22 17:37:02 CST

- Task: seal `G31_POLICY_SEARCH_RESEARCH_UI` remotely.
- Work contract: push existing G31 implementation commit only, verify remote, record seal evidence, do not start G32, do not change G31 implementation, do not call Ollama, do not alter public gameplay pipeline, and do not claim real-world organization conclusions.
- Local pre-push state: `git status --short` clean; `git rev-parse HEAD` = `c5916f412ce73c5e7c25e9b259d234411d4e4321`; recent log showed `c5916f4 G31: Add policy search research UI` on top of `7120112 G30: Add organization policy search`.
- Push command: `git push origin main`.
- Push result: PASS; remote updated `7120112..c5916f4 main -> main`.
- Remote confirmation: `git ls-remote origin main` returned `c5916f412ce73c5e7c25e9b259d234411d4e4321 refs/heads/main`.
- Required G31 file checks: PASS for `src/data/policySearchSummaries.ts`, `src/ui/PolicySearchDashboard.tsx`, `verification/G31/TEST_OUTPUT.txt`, and `verification/G31/BUILD_OUTPUT.txt`.
- CCA remote-seal audit: ran task `G31-REMOTE-SEAL-T001` through Runtime Kernel / Claude Code CLI / DeepSeek using visible mode and `cca_real_project_default`.
- CCA audit evidence: required remote-seal checks passed; worker later wrote `worker_result.json` with `status: done`; Claude-written audit/review reported clean audit, local HEAD equals remote main, required files exist, no Ollama/fetch/push/G32 boundary violation, and empty implementation diff.
- CCA timing caveat: Runtime's original execution receipt captured `status: worker_result_missing` before the late worker result was observed, so Codex records the CCA run as useful audit evidence with a receipt timing caveat, not as the sole source of PASS.
- Fresh post-seal validation: `npm run test` PASS with 53 files passed, 428 passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-factory/` PASS with the existing chunk-size warning.
- Seal verdict: G31 implementation commit `c5916f412ce73c5e7c25e9b259d234411d4e4321` is pushed and remotely verified; G31 remote seal is PASS. Seal evidence is recorded in this note and `verification/G31/REMOTE_SEAL.md`.

## 2026-06-22 20:20:00 CST

- Task: implement `G32_PUBLIC_RESEARCH_DEMO_RELEASE`.
- Starting state: local `main` and `origin/main` were at G31 remote seal commit `6c9c448aa7920f57af58931b4710280f95ae81ea`.
- Work contract: release and deployment evidence only; no app source changes, no tests/scripts changes, no G30/G31 research-result changes, no gameplay pipeline changes, no Ollama, no backend, no Runtime Lab integration into app code, no real-world organization conclusions, and no G33 work.
- CCA execution: attempted per user request using Runtime Lab CCA skill from `/Users/catking/Desktop/codex-runtime-lab`; headless task `G32-CCA-RELEASE-T001` was interrupted after the user requested visible Claude Code CLI; visible task `G32-CCA-RELEASE-T002` launched Agent View session `51412770`, wrote `worker_result.json` with `status: done`, and Runtime/Codex review reported no P0 findings.
- CCA boundary: auxiliary executor evidence only; CCA did not deploy, push, tag, or decide final PASS. Main session retained release authority.
- Local validation: `npm run test` PASS with 53 files passed, 428 tests passed, 12 skipped; `npx tsc -b` PASS; requested build `npx vite build --base=/agent-factory/` PASS with the existing chunk-size warning.
- Deployment correction: public smoke showed `https://catking01.github.io/agent-factory/` returned GitHub Pages `Site not found`; `git remote -v` confirmed `origin` is `git@github.com:catking01/agent-foundry.git`; the first `/agent-foundry/` deployment still referenced `/agent-factory/assets/...`, causing asset 404s.
- Corrected deployment: rebuilt with `npx vite build --base=/agent-foundry/`, redeployed to `gh-pages`, and verified `origin/gh-pages` at `0b257cae23bb40b78812791fc3cd102805e3f82d`.
- Public smoke: Playwright verified `https://catking01.github.io/agent-foundry/?g32=0b257ca` loads, first-run tutorial is visible/dismissible, Agent HUD is visible, Orders opens, Research opens, Policy Search Dashboard is visible, objective rankings are visible, Pareto frontier and dominated policies are visible, risk semantics and non-claims are visible, and Debugger opens.
- Console caveat: after corrected deployment, the only observed console error was a non-blocking `favicon.ico` 404; no app asset 404 or runtime-blocking browser console error remained.
- Hygiene: fast pre-close hygiene PASS with warnings for absolute local machine paths in generated CCA receipt/audit and captured test/hygiene output; no suspicious tmp/scratch/backup/dead paths in git status after `.runtime/` and `.playwright-cli/` were added to `.gitignore`.
- Artifacts: `verification/G32/` includes release notes, deployment checklist, local validator outputs, build manifests, gh-pages ref check, deployed URL, known limitations, public boundary recheck, post-deploy smoke evidence, and copied Playwright snapshots.
- Non-claims preserved: G32 does not prove a real-world optimal organization policy, validate Runtime Lab, implement real AI supervisors/workers, require Ollama, require a backend, or start G33.

## 2026-06-22 23:18:46 CST

- Task: implement `G32-S1_CANONICAL_URL_CONSISTENCY_SEAL`.
- Work contract: canonical URL consistency only; no simulation behavior changes, no research-result changes, no new UI features, no Ollama requirement, no Runtime Lab app integration, no G33 work, and no real-world organization claims.
- CCA execution: ran Runtime Lab CCA task `G32-S1-CANONICAL-URL-T001` through Claude Code CLI / DeepSeek with `cca_real_project_default`; Runtime generated execution receipt, review, audit, diff, and required-test summary with no P0 findings.
- CCA review caveat: the worker initially updated README and balance export metadata plus generated G32-S1 artifacts, but Codex main-session review found current G32 release/checklist docs still needed canonical-base cleanup; Codex applied a main-thread repair after CCA finished.
- Updated current-facing references: `README.md` online demo URL now uses `https://catking01.github.io/agent-foundry/`; `src/sim/balanceExport.ts` repo metadata now reports `catking01/agent-foundry`; `tests/sim/balanceExport.test.ts` expects the canonical repo metadata.
- Updated current G32 release docs: `verification/G32/G32_RELEASE.md` and `verification/G32/DEPLOYMENT_CHECKLIST.md` now use `npx vite build --base=/agent-foundry/` for the current public demo path; old `/agent-factory/` base is documented as historical migration evidence only.
- Historical traceability: G23/G24 deployment/tag/smoke docs retain old `agent-factory` commands/URLs but now include migration notes pointing to the current canonical demo `https://catking01.github.io/agent-foundry/`.
- Generated artifacts: `verification/G32-S1/CANONICAL_URL_CONSISTENCY.md`, `URL_SCAN_REPORT.txt`, `README_URL_FIX.md`, `DEPLOYMENT_PATH_RECHECK.md`, `TEST_OUTPUT.txt`, and `BUILD_OUTPUT.txt`.
- Validation: fresh `npm run test` PASS with 53 files passed, 428 tests passed, 12 skipped; `npx tsc -b` PASS; `npx vite build --base=/agent-foundry/` PASS with the existing chunk-size warning.
- URL scan evidence: `README.md`, `src/`, `tests/`, `package.json`, and `vite.config.ts` have no remaining `agent-factory` / `/agent-factory/` matches; G32 current release/checklist docs have no remaining current `github.io/agent-factory` or `--base=/agent-factory` references.
- Hygiene: staged `~/.codex/bin/codex_preclose_hygiene.sh . --mode fast` PASS with warnings for absolute local machine paths in CCA audit/receipt, research record, and test output; no skipped paths, no high-confidence secrets, and no suspicious tmp/scratch/backup/draft/dead paths. Scope is active baseline warning state only, not full repository cleanliness.
- CCA human gate: accepted using the user's initial task instruction to commit/push after validation as the task-scoped accept condition.
- Non-claims preserved: G32-S1 does not change deterministic simulation behavior, G30/G31/G32 research results, public gameplay capability, Ollama behavior, Runtime Lab validation status, or real-world organization conclusions.
