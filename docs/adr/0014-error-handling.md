# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Audio apps fail for normal reasons: microphone permissions, unsupported browsers, missing devices, unavailable WASM, and model download errors.

## Decision

Use typed result states at feature boundaries. Throw only for programmer errors or browser API failures that cannot be recovered locally. React displays a friendly global error state, and the audio engine emits status updates rather than writing directly to the UI.

## Consequences

- Microphone denial is handled as a normal state.
- Optional model failures do not stop the live fallback chain.
- Cleanup paths are explicit when the engine stops.

## Alternatives Considered

- Let errors bubble to the browser. Rejected because users need actionable status.
