# Agent Foundry v0.1.0-rc.1 Release Notes

## About

Agent Foundry is a deterministic browser-based AI-company organization simulation
sandbox. You manage simulated AI employees, workshops, task pipelines, validation,
audit, and delivery — exploring the structural relationships between multi-agent
parallel routes, artifact quality, evidence integrity, and organizational trust.

**This is NOT a real AI runtime.** All agents are deterministic simulations.
An optional local Ollama shadow auditor provides advisory semantic evaluation
but never affects game state, delivery, or replay.

## What's Included

- **Deterministic Simulation Core**: seeded RNG, tick-based simulation, replay integrity
- **8 AI Employees**: FastCoder-7, CarefulVerifier, CreativePlanner, SteadyBuilder,
  AuditorPrime, QuickScripter, DataSage, RuntimeArchitect
- **5 Workshops**: Planning, Engineering, Validation, Audit, Delivery
- **Pipeline**: Accept orders → Planning → Engineering → Validation → Audit → Delivery
- **Parallel Routes**: Multi-agent competitive artifact generation with score-based judging
- **Economy**: Cash, reputation, evidence integrity, salaries, maintenance, upgrades
- **Strategy Profiles**: Speed-first, Quality-first, Parallel-heavy, Balanced
- **Debugger**: Interactive scenario explorer with metric timelines and event drilldown
- **Agent HUD**: Floating real-time agent work status panel
- **Onboarding**: 7-step first-run tutorial checklist
- **Shadow Audit**: Optional local Ollama semantic evaluation (advisory only)
- **Balance Evidence**: Multi-seed strategy comparison, raw runs, hard gates
- **Test Suite**: 253 tests across 40 files (12 Ollama-only tests opt-in)

## Quick Start

```bash
npm ci
npm run dev      # http://localhost:5173
npm run test     # 253 tests
npm run build    # static build in dist/
```

## Boundaries

- All agents are deterministic simulations — no real LLM workers
- No backend, no database, no external APIs
- Ollama shadow audit is opt-in, localhost-only, advisory-only
- Shadow audit never mutates GameState, delivery, or replay hash
- Works fully offline (except opt-in Ollama)

## Known Limitations

See `KNOWN_LIMITATIONS.md`. Key items: bundle ~587KB, no mobile layout,
Ollama latency ~18s/case, economy not tuned for 200+ tick sessions.
