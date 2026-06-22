# Codex Plan for G32-S1-CANONICAL-URL-T001

## Objective
Implement G32-S1 canonical public demo URL consistency seal. Current public URL is https://catking01.github.io/agent-foundry/. Fix current-facing docs and repo metadata strings, mark retained old agent-factory references as historical in G32-S1 artifacts, generate verification/G32-S1/CANONICAL_URL_CONSISTENCY.md, URL_SCAN_REPORT.txt, README_URL_FIX.md, DEPLOYMENT_PATH_RECHECK.md, TEST_OUTPUT.txt, BUILD_OUTPUT.txt. Do not change simulation behavior, research results, UI features, Ollama settings, or start G33.

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
