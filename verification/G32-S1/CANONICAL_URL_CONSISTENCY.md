# G32-S1: Canonical URL Consistency Seal

**Task:** G32-S1-CANONICAL-URL-T001
**Date:** 2026-06-22
**Status:** Implemented with Codex post-CCA review repair

## Objective

Seal the canonical public demo URL `https://catking01.github.io/agent-foundry/`
across all current-facing documentation and source code. The repo was originally
named `agent-factory` and renamed to `agent-foundry`. This task ensures
consistency between the canonical repo name and all current-facing references.

## Changes Made

### 1. README.md — Public Demo URL
- **Before:** `https://catking01.github.io/agent-factory/`
- **After:** `https://catking01.github.io/agent-foundry/`
- **Rationale:** This is the primary user-facing documentation. The old URL
  returned 404 in G32 smoke evidence; the canonical URL is the correct one.

### 2. src/sim/balanceExport.ts — Repo Metadata String
- **Before:** `repo: 'catking01/agent-factory'`
- **After:** `repo: 'catking01/agent-foundry'`
- **Rationale:** The `BalanceExport` interface includes a `repo` field used as
  metadata in machine-readable balance exports. It should reflect the canonical
  repo name.

### 3. tests/sim/balanceExport.test.ts — Test Expectation
- **Before:** `expect(exp.repo).toBe('catking01/agent-factory')`
- **After:** `expect(exp.repo).toBe('catking01/agent-foundry')`
- **Rationale:** Test expectation must match the updated source code.

### 4. verification/G32/G32_RELEASE.md — Current Build Base
- **Before:** current build command listed `--base=/agent-factory/`
- **After:** current build command lists `--base=/agent-foundry/`
- **Rationale:** G32 is the current public release evidence. The old base is
  retained only as pre-migration evidence.

### 5. verification/G32/DEPLOYMENT_CHECKLIST.md — Current Deployment Path
- **Before:** local validator and deployment checklist mixed the old requested
  `/agent-factory/` base with the corrected `/agent-foundry/` base.
- **After:** current validator/deployment checklist uses `/agent-foundry/`.
- **Rationale:** Deployment instructions must not imply two current public demo
  paths.

### 6. G23/G24 Historical Migration Notes
- Added migration notes to G23/G24 public deployment/tag/smoke artifacts.
- The old commands and URLs remain as historical evidence, but each edited file
  now states the current canonical demo:
  `https://catking01.github.io/agent-foundry/`.

## Historical References (Retained)

Historical verification files from G7 through G32 retain `agent-factory`
references. These are historical evidence of the development timeline,
pre-migration build commands, or G32 migration diagnostics:

| Milestone | Files | Nature of Reference |
|-----------|-------|-------------------|
| G7.1 | 2 files | Remote repo URL |
| G8–G14 | 7 files | Remote repo URL |
| G19 | 1 file | Remote repo URL |
| G23–G24 | 5 files | Historical build/deploy commands with migration notes |
| G25-S1 | 1 file | Existing rename note |
| G27–G31 | 5 files | Historical build validation output |
| G32 | 9 files | Current migration diagnostics, raw outputs, and obsolete-path smoke evidence |
| G32-S1 | 4 files | This seal's before/after and scan explanations |

These files document the build commands, repo names, and URLs that were
correct at the time of generation, or explicitly explain the migration.
Raw historical output files were not rewritten. G23/G24 narrative files now
include a migration note where old paths remain.

See `URL_SCAN_REPORT.txt` for the complete catalog.

## Verification

### Test Suite
```
npm run test  →  53 files passed, 428 tests passed, 12 skipped
```

### TypeScript Check
```
npx tsc -b  →  Clean, no errors
```

### Production Build (Canonical Base)
```
npx vite build --base=/agent-foundry/  →  ✓ built in 2.00s
  645 modules transformed
  dist/index.html, dist/assets/index-*.css, dist/assets/index-*.js
```

### Balance Export Test
The balance export test (`tests/sim/balanceExport.test.ts`) now verifies:
- `generateBalanceExport()` returns `repo: 'catking01/agent-foundry'`
- All 5 tests pass, confirming the metadata string is correct and the
  export is valid JSON with all expected sections.

## Boundary Compliance

- ✅ No simulation behavior changed
- ✅ No research results altered
- ✅ No UI features modified
- ✅ No Ollama settings changed
- ✅ No G33 work started
- ✅ Only allowed write paths used
- ✅ Disallowed paths untouched

## Residual Risks

1. **Old bookmarks**: Users who bookmarked the old `/agent-factory/` URL will
   get a 404. GitHub Pages does not automatically redirect renamed repos.
   A manual redirect page or CNAME could be considered.

2. **External links**: Any external sites linking to the old URL will break.
   This is inherent to the repo rename and cannot be fixed from within the repo.

3. **Historical verification files**: old `agent-factory` strings remain in
   historical evidence and G32-S1 before/after explanations. This is by design,
   but could confuse new contributors if read without the G32-S1 context.
