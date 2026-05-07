# 0017 - Dependency Policy

## Status

Accepted

## Context

WorldVoice depends on browser audio and model execution libraries. Some attractive audio ML packages are old or carry vulnerable transitive dependencies.

## Decision

Use production libraries only when they pass local audit and serve a clear purpose. Heavy libraries must be lazy-loaded. `npm audit --audit-level=high` must pass before release.

Rejected dependencies are documented when relevant. In v1, `@magenta/music` was rejected because installing it introduced high and critical audit findings.

## Consequences

- The implementation may use high-quality Web Audio fallbacks where audited neural packages are not safe enough to ship.
- Future model packs can be added when their runtime dependencies pass the policy.

## Alternatives Considered

- Accept vulnerable transitive dependencies for demo value. Rejected because the project is public and intended to be reusable.
