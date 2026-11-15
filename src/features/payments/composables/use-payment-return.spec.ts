import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'

import { usePaymentReturn } from './use-payment-return'

const replace = vi.fn()
const confirm = vi.fn()
const get = vi.fn()
const parseReturn = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: { id: '7', clientTransactionId: 'tx-1' },
    meta: { provider: 'payphone' },
  }),
  useRouter: () => ({ replace }),
}))
vi.mock('../gateways/registry', () => ({
  DEFAULT_PAYMENT_PROVIDER: 'payphone',
  findPaymentGateway: () => ({ parseReturn }),
}))
vi.mock('./mutations/use-confirm-payment', () => ({
  useConfirmPayment: () => ({ mutateAsync: confirm }),
}))
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

const TX_URL = '/payments/transactions/tx-1'
const ORDER_URL = '/orders/me/o1'

function notFound() {
  const response = { status: 404, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('nf', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const transaction = (status: string) => ({
  data: {
    clientTransactionId: 'tx-1',
    status,
    amountCents: 900,
    orderIds: ['o1'],
    failureMessage: null,
    deliveries: [],
  },
})
const order = (state: string) => ({
  data: {
    id: 'o1',
    state,
    eventName: 'x',
    createdAt: '2026-11-13T00:00:00.000Z',
    subtotal: '9.00',
    snapCurrency: 'USD',
    canDownload: state === 'ready',
    canCancel: false,
    photos: [],
    invoice: null,
    billing: null,
    confirmingTransactionId: null,
  },
})

/** Answers by url; a function answer is called on each request. */
function serve(routes: Record<string, unknown>) {
  get.mockImplementation(async (url: string) => {
    const answer = routes[url]
    const value = typeof answer === 'function' ? (answer as () => unknown)() : answer
    if (value instanceof Error) throw value
    if (value === undefined) throw new AxiosError('Network Error', 'ERR_NETWORK')
    return value
  })
}

const calls = (url: string) => get.mock.calls.filter(([each]) => each === url).length

let state: ReturnType<typeof usePaymentReturn>
let wrapper: ReturnType<typeof mount> | null = null

async function start() {
  const Host = defineComponent({
    setup() {
      state = usePaymentReturn()
      return () => null
    },
  })
  wrapper = mount(Host, {
    global: { plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]] },
  })
  await flushPromises()
}

async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

describe('usePaymentReturn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    replace.mockReset()
    confirm.mockReset()
    get.mockReset()
    parseReturn.mockReset()
    parseReturn.mockReturnValue({ id: 7, clientTransactionId: 'tx-1' })
    serve({ [TX_URL]: transaction('initiated') })
  })
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.useRealTimers()
  })

  it('confirms the payment once on entering', async () => {
    confirm.mockResolvedValue({
      approved: false,
      settled: false,
      orderIds: ['o1'],
      message: null,
      deliveries: [],
    })
    await start()

    expect(confirm).toHaveBeenCalledTimes(1)
    expect(confirm).toHaveBeenCalledWith({ id: 7, clientTransactionId: 'tx-1' })
    expect(state.outcome.value).toBe('declined')
    expect(state.orderIds.value).toEqual(['o1'])
  })

  it('opens the confirmed order when the charge is approved and settled', async () => {
    confirm.mockResolvedValue({
      approved: true,
      settled: true,
      orderIds: ['o1', 'o2'],
      message: null,
      deliveries: [],
    })
    await start()

    expect(state.outcome.value).toBe('confirmed')
    expect(replace).toHaveBeenCalledWith('/checkout/confirmed/o1')
  })

  it('reads a resolved transaction instead of confirming again (reload, back)', async () => {
    serve({ [TX_URL]: transaction('declined') })
    await start()

    expect(confirm).not.toHaveBeenCalled()
    expect(state.outcome.value).toBe('declined')
  })

  it('says it is late after ten seconds without an answer', async () => {
    confirm.mockReturnValue(new Promise(() => {}))
    await start()

    await advance(9_999)
    expect(state.outcome.value).toBe('confirming')
    await advance(1)
    expect(state.outcome.value).toBe('late')
  })

  it('says a charge for an order that no longer took it is refunded, and why, without asking again', async () => {
    confirm.mockResolvedValue({
      approved: true,
      settled: false,
      orderIds: ['o1'],
      message: null,
      deliveries: [],
      refund: { reason: 'order_paid' },
    })
    serve({ [TX_URL]: transaction('approved') })
    await start()

    expect(state.outcome.value).toBe('refunded')
    expect(state.refundReason.value).toBe('order_paid')
    get.mockClear()
    await advance(30_000)
    expect(get).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it('keeps an approved charge that is not settled as late, never confirmed', async () => {
    confirm.mockResolvedValue({
      approved: true,
      settled: false,
      orderIds: ['o1'],
      message: null,
      deliveries: [],
    })
    serve({ [TX_URL]: transaction('approved'), [ORDER_URL]: order('confirming') })
    await start()

    expect(state.outcome.value).toBe('late')
    await advance(30_000)
    expect(state.outcome.value).toBe('late')
    expect(replace).not.toHaveBeenCalled()
  })

  it('asks again every five seconds while late, and opens the order once it is ready', async () => {
    confirm.mockReturnValue(new Promise(() => {}))
    let ready = false
    serve({
      [TX_URL]: () => transaction(ready ? 'approved' : 'confirming'),
      [ORDER_URL]: () => order(ready ? 'ready' : 'confirming'),
    })
    await start()
    await advance(10_000)
    const before = calls(TX_URL)

    await advance(5_000)
    expect(calls(TX_URL)).toBe(before + 1)
    expect(state.outcome.value).toBe('late')

    ready = true
    await advance(5_000)
    expect(state.outcome.value).toBe('confirmed')
    expect(replace).toHaveBeenCalledWith('/checkout/confirmed/o1')
  })

  it('moves to declined when the order disappears while late', async () => {
    confirm.mockReturnValue(new Promise(() => {}))
    let gone = false
    serve({
      [TX_URL]: transaction('confirming'),
      [ORDER_URL]: () => (gone ? notFound() : order('confirming')),
    })
    await start()
    await advance(15_000)
    expect(state.outcome.value).toBe('late')

    gone = true
    await advance(5_000)
    expect(state.outcome.value).toBe('declined')
  })

  it('moves to declined when the transaction is declined while late', async () => {
    confirm.mockReturnValue(new Promise(() => {}))
    let declined = false
    serve({
      [TX_URL]: () => transaction(declined ? 'declined' : 'confirming'),
      [ORDER_URL]: order('confirming'),
    })
    await start()
    await advance(10_000)

    declined = true
    await advance(5_000)
    expect(state.outcome.value).toBe('declined')
  })

  it('stops asking after two minutes', async () => {
    confirm.mockReturnValue(new Promise(() => {}))
    serve({ [TX_URL]: transaction('confirming'), [ORDER_URL]: order('confirming') })
    await start()
    await advance(10_000)
    expect(state.isAsking.value).toBe(true)
    await advance(120_000)
    const after = calls(TX_URL)
    expect(state.isAsking.value).toBe(false)

    await advance(30_000)
    expect(calls(TX_URL)).toBe(after)
    expect(state.outcome.value).toBe('late')
  })

  it('stops asking when the screen is left', async () => {
    confirm.mockReturnValue(new Promise(() => {}))
    serve({ [TX_URL]: transaction('confirming'), [ORDER_URL]: order('confirming') })
    await start()
    await advance(15_000)
    const before = calls(TX_URL)

    wrapper!.unmount()
    wrapper = null
    await advance(30_000)
    expect(calls(TX_URL)).toBe(before)
  })

  it('fails when nothing could be asked, and tries again on retry', async () => {
    serve({})
    confirm.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
    await start()
    expect(state.outcome.value).toBe('failed')

    confirm.mockResolvedValue({
      approved: true,
      settled: true,
      orderIds: ['o1'],
      message: null,
      deliveries: [],
    })
    state.retry()
    await flushPromises()

    expect(confirm).toHaveBeenCalledTimes(2)
    expect(state.outcome.value).toBe('confirmed')
  })

  // The gateway comes back without a payment id (id=0, or none) when the buyer cancels there:
  // nothing was charged, and there is nothing to confirm.
  it('says the payment was cancelled at the gateway, without confirming, and finds its orders', async () => {
    parseReturn.mockReturnValue(null)
    get.mockResolvedValue(transaction('initiated'))
    await start()

    expect(state.outcome.value).toBe('cancelled')
    expect(confirm).not.toHaveBeenCalled()
    expect(get).toHaveBeenCalledWith(TX_URL, { silent: true })
    expect(state.orderIds.value).toEqual(['o1'])
  })

  it('still says cancelled when its orders cannot be found', async () => {
    parseReturn.mockReturnValue(null)
    get.mockRejectedValue(notFound())
    await start()

    expect(state.outcome.value).toBe('cancelled')
    expect(state.orderIds.value).toEqual([])
  })
})
