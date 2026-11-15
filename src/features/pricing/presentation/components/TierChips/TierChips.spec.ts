import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import TierChips from './TierChips.vue'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const mountChips = (quantity: number, tiers = REAL_TIERS) =>
  mount(TierChips, { props: { tiers, currency: 'USD', quantity } })

const segments = (wrapper: ReturnType<typeof mountChips>) => wrapper.findAll('.tier-chips__tier')
const current = (wrapper: ReturnType<typeof mountChips>) =>
  segments(wrapper).map((segment) => segment.classes().includes('tier-chips__tier--current'))

describe('TierChips', () => {
  it('is one button that explains itself', () => {
    const wrapper = mountChips(0)

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('aria-label')).toBe(
      'Precio por foto según cuántas lleves. Ver cómo funciona',
    )
  })

  it('shows every tier with its quantities and its price', () => {
    const wrapper = mountChips(0)

    // Each chip stacks its quantities over its price.
    const stacked = segments(wrapper).map((segment) =>
      Array.from(segment.element.children, (line) => line.textContent?.trim()).join(' '),
    )

    expect(stacked).toEqual([
      '1–2 fotos $4,00',
      '3–6 fotos $3,00',
      '7–9 fotos $2,50',
      '10+ fotos $2,00',
    ])
  })

  it('marks the tier the quantity is in', () => {
    expect(current(mountChips(4))).toEqual([false, true, false, false])
    expect(current(mountChips(1))).toEqual([true, false, false, false])
    expect(current(mountChips(25))).toEqual([false, false, false, true])
  })

  it('marks no tier with nothing in the cart', () => {
    expect(current(mountChips(0))).toEqual([false, false, false, false])
  })

  it('highlights the best price', () => {
    const best = segments(mountChips(0)).map((segment) =>
      segment.classes().includes('tier-chips__tier--best'),
    )

    expect(best).toEqual([false, false, false, true])
  })

  it('sorts tiers that come out of order', () => {
    const wrapper = mountChips(4, [REAL_TIERS[3]!, REAL_TIERS[1]!, REAL_TIERS[0]!, REAL_TIERS[2]!])

    expect(segments(wrapper)[0]!.text()).toContain('1–2')
    expect(current(wrapper)).toEqual([false, true, false, false])
  })

  it('asks to open the explanation when tapped', async () => {
    const wrapper = mountChips(4)

    await wrapper.trigger('click')

    expect(wrapper.emitted('open')).toHaveLength(1)
  })
})
