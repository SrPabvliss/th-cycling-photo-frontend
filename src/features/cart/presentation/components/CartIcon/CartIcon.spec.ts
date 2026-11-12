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

  it('names itself with the number of photos, singular for one', async () => {
    const store = useCartStore()
    const wrapper = mount(CartIcon)
    const photo = (id: string) => ({ id, publicSlug: id })
    const group = (ids: string[]) => ({
      eventId: 'e1',
      eventName: 'Evento',
      eventSlug: 'evento',
      startDate: new Date(),
      endDate: new Date(),
      photos: ids.map(photo),
    })

    expect(wrapper.get('button').attributes('aria-label')).toBe('Carrito, 0 fotos')
    expect(wrapper.find('.cart-icon__badge').exists()).toBe(false)

    store.setGroups([group(['p1'])] as never)
    await wrapper.vm.$nextTick()
    expect(wrapper.get('button').attributes('aria-label')).toBe('Carrito, 1 foto')
    expect(wrapper.get('.cart-icon__badge').text()).toBe('1')

    store.setGroups([group(['p1', 'p2', 'p3'])] as never)
    await wrapper.vm.$nextTick()
    expect(wrapper.get('button').attributes('aria-label')).toBe('Carrito, 3 fotos')
    expect(wrapper.get('.cart-icon__badge').text()).toBe('3')
  })

  it('opens the drawer through the store, since the slot registry cannot wire an emit', () => {
    const store = useCartStore()
    const wrapper = mount(CartIcon)

    wrapper.get('button').trigger('click')

    expect(store.isDrawerOpen).toBe(true)
  })
})
