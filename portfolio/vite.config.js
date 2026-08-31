import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Embedded inside the merged Nuxt site at /portfolio — assets and routes are
// served from that subpath, and the build output lands in the Nuxt app's
// public/ folder. Standalone dev (npm run dev) also opens at /portfolio/.
export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  build: {
    outDir: '../public/portfolio',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Dev only: forwards the portfolio API to the merged Nuxt dev server.
      '/api/portfolio': 'http://localhost:3000',
    },
  },
})
