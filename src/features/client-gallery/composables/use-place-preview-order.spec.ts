import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { defineComponent, ref } from 'vue'

import { usePlacePreviewOrder } from './use-place-preview-order'

const post = vi.fn()
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { post: (...args: unknown[]) => post(...args) },
}))

const CREATED = { id: 'o1', subtotal: 9, currency: 'USD', photoCount: 3, method: 'transfer' }
const INPUT = { photoIds: ['a', 'b', 'c'], billingAccountId: 'b1', method: 'transfer' as const }

function apiError(status: number, messageKey?: string) {
  const data = messageKey ? { error: { messageKey } } : {}
  const response = { status, data, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

let api!: ReturnType<typeof usePlacePreviewOrder>
let queryClient: QueryClient
function setup() {
  queryClient = new QueryClient()
  mount(
    defineComponent({
      setup() {
        api = usePlacePreviewOrder(ref('tok'))
        return () => null
      },
    }),
    { global: { plugins: [[VueQueryPlugin, { queryClient }]] } },
  )
}

const ordersPosted = () => post.mock.calls.filter(([url]) => url === '/preview/tok/orders')

describe('usePlacePreviewOrder', () => {
  beforeEach(() => {
    post.mockReset()
  })

  it('creates the order with only photos, billing account and method', async () => {
    post.mockResolvedValue({ data: CREATED })
    setup()

    const order = await api.place(INPUT)

    expect(order).toEqual(CREATED)
    expect(ordersPosted()).toEqual([['/preview/tok/orders', INPUT, { silent: true }]])
  })

  it('sends one order for two quick calls', async () => {
    let answer: (value: unknown) => void = () => {}
    post.mockReturnValue(new Promise((resolve) => (answer = resolve)))
    setup()

    const first = api.place(INPUT)
    const second = api.place(INPUT)
    expect(api.isPlacing.value).toBe(true)
    answer({ data: CREATED })

    expect(await first).toEqual(CREATED)
    expect(await second).toEqual(CREATED)
    expect(ordersPosted()).toHaveLength(1)
    expect(api.isPlacing.value).toBe(false)
  })

  it('records the ticked consent before the order', async () => {
    post.mockResolvedValue({ data: CREATED })
    setup()

    await api.place({ ...INPUT, recordConsent: true })

    expect(post.mock.calls.map(([url]) => url)).toEqual(['/auth/consents', '/preview/tok/orders'])
  })

  it.each([
    [apiError(422, 'order.already_submitted'), 'already-ordered'],
    [apiError(422, 'order.preview_expired'), 'expired'],
    [apiError(422, 'order.preview_not_available'), 'not-available'],
    [apiError(422, 'order.photos_not_in_preview'), 'photos-changed'],
    [apiError(422, 'payment.card_unavailable'), 'card-unavailable'],
    [apiError(422, 'billing.invoice_consent_required'), 'consent'],
    [new AxiosError('Network Error', 'ERR_NETWORK'), 'network'],
  ])('names %s as %s and lets the button go', async (error, problem) => {
    post.mockImplementation(async () => {
      throw error
    })
    setup()

    expect(await api.place(INPUT)).toBeNull()
    expect(api.problem.value).toBe(problem)
    expect(api.isPlacing.value).toBe(false)
  })

  it('clears the problem on reset', async () => {
    post.mockImplementation(async () => {
      throw apiError(422, 'order.preview_expired')
    })
    setup()
    await api.place(INPUT)

    api.reset()

    expect(api.problem.value).toBeNull()
  })
})
