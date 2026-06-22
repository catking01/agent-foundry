# Research Tab Smoke Test

Status: PASS

Target URL: `https://catking01.github.io/agent-foundry/?g32=0b257ca`

Original requested URL `https://catking01.github.io/agent-factory/` returned
GitHub Pages `Site not found`; the repo has moved to `catking01/agent-foundry`.

## Checklist

- [x] Page loads on GitHub Pages
- [x] First-run tutorial is visible and dismiss state was handled
- [x] Agent HUD is visible
- [x] Orders tab opens
- [x] Research tab is visible
- [x] Research tab opens
- [x] Research dashboard shows organization research content
- [x] Debugger tab still loads
- [x] No blocking browser console errors

## Evidence

Playwright snapshots:

- `verification/G32/playwright/public-app-load.yml`
- `verification/G32/playwright/research-policy-search.yml`
- `verification/G32/playwright/orders-tab.yml`
- `verification/G32/playwright/debugger-tab.yml`

Only non-blocking console error observed after corrected deploy: missing
`https://catking01.github.io/favicon.ico`.
