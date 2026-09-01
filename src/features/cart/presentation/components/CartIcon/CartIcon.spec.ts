import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCartStore } from '@/shared/stores/cart.store'
import CartIcon from './CartIcon.vue'

const cartQuery = vi.fn()

vi.mock('../../../composables/queries/use-cart', () => ({
  useCartQuery: () => cartQuery(),
}))

describe('CartIcon', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    cartQuery.mockClear()
  })

  it('loads the cart itself: nothing else in the nav does it any more', () => {
    mount(CartIcon)

    expect(cartQuery).toHaveBeenCalled()
  })

  it('opens the drawer through the store, since the slot registry cannot wire an emit', () => {
    const store = useCartStore()
    const wrapper = mount(CartIcon)

    wrapper.get('button').trigger('click')

    expect(store.isDrawerOpen).toBe(true)
  })
})
