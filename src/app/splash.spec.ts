import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { COLOR_SCHEME_STORAGE_KEY } from '@/core/theme/color-scheme.store'
import router from './router'

// Vitest runs from the project root (see vitest.config.ts).
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const page = read('index.html')
const tokens = read('src/core/theme/client/awana-tokens.css')

function block(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`no block for ${selector}`)
  return source.slice(start, source.indexOf('}', start))
}

function declarations(css: string): Record<string, string> {
  return Object.fromEntries(
    [...css.matchAll(/(--tt-[\w-]+):\s*([^;]+);/g)].map((match) => [match[1]!, match[2]!.trim()]),
  )
}

const PALETTE = [
  '--tt-surface',
  '--tt-surface-raised',
  '--tt-line',
  '--tt-ink',
  '--tt-primary',
  '--tt-primary-ink',
  '--tt-primary-soft-border',
  '--tt-navy',
]

const firstSegment = (path: string) => path.split('/')[1] ?? ''

const script = page.match(/<script>\s*(;\(function \(\) \{[\s\S]*?\}\)\(\))\s*<\/script>/)![1]!

function schemeFor(path: string, saved: string | null, systemDark = false, storageFails = false) {
  const attributes: Record<string, string> = {}
  const localStorage = {
    getItem: (key: string) => {
      if (storageFails) throw new Error('blocked')
      return key === COLOR_SCHEME_STORAGE_KEY ? saved : null
    },
  }
  const matchMedia = () => ({ matches: systemDark })
  const document = {
    documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) },
  }
  new Function('localStorage', 'matchMedia', 'location', 'document', script)(
    localStorage,
    matchMedia,
    { pathname: path },
    document,
  )
  return attributes['data-tt-splash']
}

describe('the splash of the page', () => {
  it('carries the colors of the client tokens, light and dark', () => {
    const light = declarations(block(tokens, "[data-tt-area='client']"))
    const dark = declarations(block(tokens, "[data-tt-area='client'][data-tt-scheme='dark']"))
    const splashLight = declarations(block(page, '.tt-splash'))
    const splashDark = declarations(block(page, "[data-tt-splash='dark'] .tt-splash"))

    for (const name of PALETTE) {
      expect(splashLight[name], `${name} light`).toBe(light[name])
      expect(splashDark[name], `${name} dark`).toBe(dark[name])
    }
  })

  it('carries the sizes, the type and the pace of the client tokens', () => {
    const token = declarations(block(tokens, "[data-tt-area='client']"))
    const rule = (selector: string) => block(page, selector)

    expect(rule('.tt-splash-badge')).toContain(`width: ${token['--tt-splash-badge']};`)
    expect(rule('.tt-splash-logo')).toContain(`width: ${token['--tt-splash-logo']};`)
    expect(rule('.tt-splash-mountain')).toContain(`width: ${token['--tt-splash-mountain-w']};`)
    expect(rule('.tt-splash-mountain')).toContain(`height: ${token['--tt-splash-mountain-h']};`)
    expect(rule('.tt-splash-dot')).toContain(`width: ${token['--tt-splash-dot']};`)
    expect(rule('.tt-splash-dot')).toContain(`tt-splash-ride ${token['--tt-splash-ride']} `)
    expect(rule('.tt-splash')).toContain(`gap: ${token['--tt-space-4']};`)

    const wordmark = rule('.tt-splash-wordmark')
    expect(wordmark).toContain(`font-family: ${token['--tt-font-display']};`)
    expect(wordmark).toContain(`font-stretch: ${token['--tt-display-stretch']};`)
    expect(wordmark).toContain(`font-size: ${token['--tt-type-wordmark-l-size']};`)
    expect(wordmark).toContain(`font-weight: ${token['--tt-type-wordmark-l-weight']};`)
    expect(wordmark).toContain(`letter-spacing: ${token['--tt-type-wordmark-l-tracking']};`)
  })

  it('draws the same helmet as the brand files', () => {
    const helmet = read('src/assets/brand/helmet-dark.svg')
    const drawn = [...page.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]!)

    expect(drawn).toHaveLength(3)
    for (const path of drawn) expect(helmet).toContain(path)
  })

  it('reads the scheme from where the app saves it', () => {
    expect(script).toContain(`localStorage.getItem('${COLOR_SCHEME_STORAGE_KEY}')`)
  })

  it('is light unless dark was chosen, or the system is dark and it follows the system', () => {
    expect(schemeFor('/gallery', null)).toBe('light')
    expect(schemeFor('/gallery', null, true)).toBe('light')
    expect(schemeFor('/gallery', 'light', true)).toBe('light')
    expect(schemeFor('/gallery', 'dark')).toBe('dark')
    expect(schemeFor('/gallery', 'system', true)).toBe('dark')
    expect(schemeFor('/gallery', 'system', false)).toBe('light')
    expect(schemeFor('/gallery', 'sepia', true)).toBe('light')
    expect(schemeFor('/', 'dark')).toBe('dark')
  })

  it('stays light when the saved choice cannot be read', () => {
    expect(schemeFor('/gallery', 'dark', true, true)).toBe('light')
  })

  it('is light on every screen of the panel, which has no dark scheme', () => {
    const panel = new Set<string>()
    const client = new Set<string>()
    for (const route of router.getRoutes()) {
      if (route.redirect || route.path.includes('(')) continue
      const isPanel = router.resolve(route.path).matched.some((r) => r.meta.area === 'panel')
      ;(isPanel ? panel : client).add(firstSegment(route.path))
    }

    const list = script.match(/var panel = \[([^\]]*)\]/)![1]!
    const listed = [...list.matchAll(/'([^']+)'/g)].map((match) => match[1]!)

    expect([...listed].sort()).toEqual([...panel].sort())
    for (const segment of panel) {
      expect(client.has(segment), `"${segment}" opens screens of both areas`).toBe(false)
      expect(schemeFor(`/${segment}/anything`, 'dark')).toBe('light')
    }
  })
})
