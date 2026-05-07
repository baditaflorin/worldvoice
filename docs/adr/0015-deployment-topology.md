# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode A uses no server-side deployment artifacts.

## Decision

Deploy only to GitHub Pages from `main` and `/docs`.

There is no Docker image, nginx config, compose stack, Prometheus service, or backend runtime in v1.

## Consequences

- Deployment is a git push after `make build`.
- Rollback is a git revert.
- Browser compatibility and Pages limitations are documented instead of hidden behind a server.

## Alternatives Considered

- Docker backend for model proxying. Rejected because v1 has no secrets or runtime mutations.
