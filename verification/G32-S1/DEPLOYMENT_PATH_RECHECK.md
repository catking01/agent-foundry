# G32-S1: Deployment Path Recheck

**Task:** G32-S1-CANONICAL-URL-T001
**Date:** 2026-06-22

## Build Command

The canonical build command for GitHub Pages deployment is:

```bash
npx vite build --base=/agent-foundry/
```

This matches the repository name `agent-foundry` and produces assets
with the correct base path for `https://catking01.github.io/agent-foundry/`.

## Recheck Results

### 1. Vite Configuration
`vite.config.ts` does not hardcode a base path. The base is specified
at build time via the `--base` flag, which is the correct approach.

### 2. Build Output
```
vite v6.4.3 building for production...
✓ 645 modules transformed.
dist/index.html                   0.62 kB │ gzip:   0.43 kB
dist/assets/index-9pmxPkJx.css    5.84 kB │ gzip:   1.76 kB
dist/assets/index-YafLzsvl.js   641.06 kB │ gzip: 188.36 kB
✓ built in 2.00s
```

### 3. Generated index.html
The built `dist/index.html` references assets with the correct base path:
- `<script type="module" crossorigin src="/agent-foundry/assets/index-YafLzsvl.js">`
- `<link rel="stylesheet" crossorigin href="/agent-foundry/assets/index-9pmxPkJx.css">`

### 4. Historical Build Commands
Historical artifacts from G23-G31 and selected G32 migration diagnostics retain
`--base=/agent-factory/` as old evidence. Current G32 release/deployment docs
now use `--base=/agent-foundry/`; the old G32 requested-base build output is
kept only as pre-correction evidence.

## Path Consistency

| Component | Path | Status |
|-----------|------|--------|
| Repo name (GitHub) | `agent-foundry` | ✅ |
| package.json name | `agent-foundry` | ✅ |
| Vite build base | `/agent-foundry/` | ✅ |
| Public URL | `https://catking01.github.io/agent-foundry/` | ✅ |
| README URL | `https://catking01.github.io/agent-foundry/` | ✅ |
| balanceExport repo | `catking01/agent-foundry` | ✅ |

All paths are consistent with the canonical repo name.
