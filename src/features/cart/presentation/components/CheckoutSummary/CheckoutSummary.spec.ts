import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import type { ICartGroup } from '@/shared/types/cart.types'
import CheckoutSummary from './CheckoutSummary.vue'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]
const pricing = reactive({ hasTiers: true })
const remove = vi.fn()

vi.mock('@/shared/cart', () => ({
  useCartActions: () => ({ toggle: vi.fn(), remove, isBusy: () => false }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      pricing.hasTiers ? { currency: 'USD', source: 'default', tiers: REAL_TIERS } : undefined,
    ),
  }),
}))

const group = (photos: number): ICartGroup => ({
  eventId: 'e1',
  eventName: 'Mama Rumi 2026',
  eventSlug: 'mama-rumi',
  startDate: new Date(),
  endDate: new Date(),
  photos: Array.from({ length: photos }, (_, index) => ({
    id: `p${index}`,
    publicSlug: `s${index}`,
  })),
})

async function mountSummary(photos: number) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  await router.push('/')
  return mount(CheckoutSummary, { props: { group: group(photos) }, global: { plugins: [router] } })
}

describe('CheckoutSummary', () => {
  beforeEach(() => {
    pricing.hasTiers = true
    remove.mockClear()
    usePriceSheet().close()
  })

  it('crosses out the full price next to a lower one', async () => {
    const wrapper = await mountSummary(3)

    expect(wrapper.get('.order-summary__unit s').text()).toBe('$4,00')
    expect(wrapper.get('.order-summary__unit').text().replace(/\s+/g, ' ')).toBe('$4,00 $3,00 c/u')
  })

  it('crosses nothing out at the full price', async () => {
    const wrapper = await mountSummary(1)

    expect(wrapper.find('.order-summary__unit s').exists()).toBe(false)
  })

  it('explains the prices with the quantity of the order', async () => {
    const wrapper = await mountSummary(4)

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Cómo funcionan los precios')!
      .trigger('click')

    expect(usePriceSheet().isOpen.value).toBe(true)
    expect(usePriceSheet().quantity.value).toBe(4)
  })

  it('offers to add more photos from the gallery of the event', async () => {
    const wrapper = await mountSummary(2)

    expect(wrapper.get('.order-summary__add').attributes('href')).toBe('/gallery/mama-rumi')
  })

  it('counts the photos, with no price, without tiers', async () => {
    pricing.hasTiers = false
    const wrapper = await mountSummary(3)

    expect(wrapper.text()).toContain('3 fotos')
    expect(wrapper.text()).not.toContain('$')
  })
})
