import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// A field in error shows a red border and a focused one a blue border. Neither can lose against
// the resting border: the rule that leaves checkboxes and radios out must not add weight.
const source = readFileSync(
  resolve(process.cwd(), 'src/shared/components/form/FormField/FormField.vue'),
  'utf8',
)

const ruleFor = (selector: RegExp) => {
  const match = source.match(new RegExp(`${selector.source}[^{]*\\{([^}]*)\\}`))
  return match?.[1] ?? null
}

describe('form field look', () => {
  it('leaves checkboxes and radios out of the resting border without outweighing the states', () => {
    const resting = source.match(/\.form-field :slotted\(input([^)]*\)*)\)/)?.[1] ?? ''

    expect(resting).toContain(":where(:not([type='checkbox'], [type='radio']))")
    expect(resting).not.toMatch(/^:not/)
  })

  it('paints the error and the focus over the resting border', () => {
    expect(ruleFor(/\.form-field--error :slotted\(input\)/)).toMatch(
      /border-color: var\(--tt-danger-ink\)/,
    )
    expect(ruleFor(/\.form-field :slotted\(input:focus\)/)).toMatch(
      /border-color: var\(--tt-primary\)/,
    )
  })

  it('keeps the error border while the field has the focus, where a failed send puts it', () => {
    const rule = ruleFor(/\.form-field--error :slotted\(input:focus\)/)
    expect(rule).toMatch(/border-color: var\(--tt-danger-ink\)/)
    expect(rule).toMatch(/box-shadow: 0 0 0 var\(--tt-space-1\) var\(--tt-danger-soft\)/)
  })
})
