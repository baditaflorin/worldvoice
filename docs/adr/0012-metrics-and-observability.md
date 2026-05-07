# 0012 - Metrics and Observability

## Status

Accepted

## Context

WorldVoice can provide useful local telemetry such as input level, estimated pitch, active preset, and capability state. Server-side metrics do not exist in Mode A.

## Decision

Do not add analytics in v1.

Expose local, ephemeral status in the UI:

- Input level.
- Pitch estimate.
- Approximate audio latency.
- Model-pack status.
- Battery-saver state.

## Consequences

- No tracking consent or analytics vendor is needed.
- Usage metrics must come from manual testing and user feedback.

## Alternatives Considered

- Plausible or a custom beacon. Deferred because v1 success can be evaluated without collecting usage data.
