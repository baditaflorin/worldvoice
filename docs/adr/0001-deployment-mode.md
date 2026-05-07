# 0001 - Deployment Mode

## Status

Accepted

## Context

WorldVoice transforms live microphone input into musical timbres and dream-like spaces. The v1 scope needs low-latency audio processing, progressive loading of heavier neural assets, local model caching, and privacy-preserving behavior. It does not require accounts, shared state, server-side writes, private API keys, or cloud audio processing.

GitHub Pages can host static HTML, JavaScript, WASM, model manifests, impulse responses, and documentation. Browser APIs can provide microphone capture, Web Audio, AudioWorklet processing, IndexedDB, OPFS where available, and service-worker caching.

## Decision

Use Mode A: Pure GitHub Pages.

The application will run fully client-side. Audio stays on the user's device. WASM and neural model assets are lazy-loaded after a user gesture and cached in browser storage. The initial experience must remain useful without heavyweight model downloads.

## Consequences

- There is no runtime backend, server database, authentication system, or secret-bearing API.
- GitHub Pages is the public deployment surface.
- Audio feature availability depends on browser support, especially AudioWorklet, WebAssembly, IndexedDB, and cross-origin isolation limitations on Pages.
- Model stages must degrade gracefully when a browser cannot load or execute them.
- Backend, Docker, nginx, and server observability sections from the bootstrap are intentionally absent for v1.

## Alternatives Considered

- Mode B: GitHub Pages + pre-built data. This is unnecessary for v1 because no scheduled data artifact is required.
- Mode C: GitHub Pages frontend + Docker backend. This would add operational complexity without solving a v1 requirement and would weaken the privacy story by making users wonder whether live audio leaves the device.
