# Policy Search UI Smoke Test

Status: PASS

Target URL: `https://catking01.github.io/agent-foundry/?g32=0b257ca`

## Checklist

- [x] Policy Search Dashboard visible
- [x] G30 matrix shape visible
- [x] Objective rankings visible
- [x] Pareto frontier section visible
- [x] Dominated policies visible
- [x] Scoring semantics visible
- [x] Risk semantics warning visible
- [x] Non-claims visible
- [x] UI is read-only
- [x] No Ollama required
- [x] No backend required
- [x] No external API call required

## Evidence

Playwright snapshot: `verification/G32/playwright/research-policy-search.yml`.

Observed content includes:

- `G30 runs: 288`
- `Objective rankings`
- `Pareto frontier`
- `Dominated policies: baseline_hierarchical, low_coordination, high_fanout, extra_lead`
- `Scoring policy`
- `Policy search risk semantics`
- `Non-claims`
