# Codex Plan for G32-CCA-RELEASE-T002

## Objective
G32 public research demo release evidence: create verification/G32 release artifacts and run local validators for the sealed G31 Research UI without modifying app source, research results, gameplay, or deployment refs

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
