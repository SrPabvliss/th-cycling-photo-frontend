import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// In the client area the prompt looks like the client's own dialogs; the panel keeps its look.
const css = readFileSync(
  resolve(
    process.cwd(),
    'src/features/account/presentation/components/VerifyEmailPrompt/verify-email-prompt.css',
  ),
  'utf8',
)
const clientRules = [...css.matchAll(/:global\(\[data-tt-area='client'\]\)[^{]*\{[^}]*\}/g)].map(
  ([rule]) => rule,
)

describe('verify email prompt look', () => {
  it('takes the client type, colors and stacked actions only inside the client area', () => {
    const all = clientRules.join('\n')

    expect(all).toMatch(/\.verify-email-prompt\s*\{[^}]*border-radius: var\(--tt-radius-l\)/)
    expect(all).toMatch(/n-card-header__main\)\s*\{[^}]*var\(--tt-type-heading-m-size\)/)
    expect(all).toMatch(/\.verify-email-prompt__text\s*\{[^}]*color: var\(--tt-ink-muted\)/)
    expect(all).toMatch(/\.verify-email-prompt__actions\s*\{[^}]*flex-direction: column-reverse/)
  })

  it('leaves the rules the panel reads as they were', () => {
    expect(css).toMatch(
      /^\.verify-email-prompt__actions \{\n {2}display: flex;\n {2}justify-content: flex-end;/m,
    )
  })
})
