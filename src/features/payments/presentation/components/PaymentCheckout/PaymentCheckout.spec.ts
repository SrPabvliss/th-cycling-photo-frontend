import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

const createIntent = vi.fn().mockResolvedValue({ provider: 'payphone', payload: { token: 't' } })
const confirmPayment = vi.fn().mockResolvedValue({ approved: true, orderId: 'o-1', message: null })

const isReady = ref(true)
const isProcessing = ref(false)
let resolvePay: (outcome: { transactionId: number; clientTransactionId: string }) => void
const pay = vi.fn(() => {
  isProcessing.value = true
  return new Promise<{ transactionId: number; clientTransactionId: string }>((resolve) => {
    resolvePay = (outcome) => {
      isProcessing.value = false
      resolve(outcome)
    }
  })
})
const render = vi.fn().mockResolvedValue(undefined)
const destroy = vi.fn()

vi.mock('@/features/payments/composables/mutations/use-create-payment-intent', () => ({
  useCreatePaymentIntent: () => ({ mutateAsync: createIntent }),
}))
vi.mock('@/features/payments/composables/mutations/use-confirm-payment', () => ({
  useConfirmPayment: () => ({ mutateAsync: confirmPayment }),
}))
vi.mock('@/features/payments/gateways/payphone/use-payphone-box', () => ({
  usePayphoneBox: () => ({ isReady, isProcessing, render, pay, destroy }),
}))

import PaymentCheckout from './PaymentCheckout.vue'

describe('PaymentCheckout', () => {
  beforeEach(() => {
    isReady.value = true
    isProcessing.value = false
    createIntent.mockClear()
    confirmPayment.mockClear()
    render.mockClear()
    destroy.mockClear()
    pay.mockClear()
    confirmPayment.mockResolvedValue({ approved: true, orderId: 'o-1', message: null })
    createIntent.mockResolvedValue({ provider: 'payphone', payload: { token: 't' } })
  })

  it('asks for a fresh intent before a second attempt after a decline', async () => {
    confirmPayment.mockResolvedValue({ approved: false, orderId: 'o-1', message: 'Rechazado' })

    const w = mount(PaymentCheckout, { props: { orderId: 'o-1' } })
    await flushPromises()

    expect(createIntent).toHaveBeenCalledTimes(1)

    w.get('button').element.click()
    resolvePay({ transactionId: 1, clientTransactionId: 'tt-1' })
    await flushPromises()

    expect(w.emitted('declined')).toEqual([['Rechazado']])
    expect(destroy).toHaveBeenCalled()

    const retryButton = w.get('button')
    expect(retryButton.text()).toBe('Reintentar')

    retryButton.element.click()
    await flushPromises()

    expect(createIntent).toHaveBeenCalledTimes(2)
    expect(render).toHaveBeenCalledTimes(2)
  })

  it('ignores a second call to pay while the first is still in flight', async () => {
    const w = mount(PaymentCheckout, { props: { orderId: 'o-1' } })
    await flushPromises()

    const button = w.get('button').element as HTMLButtonElement
    button.click()
    button.click()

    expect(pay).toHaveBeenCalledTimes(1)

    resolvePay({ transactionId: 1, clientTransactionId: 'tt-1' })
    await flushPromises()

    expect(confirmPayment).toHaveBeenCalledTimes(1)
    expect(w.emitted('paid')).toEqual([['o-1']])
  })

  it('refuses a second pay attempt once the payment was approved', async () => {
    const w = mount(PaymentCheckout, { props: { orderId: 'o-1' } })
    await flushPromises()

    const button = w.get('button').element as HTMLButtonElement
    button.click()
    resolvePay({ transactionId: 1, clientTransactionId: 'tt-1' })
    await flushPromises()

    expect(w.emitted('paid')).toEqual([['o-1']])
    expect(pay).toHaveBeenCalledTimes(1)

    button.click()
    await flushPromises()

    expect(pay).toHaveBeenCalledTimes(1)
    expect(confirmPayment).toHaveBeenCalledTimes(1)
    expect(w.emitted('paid')).toEqual([['o-1']])
  })

  it('shows a spanish message and a retry button when the setup fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    createIntent.mockRejectedValue(new Error('Request failed with status code 500'))

    const w = mount(PaymentCheckout, { props: { orderId: 'o-1' } })
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

    const w = mount(PaymentCheckout, { props: { orderId: 'o-1' } })
    await flushPromises()

    const retryButton = w.get('button').element as HTMLButtonElement
    retryButton.click()
    retryButton.click()

    expect(createIntent).toHaveBeenCalledTimes(2)

    await flushPromises()
    consoleError.mockRestore()
  })
})
