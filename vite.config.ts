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

/**
 * The screens most visits open on, each with the test of its address (`p` is the path without a
 * trailing slash). Keep in step with the routes: a path that no longer matches only loses the head
 * start, and a view that no longer exists stops the build.
 */
const FIRST_SCREENS = [
  { when: "p==='/'", view: 'src/features/landing/presentation/views/LandingView.vue' },
  {
    when: "p==='/gallery'",
    view: 'src/features/public-gallery/presentation/views/PublicEventListView.vue',
  },
  {
    when: "p.indexOf('/gallery/')===0",
    view: 'src/features/public-gallery/presentation/views/PublicEventGalleryView.vue',
  },
]

/**
 * A screen is its own file, and the app asks for it only once it runs: one more trip, in a row,
 * before anything shows. For the screens above, a few lines in the page ask for that file, and
 * what it imports, while the app itself is still downloading. Build only: the dev server has no
 * bundle to point at.
 */
function preloadFirstScreen(): Plugin {
  let base = '/'

  return {
    name: 'titan-preload-first-screen',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx): string {
        const bundle = ctx.bundle
        if (!bundle) return html

        const chunks = Object.values(bundle).filter((file) => file.type === 'chunk')
        const byName = new Map(chunks.map((chunk) => [chunk.fileName, chunk]))
        const entryFiles = new Set(chunks.filter((c) => c.isEntry).map((c) => c.fileName))

        const filesOf = (view: string): string[] => {
          const start = chunks.find((chunk) => chunk.facadeModuleId?.endsWith(view))
          if (!start) throw new Error(`preloadFirstScreen: no chunk for ${view}`)

          const files = new Set<string>()
          const visit = (fileName: string): void => {
            const chunk = byName.get(fileName)
            if (!chunk || entryFiles.has(fileName) || files.has(fileName)) return
            files.add(fileName)
            chunk.viteMetadata?.importedCss.forEach((css) => files.add(css))
            chunk.imports.forEach(visit)
          }
          visit(start.fileName)
          return [...files].map((file) => base + file)
        }

        const cases = FIRST_SCREENS.map(
          ({ when, view }) => `${when}?${JSON.stringify(filesOf(view))}:`,
        ).join('')
        const script =
          `(function(){var p=location.pathname.replace(/\\/+$/,'')||'/';var f=${cases}null;` +
          `if(!f)return;f.forEach(function(h){var l=document.createElement('link');` +
          `if(/\\.css$/.test(h)){l.rel='preload';l.as='style'}else{l.rel='modulepreload'}` +
          `l.crossOrigin='';l.href=h;document.head.appendChild(l)})})()`

        // Right after the charset, which has to stay within the first bytes of the page, and before
        // the stylesheets, which would hold an inline script back until they load.
        const charset = /<meta charset=[^>]*>/i
        if (!charset.test(html)) throw new Error('preloadFirstScreen: no charset meta in the page')
        return html.replace(charset, (meta) => `${meta}\n    <script>${script}</script>`)
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), preconnectToBackends(), preloadFirstScreen()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
