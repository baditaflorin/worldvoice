# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

WorldVoice needs a live audio engine, a responsive control surface, progressive model loading, local persistence, and static deployment. The architecture must keep the first load small and keep heavyweight audio/model work out of the initial React bundle.

## Decision

Use a client-only architecture with these boundaries:

- `src/features/audio`: Web Audio graph, pitch tracking, presets, generated impulse responses, model pack metadata, and browser storage.
- `src/components`: reusable UI pieces with no direct microphone ownership.
- `public/models`: static model manifest and future model-pack metadata.
- `docs`: GitHub Pages output plus authored project documentation.
- `scripts`: local build, smoke, and publishing helpers.

The audio engine owns the microphone stream and `AudioContext`. React owns controls and status display.

## Consequences

- Audio code can be tested independently from the UI.
- Heavy model adapters are lazy-loaded after a user gesture.
- Static deployment remains simple because there is no runtime API.

## Alternatives Considered

- Put all audio logic inside React components. This would make cleanup and testing fragile.
- Use a global singleton audio engine. This would make tests and future multi-engine experiments harder.
