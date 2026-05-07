# 0003 - Frontend Framework and Tooling

## Status

Accepted

## Context

The app needs a polished browser UI, strict TypeScript, fast builds, static Pages output, and lazy chunks for heavier audio libraries.

## Decision

Use React, TypeScript, and Vite.

Supporting libraries:

- `zod` for manifest validation.
- `@tanstack/react-query` for static metadata caching.
- `idb` for IndexedDB persistence.
- `lucide-react` for interface icons.
- `onnxruntime-web`, `tone`, and `@shiguredo/rnnoise-wasm` as lazy enhancement dependencies.
- Vitest, Testing Library, and Playwright for tests.

## Consequences

- The app remains familiar to frontend contributors.
- Lazy imports keep the initial JavaScript budget under control.
- React is used for orchestration and controls, not sample-level audio processing.

## Alternatives Considered

- Svelte. Smaller runtime, but less aligned with the generated scaffold and local testing setup.
- Vanilla TypeScript. Smaller bundle, but more manual state and accessibility work.
