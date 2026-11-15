import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The approved section block: sunken, round, drawing beside the words; wide on a desktop-wide
// container; a centred column when stacked.
const source = readFileSync(
  resolve(process.cwd(), 'src/shared/components/loading/ErrorState.vue'),
  'utf8',
)
const style = source.slice(source.indexOf('<style'))

describe('error state look', () => {
  it('sits on the sunken surface with the large radius', () => {
    expect(style).toMatch(/background: var\(--tt-surface-sunken\);/)
    expect(style).toMatch(/border-radius: var\(--tt-radius-l\);/)
  })

  it('goes wide from the client desktop width of its own container, not of the viewport', () => {
    expect(style).toMatch(/container-type: inline-size;/)
    expect(style).toMatch(/@container \(min-width: 768px\)/)
    expect(style).not.toMatch(/@media \((min|max)-width/)
  })

  it('sizes its drawing from the illustration token, each size written once', () => {
    for (const factor of ['0.6', '0.7', '0.875']) {
      expect(
        style.match(new RegExp(`calc\\(var\\(--tt-ilu-inline\\) \\* ${factor}\\)`, 'g')),
      ).toHaveLength(1)
    }
  })

  it('uses tokens only, apart from the container width', () => {
    expect(style.replace('@container (min-width: 768px)', '')).not.toMatch(
      /\d+px|#[0-9a-f]{3,8}\b|rgba?\(/i,
    )
  })
})
