import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('./use-payphone-box', () => ({
  usePayphoneBox: () => ({
    isReady: { value: false },
    render: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
  }),
}))

import PayphoneBox from './PayphoneBox.vue'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

// Payphone's box is light and we do not control it. In dark mode it stays a light island inside a
// deliberate frame: its labels must not take the light ink of the dark page.
describe('PayphoneBox', () => {
  it('is a light island of the client tokens, in light and in dark', () => {
    const wrapper = mount(PayphoneBox, { props: { intent: { provider: 'payphone', payload: {} } } })
    const root = wrapper.get('.tt-payphone-box')

    // The light tokens apply to any [data-tt-area='client']; the dark ones only to the root with
    // the dark scheme.
    expect(root.attributes('data-tt-area')).toBe('client')
    expect(root.attributes('data-tt-scheme')).toBeUndefined()
  })

  it('resolves the Payphone variables inside the island, with its light tokens', () => {
    const global = read('src/assets/styles/payphone-box.css')
    expect(global).toMatch(
      /:root:root,\s*\.tt-payphone-box \{[^}]*--ppb-bs-body-color: var\(--tt-ink\)/,
    )
  })

  it('draws a frame of its own: light surface, line and the light color scheme', () => {
    const css = read('src/features/payments/gateways/payphone/payphone-box.css')
    const block = css.slice(
      css.indexOf('.payphone-box {'),
      css.indexOf('}', css.indexOf('.payphone-box {')),
    )
    expect(block).toContain('background: var(--tt-surface)')
    expect(block).toContain('color: var(--tt-ink)')
    expect(block).toContain('border: 1px solid var(--tt-line)')
    expect(block).toContain('color-scheme: light')
  })
})
