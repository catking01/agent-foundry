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
