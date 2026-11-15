import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { defineComponent, ref } from 'vue'

import { useDeclinedActions } from './use-declined-actions'

const replace = vi.fn()
const patch = vi.fn()

vi.mock('vue-router', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { patch: (...args: unknown[]) => patch(...args) },
}))

let actions: ReturnType<typeof useDeclinedActions>
let queryClient: QueryClient

function setup(ids = ['o1', 'o2']) {
  queryClient = new QueryClient()
  const Host = defineComponent({
    setup() {
      actions = useDeclinedActions(ref(ids))
      return () => null
    },
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
}

describe('useDeclinedActions', () => {
  beforeEach(() => {
    replace.mockReset()
    patch.mockReset()
  })

  it('switches the orders to transfer once, even on a double tap, and opens the received order', async () => {
    let answer: (value: unknown) => void = () => {}
    patch.mockReturnValue(new Promise((resolve) => (answer = resolve)))
    setup()

    const first = actions.payByTransfer()
    const second = actions.payByTransfer()
    expect(actions.isSwitching.value).toBe(true)
    answer({ data: { orderIds: ['o1', 'o2'] } })
    await Promise.all([first, second])
    await flushPromises()

    expect(patch).toHaveBeenCalledTimes(1)
    expect(patch).toHaveBeenCalledWith(
      '/orders/payment-method',
      { orderIds: ['o1', 'o2'], method: 'transfer' },
      { silent: true },
    )
    expect(replace).toHaveBeenCalledWith('/checkout/received/o1')
    expect(actions.isSwitching.value).toBe(false)
  })

  it('reads the orders and the cart again after switching', async () => {
    patch.mockResolvedValue({ data: { orderIds: ['o1'] } })
    setup(['o1'])
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await actions.payByTransfer()

    const keys = invalidate.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey))
    expect(keys.some((key) => key.includes('cart'))).toBe(true)
    expect(keys.some((key) => key.includes('orders'))).toBe(true)
  })

  it('says what went wrong, and stays, when the switch fails', async () => {
    patch.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
    setup()

    await actions.payByTransfer()

    expect(actions.problem.value).toBe('network')
    expect(actions.isSwitching.value).toBe(false)
    expect(replace).not.toHaveBeenCalled()
  })

  it('counts a server failure as one to try again', async () => {
    const response = { status: 503, data: {}, headers: {}, config: {} } as AxiosResponse
    patch.mockRejectedValue(
      new AxiosError('down', 'ERR_BAD_RESPONSE', undefined, undefined, response),
    )
    setup()

    await actions.payByTransfer()

    expect(actions.problem.value).toBe('network')
  })

  it('clears the last problem when trying again', async () => {
    patch.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
    patch.mockResolvedValueOnce({ data: { orderIds: ['o1'] } })
    setup()

    await actions.payByTransfer()
    await actions.payByTransfer()

    expect(actions.problem.value).toBeNull()
  })

  it('does nothing without orders', async () => {
    setup([])

    await actions.payByTransfer()

    expect(patch).not.toHaveBeenCalled()
  })
})
