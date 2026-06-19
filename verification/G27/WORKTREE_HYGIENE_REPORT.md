# G27 Worktree Hygiene Report

## Classification

- `AGENTS.md`: commit. This is a repository control/contributor guidance file.
- `.codex/research_record.md`: commit. This is the append-only local evidence ledger.
- `.codex/research_report.md`: commit. This is the current local research summary.

## Current Policy

These files should not be hidden through ignore rules or removed as cleanup. They are control/evidence files for this project.

## Seal Requirement

Before closing G27-S1, run:

```text
git status --short
~/.codex/bin/codex_preclose_hygiene.sh . --mode fast
```

The final response must explain any remaining status entries file by file.

## G27-S1 Hygiene Result

```text
~/.codex/bin/codex_preclose_hygiene.sh . --mode fast
result: PASS
warnings_present: false
scope: active baseline warning state only, not full repository cleanliness
```
