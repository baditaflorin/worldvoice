# 0006 - WASM and Neural Modules

## Status

Accepted

## Context

The target experience includes RNNoise-style cleanup, CREPE/DDSP/RAVE-style neural stages, and neural reverb. Production-ready browser model execution is feasible through WASM and WebGPU paths, but GitHub Pages cannot provide custom COOP/COEP headers.

## Decision

Use a WebAudio-first live core and lazy enhancement adapters:

- `@shiguredo/rnnoise-wasm` for optional RNNoise capability detection and future frame-level denoising.
- `onnxruntime-web` for future CREPE, DDSP-port, RAVE, and reverb ONNX packs.
- Browser-native Web Audio fallbacks for pitch following, harmonic resynthesis, spectral sculpting, and impossible-space reverb.

The shipped v1 must remain useful even when no neural model can be loaded. Model execution must happen after a user gesture.

## Consequences

- The app is deployable on GitHub Pages today.
- Browser support differences are handled with capability states instead of hard failures.
- True model weights can be added as static packs later without changing deployment mode.

## Alternatives Considered

- Bundle Magenta DDSP through `@magenta/music`. Rejected for v1 because the current npm dependency tree introduced high and critical audit findings.
- Require a custom static host with cross-origin isolation. Better for advanced WASM, but outside the Pages-first constraint.
