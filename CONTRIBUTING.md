# Contributing

WorldVoice is a static, browser-first audio app. Please keep changes aligned with the ADRs in `docs/adr/`.

## Local Setup

```bash
npm install
make install-hooks
make dev
```

## Before Pushing

```bash
make lint
make test
make smoke
```

Commits must use Conventional Commits:

```text
feat: add a preset
fix: handle microphone denial
docs: update model-pack notes
```

## Dependency Rules

Do not add packages with high or critical audit findings. Heavy audio/model packages must be lazy-loaded after user interaction.

## Privacy Rules

Do not persist microphone audio by default. Do not add analytics without a new ADR.
