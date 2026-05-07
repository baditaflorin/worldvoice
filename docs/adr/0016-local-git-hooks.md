# 0016 - Local Git Hooks

## Status

Accepted

## Context

The bootstrap forbids GitHub Actions and requires local checks.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`.

Hooks:

- `pre-commit`: lint, TypeScript, Prettier check, and gitleaks staged scan.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: test, build, and smoke.
- `post-merge` and `post-checkout`: dependency hint and generated-output reminder.

## Consequences

- Checks run locally before publishing.
- Contributors must run `make install-hooks` once per clone.

## Alternatives Considered

- Lefthook. Good option, but plain hooks are transparent and avoid another moving part.
