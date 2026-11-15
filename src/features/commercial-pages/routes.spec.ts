import { describe, expect, it } from 'vitest'

// @ts-expect-error plain ESM helper shared with the build check, without types
import { hasBlockerTerm } from '../../../scripts/blocker-terms.mjs'
import { commercialRoutes } from './routes'

describe('commercial routes', () => {
  it('serves the brands page at /anunciate and the organizers page at /organizadores', () => {
    expect(commercialRoutes.map((route) => route.path)).toEqual(['/anunciate', '/organizadores'])
  })

  it('opens without an account, with the plain header and footer and no season bar', () => {
    for (const route of commercialRoutes) {
      expect(route.meta?.public).toBe(true)
      expect(route.meta?.shell).toBeUndefined()
    }
  })

  it('has no address or name an ad blocker would take for an ad', () => {
    for (const route of commercialRoutes) {
      expect(hasBlockerTerm(route.path)).toBe(false)
      expect(hasBlockerTerm(String(route.name))).toBe(false)
    }
  })
})
