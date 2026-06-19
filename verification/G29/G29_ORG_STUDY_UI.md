# G29: Org Study UI And Research Dashboard

## Verdict

```text
G29 Research Dashboard: PASS candidate
UI boundary: read-only
Data source: compact static summaries derived from sealed G27/G28 artifacts
```

## Implemented Surface

- Added a `Research` tab in `src/App.tsx`
- Added `src/ui/ResearchDashboard.tsx`
- Added compact summary data in `src/data/orgStudySummaries.ts`

## Visible Sections

- Deterministic study results
- G27 Flat vs Hierarchy
- G28 Intervention Ranking
- Delta metrics
- Order complexity breakdown
- Risk semantics
- Non-claims

## Validation Evidence

```text
npm run test: PASS
Test Files: 49 passed (49)
Tests: 397 passed | 12 skipped (409)

npx tsc -b: PASS

npx vite build --base=/agent-factory/: PASS
Build warning: chunk size over 500 kB after minification
```

## Boundary

The dashboard does not dispatch player actions, mutate game state, call Ollama, fetch external data, or generate new research results.
