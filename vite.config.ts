import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function pagesFallback(): Plugin {
  return {
    name: 'worldvoice-pages-fallback',
    closeBundle() {
      const indexPath = resolve(__dirname, 'docs/index.html')
      const fallbackPath = resolve(__dirname, 'docs/404.html')

      if (existsSync(indexPath)) {
        copyFileSync(indexPath, fallbackPath)
      }
    },
  }
}

export default defineConfig({
  base: '/worldvoice/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }

          return undefined
        },
      },
    },
  },
  plugins: [react(), pagesFallback()],
})
