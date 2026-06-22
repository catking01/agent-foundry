# Research Demo Release Notes

Release candidate: `v0.2.0-research-rc.1` pending tag creation.

## User-Visible Change

The public demo is being promoted from a playable deterministic simulation demo
to a playable plus research dashboard demo. The Research tab includes the G31
Policy Search UI sourced from deterministic G30 artifacts.

## Included Research Surface

- G27 flat vs hierarchy study summary
- G28 organization intervention summary
- G30 organization policy search summary
- G31 read-only Policy Search Dashboard
- Objective rankings
- Pareto frontier
- Policy details
- Scoring semantics
- Risk semantics
- Non-claims

## Static Hosting Boundary

The demo remains static-host compatible. It does not require a backend, Ollama,
Runtime Lab, or browser-side external API calls for normal demo use.

## Non-Claims

This release does not prove a real-world optimal organization policy, validate
Runtime Lab, implement real AI supervisors or workers, or generalize G30
deterministic simulator results to real organizations.

## Validation Status

Main-session local validation, GitHub Pages deployment, and public smoke passed
on 2026-06-22 for `https://catking01.github.io/agent-foundry/`.

The previously documented `/agent-factory/` Pages path is obsolete after the
repository move to `catking01/agent-foundry`.
