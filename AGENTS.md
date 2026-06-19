# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the application code. Core deterministic simulation logic lives in `src/sim/`; player actions, selectors, and save/load helpers live in `src/game/`; seed data and scenario presets live in `src/data/`; React UI components live in `src/ui/`; optional local Ollama audit code lives in `src/ai/`; styles are in `src/styles/`; i18n support is in `src/i18n/`. Tests mirror these areas under `tests/sim/`, `tests/game/`, `tests/ui/`, and `tests/ai/`. Historical verification notes and run evidence belong in `verification/`.

## Build, Test, and Development Commands

- `npm ci`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server, usually at `http://localhost:5173`.
- `npm run build`: run TypeScript project checks and produce the Vite build in `dist/`.
- `npm run test`: run the Vitest suite once.
- `npm run test:watch`: run Vitest interactively during development.
- `npm run test:ollama`: run the opt-in local Ollama test with `AGENT_FOUNDRY_ENABLE_OLLAMA=1`.

## Coding Style & Naming Conventions

Use TypeScript with `strict` mode and React JSX. Follow the existing style: two-space indentation, single quotes, no semicolons, and named exports for shared helpers. Name React components in `PascalCase` (`DebuggerPanel.tsx`), tests as `*.test.ts` or `*.test.tsx`, and simulation utilities with descriptive camelCase filenames. Keep deterministic simulation code free of network calls and wall-clock randomness unless explicitly isolated.

## Testing Guidelines

Vitest is the test runner. Put focused tests beside the matching subsystem folder under `tests/`, and prefer deterministic seeds for simulation behavior. UI tests use Testing Library and `*.test.tsx`. Optional Ollama tests must stay opt-in and must not affect replay hashes or game state.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries, often with milestone prefixes such as `G27: Flat vs Hierarchy Multi-Seed Study` or direct fixes such as `Fix tutorial collapse button`. Keep commits scoped to one change. PRs should describe the user-visible change, list validation commands run, link related issues or verification notes, and include screenshots for UI changes.

## Security & Configuration Tips

Do not add backend dependencies or external API calls to core gameplay. Treat Ollama integration as local-only advisory behavior. Keep secrets out of the repository and use environment variables for opt-in local configuration.
