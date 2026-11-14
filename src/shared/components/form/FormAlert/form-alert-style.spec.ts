import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The alert is one row: sign, text, way out. It stays short and the way out still takes a finger.
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
  it('takes one token step less of room above and below than before', () => {
    expect(ruleFor('.form-alert')).toMatch(/padding: var\(--tt-space-3\) var\(--tt-space-4\);/)
  })

  it('writes the detail in body weight whatever the page around it uses, the title heavier', () => {
    expect(ruleFor('.form-alert')).toMatch(/font-weight: var\(--tt-type-body-s-weight\);/)
    expect(ruleFor('.form-alert__title')).toMatch(/font-weight: var\(--tt-type-heading-m-weight\);/)
  })

  it('lets the way out drop to its own line only when it does not fit beside the text', () => {
    const main = ruleFor('.form-alert__main')
    expect(main).toMatch(/flex-wrap: wrap;/)
    expect(main).toMatch(/align-items: center;/)
    expect(ruleFor('.form-alert__body')).toMatch(/flex: 1 1 /)
    expect(ruleFor('.form-alert__actions')).toMatch(/flex: none;/)
  })

  it('gives the way out a finger of room without growing the box', () => {
    const action = ruleFor('.form-alert__retry')
    expect(action).toMatch(/min-block-size: var\(--tt-control-m\);/)
    expect(action).toMatch(
      /margin-block: calc\(\(var\(--tt-type-body-s-line\) - var\(--tt-control-m\)\) \/ 2\);/,
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
