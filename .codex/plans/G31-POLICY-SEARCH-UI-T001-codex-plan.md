# Codex Plan for G31-POLICY-SEARCH-UI-T001

## Objective
Implement G31_POLICY_SEARCH_RESEARCH_UI: add compact local G30 policy-search summaries and a read-only Policy Search Dashboard under the existing Research tab. Show deterministic policy search results, 12 x 8 x 3 = 288 matrix shape, objective rankings, Pareto frontier, policy config details, complexity breakdown, scoring policy, risk semantics warning, and non-claims. Do not add simulation logic, do not alter G30 results, do not mutate GameState or dispatch PlayerAction, do not call Ollama, fetch, or external APIs, and do not claim real-world organization conclusions.

## Plan
1. Confirm exact approved boundary before dispatch.
2. Delegate implementation to Claude Code CLI as a black-box external executor.
3. Allow Claude to use local internal planning, dynamic workflow, or fan-out if available, without granting final authority.
4. Collect Git diff, test evidence, command exits, policy events, and receipt hash.
5. Run Codex-style P0/P1 review over receipt + diff + tests + boundary.
6. Require explicit human accept/revert decision after Codex PASS.

## Execution contract
- executor: `claude-code-cli`
- Claude is a black-box executor; Claude does not decide PASS/FAIL.
- Codex review is the only source of truth for acceptance.
- Human accept/revert is required after Codex PASS.
- external LLM egress approved: `True`
