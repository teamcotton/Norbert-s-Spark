import react from '@astrojs/react'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'static',
  vite: {
    test: {
      globals: true,
      environment: 'jsdom',
    },
  },
})
