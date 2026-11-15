import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Sign, two lines of text, way out as a pill: variant A of the approved error states.
const source = readFileSync(
  resolve(process.cwd(), 'src/shared/components/form/FormAlert/FormAlert.vue'),
  'utf8',
)
const style = source.slice(source.indexOf('<style'))

const ruleFor = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return style.match(new RegExp(`(?:^|\\n|,\\s*)${escaped}\\s*(?:,[^{]*)?\\{([^}]*)\\}`))?.[1] ?? ''
}

describe('form alert look', () => {
  it('has a tone for what did not load, apart from what was refused', () => {
    expect(ruleFor('.form-alert--warn')).toMatch(/background: var\(--tt-warning-soft\);/)
    expect(ruleFor('.form-alert--warn')).toMatch(/color: var\(--tt-warning-ink\);/)
    expect(ruleFor('.form-alert--bad')).toMatch(/background: var\(--tt-danger-soft\);/)
  })

  it('writes the title heavier and the detail one size step smaller under it', () => {
    expect(ruleFor('.form-alert__title')).toMatch(/display: block;/)
    expect(ruleFor('.form-alert__title')).toMatch(/font-weight: var\(--tt-type-heading-m-weight\);/)
    expect(ruleFor('.form-alert__text')).toMatch(/display: block;/)
    expect(ruleFor('.form-alert__text')).toMatch(/font-size: var\(--tt-type-caption-size\);/)
  })

  it('lets the way out drop to its own line only when it does not fit beside the text', () => {
    const main = ruleFor('.form-alert__main')
    expect(main).toMatch(/flex-wrap: wrap;/)
    expect(main).toMatch(/align-items: center;/)
    expect(ruleFor('.form-alert__body')).toMatch(/flex: 1 1 /)
    expect(ruleFor('.form-alert__actions')).toMatch(/flex: none;/)
  })

  it('draws the way out as a pill on the surface, edged in the tone', () => {
    const out = ruleFor('.form-alert__out')
    expect(out).toMatch(/block-size: var\(--tt-control-s\);/)
    expect(out).toMatch(/border-radius: var\(--tt-radius-pill\);/)
    expect(out).toMatch(/background: var\(--tt-surface\);/)
    expect(out).toMatch(/currentColor/)
    expect(out).not.toMatch(/text-decoration: underline/)
  })

  it('gives the pill a finger of room without growing the box', () => {
    expect(ruleFor('.form-alert__out::after')).toMatch(
      /inset-block: calc\(\(var\(--tt-control-s\) - var\(--tt-control-m\)\) \/ 2\);/,
    )
  })

  it('lines the sign up with the first line of text', () => {
    expect(ruleFor('.form-alert__icon')).toMatch(
      /margin-block-start: calc\(\(var\(--tt-type-body-s-line\) - var\(--tt-icon-m\)\) \/ 2\);/,
    )
  })

  it('uses tokens only', () => {
    expect(style).not.toMatch(/\d+px|#[0-9a-f]{3,8}\b|rgba?\(/i)
  })
})
