import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import tokens from './awana-tokens.json'

// Read from disk: vitest hands back an empty string for a stylesheet imported with ?raw.
const css = readFileSync(resolve(process.cwd(), 'src/core/theme/client/awana-tokens.css'), 'utf8')

describe('awana tokens scoped to the client area', () => {
  it('reads the generated stylesheet', () => {
    expect(css.length).toBeGreaterThan(0)
  })

  it('never targets the document root, so the panel keeps its own variables', () => {
    expect(css).not.toContain(':root')
  })

  it('carries no trace of the mantine selectors awana ships', () => {
    expect(css).not.toContain('mantine')
  })

  it('declares the light tokens under the client area', () => {
    expect(css).toContain("[data-tt-area='client'] {")
    expect(css).toContain('--tt-primary: #0e5a9c')
  })

  it('declares the dark tokens under the client area with the dark scheme', () => {
    expect(css).toContain("[data-tt-area='client'][data-tt-scheme='dark'] {")
  })

  it('exposes the same palette as data for the naive theme', () => {
    expect(tokens.colors.light.primary).toBe('#0e5a9c')
    expect(tokens.colors.dark.primary).toBeTruthy()
    expect(tokens.colors.dark.primary).not.toBe(tokens.colors.light.primary)
  })
})
