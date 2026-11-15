import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import GalleryCartBar from './GalleryCartBar.vue'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const cart = reactive({ status: 'success' as 'pending' | 'error' | 'success', count: 0 })
const pricing = reactive({ hasTiers: true })
const refetchCart = vi.fn()

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => cart.status),
    error: computed(() => null),
    isFetching: computed(() => false),
    countFor: (eventId: string) => (eventId === 'e1' ? cart.count : 0),
    refetch: refetchCart,
  }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      pricing.hasTiers ? { currency: 'USD', source: 'default', tiers: REAL_TIERS } : undefined,
    ),
  }),
}))

const Stub = { render: () => null }

async function mountBar() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/checkout/:eventId', component: Stub },
    ],
  })
  await router.push('/')
  return mount(GalleryCartBar, { props: { eventId: 'e1' }, global: { plugins: [router] } })
}

type Wrapper = Awaited<ReturnType<typeof mountBar>>
const confirm = (wrapper: Wrapper) =>
  wrapper.findAll('a').find((link) => link.text() === 'Confirmar pedido')

describe('GalleryCartBar', () => {
  beforeEach(() => {
    Object.assign(cart, { status: 'success', count: 0 })
    pricing.hasTiers = true
    refetchCart.mockClear()
    usePriceSheet().close()
  })

  it('explains the price, and offers nothing to confirm, with no photos of the event', async () => {
    const wrapper = await mountBar()

    expect(wrapper.text()).toContain('Precio por foto. Cuando llevas más, baja para todas.')
    expect(wrapper.find('.tier-chips').exists()).toBe(true)
    expect(confirm(wrapper)).toBeUndefined()
  })

  it('shows what the photos of the event cost and what is missing for the next price', async () => {
    cart.count = 3
    const wrapper = await mountBar()

    expect(wrapper.get('.gallery-cart-bar__total').text()).toBe('3 fotos · $9,00')
    expect(wrapper.text()).toContain('Con 4 fotos más, todas bajan a $2,50 c/u')
    expect(confirm(wrapper)?.attributes('href')).toBe('/checkout/e1')
  })

  it('says one photo in the singular', async () => {
    cart.count = 1
    const wrapper = await mountBar()

    expect(wrapper.get('.gallery-cart-bar__total').text()).toBe('1 foto · $4,00')
  })

  it('says so at the best price', async () => {
    cart.count = 10
    const wrapper = await mountBar()

    expect(wrapper.get('.gallery-cart-bar__total').text()).toBe('10 fotos · $20,00')
    expect(wrapper.text()).toContain('Ya tienes el mejor precio')
  })

  it('marks the tier of the photos in the chips, and opens the sheet with that quantity', async () => {
    cart.count = 4
    const wrapper = await mountBar()
    const current = wrapper
      .findAll('.tier-chips__tier')
      .map((tier) => tier.classes().includes('tier-chips__tier--current'))
    expect(current).toEqual([false, true, false, false])

    await wrapper.get('.tier-chips').trigger('click')

    expect(usePriceSheet().isOpen.value).toBe(true)
    expect(usePriceSheet().quantity.value).toBe(4)
  })

  it('counts the photos, with no price and no chips, when the tiers are not there', async () => {
    cart.count = 3
    pricing.hasTiers = false
    const wrapper = await mountBar()

    expect(wrapper.get('.gallery-cart-bar__total').text()).toBe('3 fotos')
    expect(wrapper.text()).not.toContain('$')
    expect(wrapper.find('.tier-chips').exists()).toBe(false)
    expect(confirm(wrapper)?.attributes('href')).toBe('/checkout/e1')
  })

  it('has nothing to say without tiers and without photos', async () => {
    pricing.hasTiers = false
    const wrapper = await mountBar()

    expect(wrapper.find('.gallery-cart-bar').exists()).toBe(false)
  })

  it('gives no figure, and offers to retry, when the cart could not be loaded', async () => {
    cart.status = 'error'
    const wrapper = await mountBar()

    expect(wrapper.find('.gallery-cart-bar__total').exists()).toBe(false)
    expect(wrapper.text()).not.toMatch(/\d+ fotos? ·/)
    const problem = wrapper.get('[data-test="cart-problem"]')
    expect(problem.classes()).toContain('form-alert')
    expect(problem.attributes('role')).toBe('alert')
    expect(problem.text()).toContain('No pudimos mostrar tu carrito')
    expect(confirm(wrapper)).toBeUndefined()

    await problem.get('button').trigger('click')
    expect(refetchCart).toHaveBeenCalledTimes(1)
  })

  it('claims nothing about the cart while it loads', async () => {
    cart.status = 'pending'
    const wrapper = await mountBar()

    expect(wrapper.find('.gallery-cart-bar__total').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Precio por foto. Cuando llevas más')
    expect(wrapper.find('.tier-chips').exists()).toBe(true)
  })
})
