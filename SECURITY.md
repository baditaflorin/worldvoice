# Security Policy

## Supported Versions

The `main` branch and latest semver tag are supported.

## Reporting a Vulnerability

Please open a private GitHub security advisory:

https://github.com/baditaflorin/worldvoice/security/advisories/new

Do not open a public issue for secrets, credential leaks, or exploitable browser behavior.

## Baseline

- No runtime backend.
- No frontend secrets.
- No microphone audio upload.
- `npm audit --audit-level=high` must pass before release.
- Gitleaks runs in the local pre-commit hook.
