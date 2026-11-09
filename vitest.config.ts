import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      env: {
        VITE_API_BASE_URL: 'http://localhost/api',
        VITE_CDN_BASE_URL: 'http://localhost/cdn',
        VITE_APP_BASE_URL: 'http://localhost',
      },
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
