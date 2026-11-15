import { describe, expect, it } from 'vitest'

import { safeRedirect } from './safe-redirect'

describe('safeRedirect', () => {
  it.each([
    ['/checkout/abc', '/checkout/abc'],
    ['/account/orders?x=1#y', '/account/orders?x=1#y'],
    [['/gallery', '/other'], '/gallery'],
  ])('keeps the internal route %j', (raw, expected) => {
    expect(safeRedirect(raw)).toBe(expected)
  })

  it.each([
    'https://otro.sitio',
    '//otro.sitio',
    '/\\otro.sitio',
    '\\\\otro.sitio',
    'javascript:alert(1)',
    'checkout/abc',
    '',
    undefined,
    null,
    42,
  ])('ignores %j', (raw) => {
    expect(safeRedirect(raw)).toBeNull()
  })
})
