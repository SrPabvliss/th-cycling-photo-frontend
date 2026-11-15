import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compileStyle } from 'vue/compiler-sfc'
import { describe, expect, it } from 'vitest'

// In the client area the prompt looks like the client's own dialogs; the panel keeps its look.
const css = readFileSync(
  resolve(
    process.cwd(),
    'src/features/account/presentation/components/VerifyEmailPrompt/verify-email-prompt.css',
  ),
  'utf8',
)
const clientRules = [...css.matchAll(/:global\(\[data-tt-area='client'\][^{]*\{[^}]*\}/g)].map(
  ([rule]) => rule,
)

describe('verify email prompt look', () => {
  it('takes the client type, colors and stacked actions only inside the client area', () => {
    const all = clientRules.join('\n')

    expect(all).toMatch(/\.verify-email-prompt\)\s*\{[^}]*border-radius: var\(--tt-radius-l\)/)
    expect(all).toMatch(/n-card-header__main\)\s*\{[^}]*var\(--tt-type-heading-m-size\)/)
    expect(all).toMatch(/\.verify-email-prompt__text\)\s*\{[^}]*color: var\(--tt-ink-muted\)/)
    expect(all).toMatch(/\.verify-email-prompt__actions\)\s*\{[^}]*flex-direction: column-reverse/)
  })

  it('leaves the rules the panel reads as they were', () => {
    expect(css).toMatch(
      /^\.verify-email-prompt__actions \{\n {2}display: flex;\n {2}justify-content: flex-end;/m,
    )
  })

  // Vue drops whatever follows a :global(...) in a scoped style: the rules ended up on <html>
  // itself and every screen of the client area took their weight, size and color.
  it('compiles every client rule onto the prompt, never onto the whole page', () => {
    const { code, errors } = compileStyle({
      source: css,
      filename: 'verify-email-prompt.css',
      id: 'data-v-test',
      scoped: true,
    })
    expect(errors).toEqual([])

    const rules = code.replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = [...rules.matchAll(/([^{}]+)\{/g)].map(([, selector]) => selector!.trim())
    const clientSelectors = selectors.filter((selector) => selector.includes('data-tt-area'))
    expect(clientSelectors.length).toBeGreaterThanOrEqual(4)
    clientSelectors.forEach((selector) => expect(selector).toMatch(/verify-email-prompt/))
  })
})
