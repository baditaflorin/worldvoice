# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no backend and no generated data pipeline. The app still needs stable metadata for optional neural model packs and fallback capabilities.

## Decision

Use committed static JSON at `/models/manifest.json`.

Schema version: `1`.

Fields:

- `schemaVersion`: number.
- `generatedAt`: ISO date string.
- `packs`: array of model-pack descriptors.
- Pack descriptor fields: `id`, `kind`, `label`, `description`, `sizeMb`, `runtime`, `status`, `url`, `fallback`.

The app validates the manifest with `zod`. Breaking schema changes increment `schemaVersion`.

## Consequences

- The UI can display model-pack readiness without a server.
- Future hosted ONNX packs can be added by changing static JSON.
- Missing or invalid manifests fall back to a built-in minimal manifest.

## Alternatives Considered

- Hardcode metadata in TypeScript. This is simpler, but prevents no-build metadata updates.
- Runtime API. Not needed for public metadata.
