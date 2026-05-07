# 0010 - GitHub Pages Publishing

## Status

Accepted

## Context

The site must be live on GitHub Pages from the beginning and remain static. Vite defaults to building into `dist/`, but Pages can serve a folder named `docs/` directly from the `main` branch. Keeping the built artifact in `docs/` makes publishing explicit, reviewable, and easy to roll back with a normal git revert.

The repository name is `worldvoice`, so built asset URLs need the `/worldvoice/` base path.

## Decision

Publish GitHub Pages from the `main` branch and `/docs` folder.

Vite will build the app into `docs/` with `base: "/worldvoice/"`. Built assets use hashed filenames. A copied `404.html` fallback will support any future client-side routing. The `.gitignore` will ignore generic `dist/` output but must not ignore `docs/`.

## Consequences

- `make build` produces a Pages-ready `docs/` directory.
- The live URL is `https://baditaflorin.github.io/worldvoice/`.
- Every deploy is a normal commit to `main`.
- Rollback is a normal revert of the publishing commit.
- GitHub Pages does not support custom `_headers`, so features that require COOP/COEP must use non-isolated fallbacks or a future hosting change.

## Alternatives Considered

- Publish from repository root. This would mix source files and built files in a confusing public surface.
- Publish from a `gh-pages` branch. This keeps generated files off `main`, but it adds branch choreography and makes local review less direct.
- Use a custom host with headers. This would help SharedArrayBuffer and some WASM paths, but it violates the Pages-first v1 constraint.
