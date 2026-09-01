import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCartStore } from '@/shared/stores/cart.store'
import type { ICartGroup } from '@/shared/types/cart.types'
import CartDrawer from './CartDrawer.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/features/auth/composables/use-auth', () => ({
  useAuth: () => ({ isAuthenticated: { value: true } }),
}))
vi.mock('../../../composables/mutations/use-remove-from-cart', () => ({
  useRemoveFromCart: () => ({ mutate: vi.fn() }),
}))
vi.mock('@/features/cart/composables/use-cart-pricing', () => ({
  useCartPricing: () => ({
    preview: { value: { quantity: 2, subtotal: 8, unitPrice: 4 } },
    basePrice: { value: 4 },
    currency: { value: 'USD' },
    isLoading: { value: false },
  }),
}))

function group(id: string, photos: number): ICartGroup {
  return {
    eventId: id,
    eventName: `Evento ${id}`,
    eventSlug: `evento-${id}`,
    startDate: new Date(),
    endDate: new Date(),
    photos: Array.from({ length: photos }, (_, i) => ({
      id: `${id}-${i}`,
      publicSlug: `s${id}${i}`,
    })),
  }
}

function render() {
  return mount(CartDrawer, {
    global: {
      stubs: {
        teleport: true,
        PricingTotalBlock: true,
        PhotoPriceStrip: true,
        PhotoLightbox: true,
      },
    },
  })
}

describe('CartDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockClear()
  })

  it('offers only shortcuts when no event is being browsed', () => {
    const store = useCartStore()
    store.setGroups([group('a', 5), group('b', 3)])
    store.setDrawerOpen(true)

    const wrapper = render()

    expect(wrapper.findAll('[data-test="cart-shortcut"]')).toHaveLength(2)
    expect(wrapper.find('[data-test="cart-checkout"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="cart-pricing"]').exists()).toBe(false)
  })

  it('prices and checks out only the event being browsed', () => {
    const store = useCartStore()
    store.setGroups([group('a', 5), group('b', 3)])
    store.setActiveEvent('a')
    store.setDrawerOpen(true)

    const wrapper = render()

    expect(wrapper.find('[data-test="cart-checkout"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="cart-pricing"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="cart-thumb"]')).toHaveLength(5)
    expect(wrapper.findAll('[data-test="cart-shortcut"]')).toHaveLength(1)
  })

  it('keeps the drawer open when a shortcut sends you to that gallery', async () => {
    const store = useCartStore()
    store.setGroups([group('a', 5), group('b', 3)])
    store.setDrawerOpen(true)

    const wrapper = render()
    await wrapper.get('[data-test="cart-shortcut"]').trigger('click')

    expect(push).toHaveBeenCalledWith('/gallery/evento-a')
    expect(store.isDrawerOpen).toBe(true)
  })
})
