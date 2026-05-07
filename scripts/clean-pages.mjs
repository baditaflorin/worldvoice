import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const generatedPaths = [
  'docs/assets',
  'docs/index.html',
  'docs/404.html',
  'docs/favicon.svg',
  'docs/icons.svg',
  'docs/manifest.webmanifest',
  'docs/sw.js',
  'docs/workbox-*.js',
]

for (const generatedPath of generatedPaths) {
  rmSync(resolve(generatedPath), {
    force: true,
    recursive: true,
    maxRetries: 3,
  })
}
