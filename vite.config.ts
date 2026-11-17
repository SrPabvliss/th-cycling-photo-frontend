import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

function originOf(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null
  } catch {
    return null
  }
}

/**
 * The API and the photo host are other origins: with a preconnect their connections open while the
 * app downloads, not after it starts. No crossorigin: both are asked with credentials. A variable
 * that is missing or is not a full URL adds nothing, so the page never carries a broken hint.
 */
function preconnectToBackends(): Plugin {
  let origins: string[] = []

  return {
    name: 'titan-preconnect',
    configResolved(config) {
      const found = [config.env.VITE_API_BASE_URL, config.env.VITE_CDN_BASE_URL]
        .map(originOf)
        .filter((origin): origin is string => origin !== null)
      origins = [...new Set(found)]
    },
    transformIndexHtml: (): HtmlTagDescriptor[] =>
      origins.map((origin) => ({
        tag: 'link',
        attrs: { rel: 'preconnect', href: origin },
        injectTo: 'head-prepend',
      })),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), preconnectToBackends()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
