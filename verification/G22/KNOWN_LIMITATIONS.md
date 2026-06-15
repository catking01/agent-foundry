# Known Limitations

## Simulation

- All agents are deterministic simulations — not real LLM workers
- Agent behavior is rule-based with seeded randomness
- No real code execution, no real file system access
- No real network or external API calls (except opt-in localhost Ollama)

## Economy

- Long-run balance is improved but not production-grade
- Balanced strategy survives 7/8 seeds at horizon 100 (seed=3 evidence collapse)
- Net profit is generally negative over 100+ ticks

## Ollama Shadow Audit

- Requires local Ollama installation (not bundled)
- ~18s latency per artifact — not real-time
- Benchmark recall 100% but category-level accuracy varies
- Model over-triggers qualityConcernDetected on borderline cases
- Only tested with qwen2.5-coder:14b

## UI

- Bundle size ~587KB JS — Recharts adds significant weight
- No lazy-loading for DebuggerPanel
- No mobile/tablet layout
- Agent HUD shows remaining work, not percentage progress

## Testing

- No real player usability/playtest data
- Ollama tests are opt-in only (require local instance)
- UI tests cover rendering, not interactive workflows
