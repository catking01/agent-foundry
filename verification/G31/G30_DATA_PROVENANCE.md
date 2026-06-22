# G30 Data Provenance For G31

## Source

G31 uses compact summaries derived from the local G30 artifacts:

- `verification/G30/POLICY_RANKING_BY_OBJECTIVE.json`
- `verification/G30/PARETO_FRONTIER.json`
- `verification/G30/POLICY_BY_ORDER_COMPLEXITY.json`
- `verification/G30/SCORING_POLICY.md`
- `verification/G30/NON_CLAIMS.md`
- `src/data/orgPolicyConfigs.ts`

The UI summary records source commit `71201120ee00dde64ef125f830d786c59cd46d95`.

## Shape

- Policies: 12
- Seeds: 8
- Representative order classes: 3
- Runs: 288
- Objectives: speed, quality, risk reduction, coordination efficiency, balanced

## Bundle Boundary

G31 does not import `verification/G30/ORG_POLICY_SEARCH_MATRIX.json` into the app. The UI only imports compact TypeScript summaries.

## No Runtime Loading

No external API, Ollama runtime path, browser fetch, or Runtime Lab integration is used by the G31 UI path.
