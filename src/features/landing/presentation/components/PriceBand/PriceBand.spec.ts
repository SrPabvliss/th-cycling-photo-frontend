import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, reactive } from 'vue'

import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import PriceBand from './PriceBand.vue'

interface ITier {
  minQty: number
  maxQty: number | null
  pricePerPhoto: number
}

const REAL_TIERS: ITier[] = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const query = reactive({ tiers: REAL_TIERS as ITier[] | undefined, isError: false })

vi.mock('@/features/pricing/composables/queries/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      query.tiers ? { currency: 'USD', source: 'default', tiers: query.tiers } : undefined,
    ),
    isError: computed(() => query.isError),
  }),
}))

const cards = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.price-band__card')

describe('PriceBand', () => {
  beforeEach(() => {
    Object.assign(query, { tiers: REAL_TIERS, isError: false })
  })

  it('shows one card per tier and marks the best price once', () => {
    const wrapper = mount(PriceBand)

    expect(wrapper.get('h2').text()).toBe('Mientras más fotos, menos pagas')
    expect(cards(wrapper)).toHaveLength(4)
    expect(wrapper.text().match(/Mejor precio/g)).toHaveLength(1)
    expect(cards(wrapper)[3]!.classes()).toContain('price-band__card--best')
  })

  it('writes each card from the data: label, price, discount and crossed base price', () => {
    const wrapper = mount(PriceBand)
    // Each card is a column of short lines.
    const lines = (index: number) =>
      Array.from(cards(wrapper)[index]!.element.children, (line) =>
        (line.textContent ?? '').replace(/\s+/g, ' ').trim(),
      )

    expect(lines(0)).toEqual(['1 a 2 fotos', '$4,00', 'cada una'])
    expect(lines(1)).toEqual(['−25%', '3 a 6 fotos', '$3,00', 'cada una · $4,00'])
    expect(lines(3)).toEqual(['Mejor precio · −50%', '10 o más fotos', '$2,00', 'cada una · $4,00'])
    expect(cards(wrapper)[1]!.get('s').text()).toBe('$4,00')
  })

  it('opens the price sheet from "see an example", pointing at no price', async () => {
    const sheet = usePriceSheet()
    sheet.close()
    const wrapper = mount(PriceBand)

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Ver un ejemplo')!
      .trigger('click')

    expect(sheet.isOpen.value).toBe(true)
    expect(sheet.quantity.value).toBe(0)
    sheet.close()
  })

  it('explains the best price with the numbers that came', () => {
    const wrapper = mount(PriceBand)

    expect(wrapper.get('.price-band__lead').text()).toBe(
      'Desde 10 fotos, cada una te sale a $2,00. El precio baja para todas las fotos de tu pedido.',
    )
  })

  it('follows other tiers than the ones of today', () => {
    query.tiers = [
      { minQty: 1, maxQty: 4, pricePerPhoto: 5 },
      { minQty: 5, maxQty: null, pricePerPhoto: 4 },
    ]
    const wrapper = mount(PriceBand)

    expect(cards(wrapper)).toHaveLength(2)
    expect(wrapper.get('.price-band__lead').text()).toContain(
      'Desde 5 fotos, cada una te sale a $4,00.',
    )
    expect(cards(wrapper)[1]!.text()).toContain('−20%')
  })

  it('keeps the general sentence when the best price is not an open tier', () => {
    query.tiers = [
      { minQty: 1, maxQty: 4, pricePerPhoto: 4 },
      { minQty: 5, maxQty: 9, pricePerPhoto: 3 },
    ]
    const wrapper = mount(PriceBand)

    expect(wrapper.get('.price-band__lead').text()).toBe(
      'El precio baja para todas las fotos de tu pedido.',
    )
  })

  it.each([
    ['a single tier', [REAL_TIERS[0]!]],
    ['no tiers', []],
  ])('is not there with %s', (_case, tiers) => {
    query.tiers = tiers
    const wrapper = mount(PriceBand)

    expect(wrapper.find('.price-band').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('is not there when the tiers fail to load, with no error message', () => {
    Object.assign(query, { tiers: undefined, isError: true })
    const wrapper = mount(PriceBand)

    expect(wrapper.find('.price-band').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('is not there while the tiers load, with no skeleton', () => {
    query.tiers = undefined
    const wrapper = mount(PriceBand)

    expect(wrapper.find('.price-band').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('tt-skeleton')
  })
})
