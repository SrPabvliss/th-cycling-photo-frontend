import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'

import { useCartStore } from '@/shared/stores/cart.store'
import { usePlaceOrder } from './use-place-order'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@/core/http/axios-client', () => ({ httpClient: { post } }))

const ORDER = { orderId: 'o1', eventName: 'Mama Rumi', photoCount: 3, subtotal: 9, currency: 'USD' }
const INPUT = { eventId: 'e1', method: 'transfer' as const, billingAccountId: 'b1' }

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => (resolve = res))
  return { promise, resolve }
}

function consentError() {
  const response = {
    status: 422,
    data: { error: { messageKey: 'billing.invoice_consent_required', message: 'x' } },
    headers: {},
    config: {},
  } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

/** Every POST but the checkout itself succeeds; the checkout answers what the test says. */
function answerCheckout(answer: () => Promise<unknown>) {
  post.mockImplementation((url: string) =>
    url === '/cart/checkout' ? answer() : Promise.resolve({ data: null, meta: {} }),
  )
}
const checkouts = () => post.mock.calls.filter(([url]) => url === '/cart/checkout')
const calledUrls = () => post.mock.calls.map(([url]) => url)

function setup() {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  let placeOrder!: ReturnType<typeof usePlaceOrder>
  const Host = defineComponent({
    setup() {
      placeOrder = usePlaceOrder()
      return () => h('div')
    },
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return { placeOrder, invalidate }
}

describe('usePlaceOrder', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    post.mockReset()
  })

  it('merges the session cart, then creates the order', async () => {
    answerCheckout(async () => ({ data: { orders: [ORDER] }, meta: {} }))
    const { placeOrder } = setup()

    const orders = await placeOrder.place(INPUT)

    expect(orders).toEqual([ORDER])
    expect(calledUrls()).toEqual(['/cart/merge', '/cart/checkout'])
    expect(checkouts()[0]![1]).toEqual({
      items: [{ eventId: 'e1' }],
      method: 'transfer',
      billingAccountId: 'b1',
    })
    expect(checkouts()[0]![2]).toMatchObject({ silent: true })
  })

  it('records the invoice consent first when the box was ticked', async () => {
    answerCheckout(async () => ({ data: { orders: [ORDER] }, meta: {} }))
    const { placeOrder } = setup()

    await placeOrder.place({ ...INPUT, recordConsent: true })

    expect(calledUrls()).toEqual(['/cart/merge', '/auth/consents', '/cart/checkout'])
  })

  it('creates the order once, however many times it is asked while on its way', async () => {
    const answer = deferred<unknown>()
    answerCheckout(() => answer.promise)
    const { placeOrder } = setup()

    const first = placeOrder.place(INPUT)
    const second = placeOrder.place(INPUT)
    expect(placeOrder.isPlacing.value).toBe(true)

    answer.resolve({ data: { orders: [ORDER] }, meta: {} })
    const [a, b] = await Promise.all([first, second])

    expect(checkouts()).toHaveLength(1)
    expect(a).toEqual([ORDER])
    expect(b).toBe(a)
    expect(placeOrder.isPlacing.value).toBe(false)
  })

  it('lets a new order through once the previous one ended', async () => {
    answerCheckout(async () => ({ data: { orders: [ORDER] }, meta: {} }))
    const { placeOrder } = setup()

    await placeOrder.place(INPUT)
    await placeOrder.place(INPUT)

    expect(checkouts()).toHaveLength(2)
  })

  it('names the problem, and stops placing, when the server refuses', async () => {
    answerCheckout(() => Promise.reject(consentError()))
    const { placeOrder } = setup()

    const orders = await placeOrder.place(INPUT)

    expect(orders).toBeNull()
    expect(placeOrder.problem.value).toBe('consent')
    expect(placeOrder.isPlacing.value).toBe(false)
  })

  it('names a network problem when the order request gets no answer', async () => {
    answerCheckout(() => Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK')))
    const { placeOrder } = setup()

    await placeOrder.place(INPUT)

    expect(placeOrder.problem.value).toBe('network')
  })

  it('stops, and creates no order, when the cart merge gets no answer', async () => {
    post.mockImplementation((url: string) =>
      url === '/cart/merge'
        ? Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK'))
        : Promise.resolve({ data: { orders: [ORDER] }, meta: {} }),
    )
    const { placeOrder } = setup()

    expect(await placeOrder.place(INPUT)).toBeNull()
    expect(calledUrls()).toEqual(['/cart/merge'])
    expect(placeOrder.problem.value).toBe('network')
  })

  it('stops, and creates no order, when the cart merge fails on the server', async () => {
    const response = { status: 500, data: {}, headers: {}, config: {} } as AxiosResponse
    post.mockImplementation((url: string) =>
      url === '/cart/merge'
        ? Promise.reject(
            new AxiosError('failed', 'ERR_BAD_RESPONSE', undefined, undefined, response),
          )
        : Promise.resolve({ data: { orders: [ORDER] }, meta: {} }),
    )
    const { placeOrder } = setup()

    expect(await placeOrder.place(INPUT)).toBeNull()
    expect(checkouts()).toHaveLength(0)
    expect(placeOrder.problem.value).toBe('network')
  })

  it('does not create the order when the consent could not be recorded', async () => {
    post.mockImplementation((url: string) =>
      url === '/auth/consents'
        ? Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK'))
        : Promise.resolve({ data: { orders: [ORDER] }, meta: {} }),
    )
    const { placeOrder } = setup()

    expect(await placeOrder.place({ ...INPUT, recordConsent: true })).toBeNull()
    expect(checkouts()).toHaveLength(0)
    expect(placeOrder.problem.value).toBe('network')
  })

  it('takes the photos out of the cart and refreshes the orders after a transfer order', async () => {
    answerCheckout(async () => ({ data: { orders: [ORDER] }, meta: {} }))
    const { placeOrder, invalidate } = setup()
    const cartStore = useCartStore()
    cartStore.setGroups([
      {
        eventId: 'e1',
        eventName: 'x',
        eventSlug: 'x',
        startDate: new Date(),
        endDate: new Date(),
        photos: [],
      },
    ])

    await placeOrder.place(INPUT)
    await flushPromises()

    const keys = invalidate.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey))
    expect(keys).toContain(JSON.stringify(['/cart']))
    expect(keys).toContain(JSON.stringify(['/orders/me']))
  })

  it('leaves the cart alone after a card order, which is only a draft until paid', async () => {
    answerCheckout(async () => ({ data: { orders: [ORDER] }, meta: {} }))
    const { placeOrder, invalidate } = setup()
    // The merge refreshes the cart on its own: only what follows the order counts here.
    invalidate.mockClear()

    await placeOrder.place({ ...INPUT, method: 'card' })
    await flushPromises()

    const keys = invalidate.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey))
    expect(keys).not.toContain(JSON.stringify(['/orders/me']))
  })

  it('forgets the problem on reset, and on the next attempt', async () => {
    answerCheckout(() => Promise.reject(consentError()))
    const { placeOrder } = setup()
    await placeOrder.place(INPUT)

    placeOrder.reset()
    expect(placeOrder.problem.value).toBeNull()

    await placeOrder.place(INPUT)
    answerCheckout(async () => ({ data: { orders: [ORDER] }, meta: {} }))
    await placeOrder.place(INPUT)
    expect(placeOrder.problem.value).toBeNull()
  })
})
