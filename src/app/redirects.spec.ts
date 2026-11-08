import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import router from './router'

interface IRedirectRule {
  source: string
  destination: string
  status: number
}

const SPA_FALLBACK = '/* /index.html 200'

// Vitest runs from the project root (see vitest.config.ts).
const lines = readFileSync(resolve(process.cwd(), 'public/_redirects'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))

const fallbackIndex = lines.indexOf(SPA_FALLBACK)

const redirects: IRedirectRule[] = lines.slice(0, fallbackIndex).map((line) => {
  const [source = '', destination = '', status = '302'] = line.split(/\s+/)
  return { source, destination, status: Number(status) }
})

/** Fills `:param` placeholders so the path can be resolved by the router. */
function sample(path: string): string {
  return path.replace(/:[a-zA-Z]+/g, 'sample-id')
}

function isRealRoute(path: string): boolean {
  return router.resolve(sample(path)).matched.every((record) => record.path !== '/:pathMatch(.*)*')
}

describe('public/_redirects', () => {
  it('keeps the SPA fallback as the last rule', () => {
    expect(fallbackIndex).toBe(lines.length - 1)
  })

  it('sends the old Spanish legal pages to their new paths for good', () => {
    expect(redirects).toContainEqual({
      source: '/privacidad',
      destination: '/privacy',
      status: 301,
    })
    expect(redirects).toContainEqual({ source: '/terminos', destination: '/terms', status: 301 })
  })

  it('opens an old order link on the order inside the list', () => {
    expect(redirects).toContainEqual({
      source: '/orders/:id',
      destination: '/orders?order=:id',
      status: 301,
    })
  })

  it.each(redirects)('only redirects $source, a path the app no longer serves', ({ source }) => {
    expect(isRealRoute(source)).toBe(false)
  })

  it.each(redirects)('lands $source on $destination, a page that exists', ({ destination }) => {
    expect(isRealRoute(destination)).toBe(true)
  })
})
