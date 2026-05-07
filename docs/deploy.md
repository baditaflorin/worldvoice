# Deploy

WorldVoice deploys from the `main` branch and `/docs` folder through GitHub Pages.

Live URL:

https://baditaflorin.github.io/worldvoice/

## Publish

```bash
make lint
make test
make smoke
make build
git add docs src public package.json package-lock.json
git commit -m "chore: publish pages build"
git push origin main
```

GitHub Pages configuration:

- Source branch: `main`
- Source folder: `/docs`
- Custom domain: none in v1
- HTTPS enforced: yes

## Rollback

Revert the publishing commit:

```bash
git revert <commit_sha>
git push origin main
```

## Custom Domain

If a custom domain is added later:

1. Add `docs/CNAME`.
2. Configure DNS according to GitHub Pages documentation:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

3. Update `public/manifest.webmanifest` scope and start URL if the base path changes.

## Pages Gotchas

- GitHub Pages does not support custom `_headers`.
- Cross-origin isolation is unavailable on the default Pages host.
- Service worker scope must stay under `/worldvoice/`.
- Vite `base` must remain `/worldvoice/` while the app is served from the repository Pages path.
