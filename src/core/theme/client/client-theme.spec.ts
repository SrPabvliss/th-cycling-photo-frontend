import { describe, expect, it } from 'vitest'

import tokens from './awana-tokens.json'
import { buildClientTheme } from './client-theme'
import source from './client-theme.ts?raw'

describe('buildClientTheme', () => {
  it('takes the primary color from the light tokens', () => {
    expect(buildClientTheme('light').common?.primaryColor).toBe(tokens.colors.light.primary)
  })

  it('takes the page color from the dark tokens, different from the light one', () => {
    const dark = buildClientTheme('dark').common?.bodyColor

    expect(dark).toBe(tokens.colors.dark.surface)
    expect(dark).not.toBe(buildClientTheme('light').common?.bodyColor)
  })

  it('takes the corner radius from the tokens', () => {
    expect(buildClientTheme('light').common?.borderRadius).toBe(tokens.radius.radiusM)
  })

  it('paints a disabled primary button as a filled line with muted text, not faded', () => {
    const button = buildClientTheme('dark').Button

    expect(button?.opacityDisabled).toBe('1')
    expect(button?.colorDisabledPrimary).toBe(tokens.colors.dark.line)
    expect(button?.textColorDisabledPrimary).toBe(tokens.colors.dark.inkMuted)
  })

  it('writes no color by hand', () => {
    expect(source.length).toBeGreaterThan(0)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toContain('rgb(')
  })
})
