# Codex Plan for G31-REMOTE-SEAL-T001

## Objective
Read-only CCA audit for G31 remote seal: verify local HEAD c5916f412ce73c5e7c25e9b259d234411d4e4321, origin/main remote SHA, required G31 evidence files, read-only/no-Ollama/no-fetch boundary. Do not edit implementation, do not push, do not start G32.

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
