# 0011 - Logging Strategy

## Status

Accepted

## Context

There is no server log stream. Browser logging must help debugging without leaking private audio details.

## Decision

Use minimal browser console logging in development. Production logs are limited to startup capability errors and never include audio samples, device labels, or microphone content.

UI-visible errors use concise toasts/status banners.

## Consequences

- Production console noise stays low.
- Users get clear failure states when microphone or model loading fails.

## Alternatives Considered

- Verbose audio telemetry logs. Rejected for privacy and noise.
