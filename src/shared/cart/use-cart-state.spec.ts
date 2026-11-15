import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'

import { useCartStore } from '@/shared/stores/cart.store'
import { useCartState } from './use-cart-state'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

const group = (eventId: string, ids: string[]) => ({
  eventId,
  eventName: `Evento ${eventId}`,
  eventSlug: `evento-${eventId}`,
  startDate: '2026-10-04',
  endDate: '2026-10-05',
  photos: ids.map((id) => ({ id, publicSlug: `slug-${id}` })),
})

function setup() {
  let state!: ReturnType<typeof useCartState>
  const Host = defineComponent({
    setup() {
      state = useCartState()
      return () => h('div')
    },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return state
}

describe('useCartState', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    get.mockReset()
  })

  it('is pending, and counts nothing, until the cart arrives', () => {
    get.mockReturnValue(new Promise(() => {}))

    const state = setup()

    expect(state.status.value).toBe('pending')
    expect(state.totalCount.value).toBe(0)
  })

  it('reads the cart of the anonymous session, quietly', async () => {
    get.mockResolvedValue({ data: [], meta: {} })

    setup()
    await flushPromises()

    expect(get).toHaveBeenCalledWith('/cart', {
      params: { sessionId: useCartStore().sessionId },
      silent: true,
    })
  })

  it('answers about the photos once the cart is there', async () => {
    get.mockResolvedValue({ data: [group('e1', ['a', 'b']), group('e2', ['c'])], meta: {} })

    const state = setup()
    await flushPromises()

    expect(state.status.value).toBe('success')
    expect(state.totalCount.value).toBe(3)
    expect(state.countFor('e1')).toBe(2)
    expect(state.countFor('nope')).toBe(0)
    expect(state.photoIdsFor('e2')).toEqual(['c'])
    expect(state.photoIdsFor('nope')).toEqual([])
    expect(state.isInCart('b')).toBe(true)
    expect(state.isInCart('z')).toBe(false)
    expect(state.groups.value.map((each) => each.eventName)).toEqual(['Evento e1', 'Evento e2'])
    expect(state.groups.value[0]!.startDate).toBeInstanceOf(Date)
  })

  it('keeps the store in step, for the screens that still read it', async () => {
    get.mockResolvedValue({ data: [group('e1', ['a'])], meta: {} })

    setup()
    await flushPromises()

    expect(useCartStore().totalCount).toBe(1)
  })

  it('reports an error, which is not an empty cart, when the cart cannot be loaded', async () => {
    get.mockRejectedValue(new Error('network'))

    const state = setup()
    await vi.waitFor(() => expect(state.status.value).toBe('error'))

    expect(state.status.value).not.toBe('success')
  })

  it('recovers when asked again', async () => {
    get.mockRejectedValueOnce(new Error('network'))
    const state = setup()
    await vi.waitFor(() => expect(state.status.value).toBe('error'))

    get.mockResolvedValue({ data: [group('e1', ['a'])], meta: {} })
    await state.refetch()
    await flushPromises()

    expect(state.status.value).toBe('success')
    expect(state.totalCount.value).toBe(1)
  })

  it('keeps showing the cart it had when a later refresh fails', async () => {
    get.mockResolvedValueOnce({ data: [group('e1', ['a'])], meta: {} })
    const state = setup()
    await flushPromises()

    get.mockRejectedValue(new Error('network'))
    await state.refetch()
    await flushPromises()

    expect(state.status.value).toBe('success')
    expect(state.totalCount.value).toBe(1)
  })
})
