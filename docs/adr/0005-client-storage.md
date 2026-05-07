# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

WorldVoice needs to remember safe user preferences, last selected preset, and future downloaded model-pack metadata. Audio recordings and microphone samples should not be persisted by default.

## Decision

Use IndexedDB through `idb` for structured local state. Use `localStorage` only as a narrow fallback if IndexedDB is unavailable. Use OPFS later only when large user-supplied models need streaming file access.

Persisted keys:

- `engine-settings`: selected preset and control values.
- `model-pack-cache`: future model-pack metadata and cache status.

Do not persist microphone audio in v1.

## Consequences

- User preferences survive refreshes.
- Privacy remains strong because live audio stays ephemeral.
- Large model caching can evolve without changing the public deployment mode.

## Alternatives Considered

- `localStorage` only. It is enough for tiny settings but poor for future model metadata.
- Server persistence. Not a v1 requirement.
