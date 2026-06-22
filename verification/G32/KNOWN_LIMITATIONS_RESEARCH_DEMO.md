# Known Limitations For Research Demo

- The research dashboard displays deterministic simulator summaries, not live
  study generation.
- The browser bundle does not expose the raw G30 288-run matrix for download.
- Policy search covers 12 curated policies, not an exhaustive organization
  design space.
- Objective rankings depend on documented deterministic scoring choices.
- The Pareto frontier is simulator-specific and not a real-world optimum.
- Risk semantics distinguish detected overclaim findings from latent risk
  exposure; these are simulator metrics.
- Ollama and shadow-auditor workflows remain local opt-in behavior and are not
  required for the public demo.
- The static public demo has no backend persistence or account system.
- The Vite production build retains the existing chunk-size warning.
