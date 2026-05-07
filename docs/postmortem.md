# Postmortem

Date: 2026-05-07

## What Was Built

WorldVoice v0.1.0 is a static GitHub Pages app at:

https://baditaflorin.github.io/worldvoice/

It includes:

- React and Vite app deployed from `main` and `/docs`.
- Live microphone Web Audio engine.
- Pitch tracking with harmonic resynthesis.
- Violin, choir, sax, and dream-space presets.
- Generated impossible-space convolution reverb.
- Adaptive filtering, compression, delay, and live canvas visualization.
- Lazy RNNoise WASM, ONNX Runtime Web, and Tone.js capability probes.
- Static model-pack manifest for future true DDSP/RAVE/ONNX packs.
- IndexedDB settings storage.
- PWA manifest and service worker.
- ADRs, README, deploy guide, privacy doc, security/community files, tests, smoke checks, local git hooks, and Makefile.

## Was Mode A Correct?

Yes. Mode A was the correct v1 choice.

The app has no accounts, no shared state, no secrets, no writes, and no need to upload audio. All runtime behavior can happen in the browser through Web Audio, static assets, IndexedDB, and lazy WASM/ONNX adapters.

Mode B was unnecessary because there is no scheduled data-generation pipeline. Mode C would have added operational complexity and weakened the privacy story.

## What Worked

- GitHub Pages handled the public app cleanly once `/docs` publishing was configured.
- The Web Audio fallback chain gives a working live instrument-transform experience without waiting for large neural weights.
- Dynamic imports kept the first-load JavaScript within the v1 budget while still shipping heavier optional runtimes.
- Playwright could smoke-test the static Pages build with fake media devices.

## What Did Not Work

- Building into `docs/` initially removed authored ADRs. The fix was a Pages clean script that removes generated artifacts while preserving authored docs.
- `@magenta/music` was tested for DDSP but rejected because it introduced high and critical npm audit findings.
- True RAVE/DDSP real-time ONNX weights were not bundled in v0.1.0. The app ships adapter slots and fallbacks instead.

## Surprises

- `@shiguredo/rnnoise-wasm` ships a large embedded WASM payload, but lazy chunking keeps it out of the initial app path.
- ONNX Runtime Web emits a large WASM asset even when used as an optional capability probe.
- The generated visualizer became a useful first-class part of the product rather than just a debugging surface.

## Accepted Tech Debt

- The live timbre transfer is WebAudio resynthesis, not true DDSP or RAVE inference yet.
- RNNoise is probed but not inserted into an AudioWorklet frame pipeline.
- The service worker uses a simple cache strategy and should be versioned more carefully when model packs become larger.
- Browser compatibility is documented but not exhaustively tested across iOS Safari and Android Chrome.

## Next Three Improvements

1. Add an audited CREPE tiny ONNX pitch model and compare it against the current autocorrelation follower.
2. Add a real DDSP violin model adapter once the dependency path passes audit, or host a converted ONNX pack as a static release asset.
3. Move RNNoise frame processing into an AudioWorklet and expose a real denoise toggle.

## Time

Estimated: 6 to 8 focused hours for a robust static v0.1.0.

Actual in this session: about 2 hours of implementation time, with scope kept realistic by shipping a WebAudio-first v1 and model-ready extension points.
