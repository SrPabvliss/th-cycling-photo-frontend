import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const createIntent = vi.fn().mockResolvedValue({ provider: 'payphone', payload: { token: 't' } })

const isReady = ref(true)
const render = vi.fn().mockResolvedValue(undefined)
const destroy = vi.fn()

vi.mock('@/features/payments/composables/mutations/use-create-payment-intent', () => ({
  useCreatePaymentIntent: () => ({ mutateAsync: createIntent }),
}))
vi.mock('@/features/payments/gateways/payphone/use-payphone-box', () => ({
  usePayphoneBox: () => ({ isReady, render, destroy }),
}))

import PaymentCheckout from './PaymentCheckout.vue'

function mountCheckout(props: { orderIds: string[] }) {
  const w = mount(PaymentCheckout, { props })
  return { w, createIntent }
}

describe('PaymentCheckout', () => {
  beforeEach(() => {
    isReady.value = true
    createIntent.mockClear()
    render.mockClear()
    destroy.mockClear()
    createIntent.mockResolvedValue({ provider: 'payphone', payload: { token: 't' } })
  })

  it('asks for one intent covering every order it was given', async () => {
    const { createIntent } = mountCheckout({ orderIds: ['order-1', 'order-2'] })

    await flushPromises()

    expect(createIntent).toHaveBeenCalledWith(['order-1', 'order-2'])
  })

  it('surfaces the server message when the intent fails for a reason retrying cannot fix', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    createIntent.mockRejectedValue({
      response: {
        data: {
          error: { message: 'No puedes pagar fotos de dos fotógrafos distintos en un solo pago.' },
        },
      },
    })

    const { w } = mountCheckout({ orderIds: ['order-1', 'order-2'] })
    await flushPromises()

    expect(w.text()).toContain('No puedes pagar fotos de dos fotógrafos distintos en un solo pago.')
    expect(w.text()).not.toContain('No podemos procesar pagos en este momento.')

    consoleError.mockRestore()
  })

  it('shows a spanish message and a retry button when the setup fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    createIntent.mockRejectedValue(new Error('Request failed with status code 500'))

    const { w } = mountCheckout({ orderIds: ['order-1'] })
    await flushPromises()

    expect(w.text()).not.toContain('Request failed with status code 500')
    expect(w.text()).toContain('No podemos procesar pagos en este momento.')

    const retryButton = w.get('button')
    expect(retryButton.text()).toBe('Reintentar')

    createIntent.mockResolvedValue({ provider: 'payphone', payload: { token: 't' } })
    retryButton.element.click()
    await flushPromises()

    expect(createIntent).toHaveBeenCalledTimes(2)
    expect(w.text()).not.toContain('No podemos procesar pagos en este momento.')
    consoleError.mockRestore()
  })

  it('creates a single intent when retry is clicked twice', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    createIntent.mockRejectedValue(new Error('boom'))

    const { w } = mountCheckout({ orderIds: ['order-1'] })
    await flushPromises()

    const retryButton = w.get('button').element as HTMLButtonElement
    retryButton.click()
    retryButton.click()

    expect(createIntent).toHaveBeenCalledTimes(2)

    await flushPromises()
    consoleError.mockRestore()
  })

  it('emits setup-failed when the intent cannot be created', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('boom')
    createIntent.mockRejectedValue(error)

    const { w } = mountCheckout({ orderIds: ['order-1'] })
    await flushPromises()

    expect(w.emitted('setup-failed')).toEqual([[error]])
    consoleError.mockRestore()
  })
})
