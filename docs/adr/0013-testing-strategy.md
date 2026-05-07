# 0013 - Testing Strategy

## Status

Accepted

## Context

The app has deterministic logic and browser-only APIs. Tests should be fast enough for local hooks and smoke checks.

## Decision

Use:

- Vitest for unit tests.
- Testing Library for React smoke rendering.
- Playwright for a static-site happy path.
- `scripts/smoke.sh` to build, serve `docs/`, and run Playwright.

Coverage focuses on pitch detection, preset contracts, manifest validation, storage fallbacks, and primary UI states.

## Consequences

- `make test` and `make smoke` can run before pushing.
- Microphone hardware behavior remains manually verified because CI and headless browsers cannot guarantee real device input.

## Alternatives Considered

- Full audio e2e automation. Useful later, but too brittle for local hooks.
