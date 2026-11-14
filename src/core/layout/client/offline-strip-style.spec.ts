import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), 'src/core/layout/client/OfflineStrip.vue'),
  'utf8',
)
const style = source.slice(source.indexOf('<style'))

describe('offline strip look', () => {
  it('is navy while offline and green once back', () => {
    expect(style).toMatch(/background: var\(--tt-navy\);/)
    expect(style).toMatch(/background: var\(--tt-success-soft\);/)
  })

  it('opens by its height, and not at all with reduced motion', () => {
    expect(style).toMatch(/grid-template-rows: 0fr;/)
    expect(style).toMatch(/grid-template-rows: 1fr;/)
    expect(style).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
  })

  it('stays under the header, on its layer', () => {
    expect(style).toMatch(/position: sticky;/)
    expect(style).toMatch(/z-index: var\(--tt-layer-header\);/)
  })

  it('uses tokens only, apart from the client desktop cut', () => {
    expect(style.replace('@media (min-width: 768px)', '')).not.toMatch(
      /\d+px|#[0-9a-f]{3,8}\b|rgba?\(/i,
    )
  })
})
