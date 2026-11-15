import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, reactive } from 'vue'

import { useCartStore } from '@/shared/stores/cart.store'
import CartIcon from './CartIcon.vue'

const cart = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  total: 0,
})

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => cart.status),
    totalCount: computed(() => cart.total),
  }),
}))

describe('CartIcon', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    Object.assign(cart, { status: 'success', total: 0 })
  })

  it('opens the drawer through the store, since the slot registry cannot wire an emit', async () => {
    const store = useCartStore()
    const wrapper = mount(CartIcon)

    await wrapper.get('button').trigger('click')

    expect(store.isDrawerOpen).toBe(true)
  })

  it('names itself with the number of photos, singular for one', async () => {
    const wrapper = mount(CartIcon)
    expect(wrapper.get('button').attributes('aria-label')).toBe('Carrito, 0 fotos')
    expect(wrapper.find('.cart-icon__badge').exists()).toBe(false)

    cart.total = 1
    await wrapper.vm.$nextTick()
    expect(wrapper.get('button').attributes('aria-label')).toBe('Carrito, 1 foto')
    expect(wrapper.get('.cart-icon__badge').text()).toBe('1')

    cart.total = 3
    await wrapper.vm.$nextTick()
    expect(wrapper.get('button').attributes('aria-label')).toBe('Carrito, 3 fotos')
    expect(wrapper.get('.cart-icon__badge').text()).toBe('3')
  })

  it.each(['error', 'pending'] as const)(
    'counts nothing, and says no number, while the cart is %s',
    async (status) => {
      cart.status = status
      cart.total = 3
      const wrapper = mount(CartIcon)

      expect(wrapper.find('.cart-icon__badge').exists()).toBe(false)
      expect(wrapper.get('button').attributes('aria-label')).toBe('Carrito')
    },
  )
})
