import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import tokens from './awana-tokens.json'

// A field outline needs 3:1 against the field (WCAG 1.4.11). The awana line color is too faint
// for that, so fields take their own border token, in both schemes.
const ROOT = resolve(process.cwd())
const css = readFileSync(resolve(ROOT, 'src/core/theme/client/field-tokens.css'), 'utf8')

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((at) => {
    const channel = parseInt(hex.slice(at, at + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const contrast = (a: string, b: string): number => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light! + 0.05) / (dark! + 0.05)
}
const fieldBorder = (block: RegExp): string => css.match(block)![1]!

describe('field tokens', () => {
  const light = fieldBorder(/\[data-tt-area='client'\] \{\s*--tt-line-field: (#[0-9a-f]{6});/)
  const dark = fieldBorder(/\[data-tt-scheme='dark'\] \{\s*--tt-line-field: (#[0-9a-f]{6});/)

  it('gives the field border 3:1 against the field and the page in light', () => {
    const { surface, surfaceRaised } = tokens.colors.light
    expect(contrast(light, surfaceRaised)).toBeGreaterThanOrEqual(3)
    expect(contrast(light, surface)).toBeGreaterThanOrEqual(3)
  })

  it('gives the field border 3:1 against the field and the page in dark', () => {
    const { surface, surfaceRaised } = tokens.colors.dark
    expect(contrast(dark, surfaceRaised)).toBeGreaterThanOrEqual(3)
    expect(contrast(dark, surface)).toBeGreaterThanOrEqual(3)
  })

  it('is what the form field draws, with the line behind it outside the client area', () => {
    const field = readFileSync(
      resolve(ROOT, 'src/shared/components/form/FormField/FormField.vue'),
      'utf8',
    )
    expect(field).toContain('border: thin solid var(--tt-line-field, var(--tt-line));')
  })
})
