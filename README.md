# 群智工坊：Agent Foundry

An AI Company Simulation Game — a deterministic browser-based management simulation
where you run an AI company with simulated AI employees, workshops, task pipelines,
validation, audit, and delivery.

## What It Is

Agent Foundry is a **deterministic organization simulation sandbox**. You manage
a company of simulated AI agents that process customer orders through a pipeline
of workshops: Planning → Engineering → Validation → Audit → Delivery.

The game explores the structural relationships between multi-agent parallel routes,
artifact quality, evidence integrity, overclaim risk, and organizational trust.

## What It Is NOT

- ❌ NOT a real AI company runtime
- ❌ NOT real LLM agents (all agents are deterministic simulations)
- ❌ NOT validated against Runtime Lab
- ❌ NOT proof of real multi-agent research capability
- ❌ NOT connected to any external API or backend

## Quick Start

```bash
npm ci
npm run dev        # Start dev server at localhost:5173
npm run test       # Run all tests
npm run build      # Production build
```

## Optional: Local Ollama Shadow Audit

Agent Foundry supports an **optional** local LLM shadow semantic auditor
that evaluates artifacts alongside the deterministic audit pipeline.
It never mutates GameState, never affects delivery, and never changes
the replay hash.

```bash
# Requires local Ollama with a model loaded
AGENT_FOUNDRY_ENABLE_OLLAMA=1 npm run test:ollama
```

## Architecture

```
src/sim/     — deterministic simulation engine (types, tick, workshops, agents,
               artifacts, validation, audit, economy, replay, rng)
src/game/    — player actions, selectors, save/load
src/data/    — starter agents, workshops, orders, scenarios, strategies
src/ui/      — React components (Dashboard, OrderBoard, AgentPanel,
               DebuggerPanel, Agent HUD, Tutorial, Shadow Advisory)
src/ai/      — optional local Ollama shadow audit (never mutates GameState)
tests/       — unit + integration + balance + UI tests
```

## Tech Stack

React 18, TypeScript, Vite, Vitest, Recharts (debugger),
optional Ollama (localhost only, opt-in).

## Non-Claims

See [KNOWN_LIMITATIONS.md](verification/G22/KNOWN_LIMITATIONS.md) and
[verification/](verification/) for full traceability from G0 to G22.

## License

MIT
