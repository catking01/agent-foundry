# G32-S1: README URL Fix

**Task:** G32-S1-CANONICAL-URL-T001
**Date:** 2026-06-22

## Change

The public demo URL in `README.md` was updated from the obsolete
`agent-factory` path to the canonical `agent-foundry` path.

### Before
```markdown
在线试玩：

```
https://catking01.github.io/agent-factory/
```
```

### After
```markdown
在线试玩：

```
https://catking01.github.io/agent-foundry/
```
```

## Rationale

The repository was renamed from `agent-factory` to `agent-foundry`.
GitHub Pages serves from `https://<user>.github.io/<repo>/`, so the
URL changed with the rename. The old URL returns a 404.

The README is the primary user-facing document. It must point to the
correct, working public demo URL.

## Impact

- **Users**: Correct URL in documentation. No more 404s from README links.
- **Tests**: No impact (README is documentation, not tested code).
- **Build**: No impact.
- **Simulation**: No impact.
