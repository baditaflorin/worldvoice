# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

Mode A must not need runtime secrets. Build-time configuration is limited to public values such as base path and optional analytics flags.

## Decision

Use Vite environment variables only for public configuration with the `VITE_` prefix. Commit `.env.example` with placeholders. Real `.env` files are gitignored. Gitleaks runs in local hooks.

No frontend code may contain API keys, private URLs, credentials, or obfuscated secrets.

## Consequences

- The app can be forked and deployed without secret setup.
- Any future secret-bearing feature requires a new ADR and likely a mode change.

## Alternatives Considered

- Store encrypted secrets in the frontend. Rejected because browser-delivered secrets are not secrets.
