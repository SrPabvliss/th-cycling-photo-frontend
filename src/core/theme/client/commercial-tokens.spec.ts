import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The WhatsApp button carries its label in its own color: 4.5:1 in both schemes (WCAG 1.4.3).
// The highlighted piece keeps the same yellow in both.
const ROOT = resolve(process.cwd())
const css = readFileSync(resolve(ROOT, 'src/core/theme/client/commercial-tokens.css'), 'utf8')
const main = readFileSync(resolve(ROOT, 'src/app/main.ts'), 'utf8')

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

const block = (selector: RegExp): string => css.match(selector)![1]!
const value = (body: string, name: string): string =>
  body.match(new RegExp(`--tt-${name}: (#[0-9a-f]{6});`))![1]!

const light = block(/\[data-tt-area='client'\] \{([^}]*)\}/)
const dark = block(/\[data-tt-scheme='dark'\] \{([^}]*)\}/)

describe('commercial tokens', () => {
  it('gives the WhatsApp label 4.5:1 on its button in light', () => {
    expect(contrast(value(light, 'wa'), value(light, 'on-wa'))).toBeGreaterThanOrEqual(4.5)
  })

  it('gives the WhatsApp label 4.5:1 on its button in dark', () => {
    expect(contrast(value(dark, 'wa'), value(dark, 'on-wa'))).toBeGreaterThanOrEqual(4.5)
  })

  it('gives the text of the highlighted piece 4.5:1 on it, the same in both schemes', () => {
    expect(contrast(value(light, 'spot'), value(light, 'on-spot'))).toBeGreaterThanOrEqual(4.5)
    expect(dark).not.toContain('--tt-spot')
  })

  it('is loaded by the app', () => {
    expect(main).toContain("import '@/core/theme/client/commercial-tokens.css'")
  })
})
