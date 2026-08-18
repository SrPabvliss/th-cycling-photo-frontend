import { flushPromises, mount } from '@vue/test-utils'
import { NModal } from 'naive-ui'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import PaymentMethodModal from './PaymentMethodModal.vue'

const checkout = vi.fn(() =>
  Promise.resolve([
    {
      orderId: 'order-1',
      eventName: 'Vuelta al Valle',
      photoCount: 3,
      subtotal: 25,
      currency: 'USD',
    },
  ]),
)

const chooseMethod = vi.fn(() => Promise.resolve({ orderIds: ['order-9'] }))

vi.mock('@/features/cart/composables/mutations/use-checkout', () => ({
  useCheckout: () => ({ mutateAsync: checkout, isPending: ref(false) }),
}))

vi.mock('@/features/payments/composables/mutations/use-choose-payment-method', () => ({
  useChoosePaymentMethod: () => ({ mutateAsync: chooseMethod, isPending: ref(false) }),
}))

vi.mock('@/features/payments/composables/mutations/use-create-payment-intent', () => ({
  useCreatePaymentIntent: () => ({ mutateAsync: vi.fn() }),
}))

afterEach(() => {
  checkout.mockClear()
  chooseMethod.mockClear()
})

function mountModal(orderIds?: string[]) {
  return mount(PaymentMethodModal, {
    props: { show: true, total: 25, currency: 'USD', orderIds },
    global: { stubs: { Modal: { template: '<div><slot /></div>' }, PaymentCheckout: true } },
  })
}

describe('PaymentMethodModal — new checkout (no orderIds)', () => {
  it('checks out with transfer and reports the created orders upward', async () => {
    const wrapper = mountModal()

    await wrapper.get('[data-test="method-transfer"]').trigger('click')
    await flushPromises()

    expect(checkout).toHaveBeenCalledWith('transfer')
    expect(chooseMethod).not.toHaveBeenCalled()
    expect(wrapper.emitted('paid-orders')).toHaveLength(1)
    expect(wrapper.emitted('paid-orders')?.[0]).toEqual([
      [
        {
          orderId: 'order-1',
          eventName: 'Vuelta al Valle',
          photoCount: 3,
          subtotal: 25,
          currency: 'USD',
        },
      ],
    ])
    expect(wrapper.emitted('method-chosen')?.[0]).toEqual(['transfer'])
    const showEvents = wrapper.emitted('update:show') ?? []
    expect(showEvents[showEvents.length - 1]).toEqual([false])
  })

  it('checks out with card and renders the payment box with the returned ids', async () => {
    const wrapper = mountModal()

    await wrapper.get('[data-test="method-card"]').trigger('click')
    await flushPromises()

    expect(checkout).toHaveBeenCalledWith('card')
    expect(chooseMethod).not.toHaveBeenCalled()
    const paymentCheckout = wrapper.findComponent({ name: 'PaymentCheckout' })
    expect(paymentCheckout.exists()).toBe(true)
    expect(paymentCheckout.props('orderIds')).toEqual(['order-1'])
    expect(wrapper.emitted('paid-orders')).toBeUndefined()
    expect(wrapper.emitted('method-chosen')?.[0]).toEqual(['card'])
  })
})

describe('PaymentMethodModal — retry on existing orders (orderIds given)', () => {
  it('records the transfer choice against the given ids without calling checkout', async () => {
    const wrapper = mountModal(['order-9'])

    await wrapper.get('[data-test="method-transfer"]').trigger('click')
    await flushPromises()

    expect(chooseMethod).toHaveBeenCalledWith({ orderIds: ['order-9'], method: 'transfer' })
    expect(checkout).not.toHaveBeenCalled()
    expect(wrapper.emitted('paid-orders')).toBeUndefined()
    expect(wrapper.emitted('method-chosen')?.[0]).toEqual(['transfer'])
    const showEvents = wrapper.emitted('update:show') ?? []
    expect(showEvents[showEvents.length - 1]).toEqual([false])
  })

  it('records the card choice and renders the payment box with the given ids, without calling checkout', async () => {
    const wrapper = mountModal(['order-9'])

    await wrapper.get('[data-test="method-card"]').trigger('click')
    await flushPromises()

    expect(chooseMethod).toHaveBeenCalledWith({ orderIds: ['order-9'], method: 'card' })
    expect(checkout).not.toHaveBeenCalled()
    const paymentCheckout = wrapper.findComponent({ name: 'PaymentCheckout' })
    expect(paymentCheckout.exists()).toBe(true)
    expect(paymentCheckout.props('orderIds')).toEqual(['order-9'])
    expect(wrapper.emitted('method-chosen')?.[0]).toEqual(['card'])
  })
})

describe('PaymentMethodModal — shared behaviour', () => {
  it('goes back to the choice from the box, which is the way out after a decline', async () => {
    const wrapper = mountModal()

    await wrapper.get('[data-test="method-card"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="method-back"]').trigger('click')

    expect(wrapper.get('[data-test="method-transfer"]').isVisible()).toBe(true)
  })

  it('never names the payment provider to the buyer', () => {
    expect(mountModal().text().toLowerCase()).not.toContain('payphone')
  })

  it('switches from card to transfer through chooseExisting once the drafts already exist, never calling checkout twice', async () => {
    const wrapper = mountModal()

    await wrapper.get('[data-test="method-card"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="method-back"]').trigger('click')
    await wrapper.get('[data-test="method-transfer"]').trigger('click')
    await flushPromises()

    expect(checkout).toHaveBeenCalledTimes(1)
    expect(checkout).toHaveBeenCalledWith('card')
    expect(chooseMethod).toHaveBeenCalledTimes(1)
    expect(chooseMethod).toHaveBeenCalledWith({ orderIds: ['order-1'], method: 'transfer' })
    const showEvents = wrapper.emitted('update:show') ?? []
    expect(showEvents[showEvents.length - 1]).toEqual([false])
  })

  it('shows the summed total from the checkout response on the card step, not the prop total', async () => {
    checkout.mockResolvedValueOnce([
      {
        orderId: 'order-1',
        eventName: 'Vuelta al Valle',
        photoCount: 3,
        subtotal: 25,
        currency: 'USD',
      },
      {
        orderId: 'order-2',
        eventName: 'Ronda del Lago',
        photoCount: 2,
        subtotal: 10,
        currency: 'USD',
      },
    ])
    const wrapper = mount(PaymentMethodModal, {
      props: { show: true, total: 0, currency: 'USD' },
      global: { stubs: { Modal: { template: '<div><slot /></div>' }, PaymentCheckout: true } },
    })

    await wrapper.get('[data-test="method-card"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('.payment-method-modal__total').text()).toContain('$35.00')
    expect(wrapper.get('.payment-method-modal__total').text()).not.toContain('$0.00')
  })

  it('is not dismissible by mask click or close button once on the card step', async () => {
    const wrapper = mount(PaymentMethodModal, {
      props: { show: true, total: 25, currency: 'USD' },
      attachTo: document.body,
      global: { stubs: { PaymentCheckout: true } },
    })

    expect(wrapper.getComponent(NModal).props('maskClosable')).toBe(true)
    expect(wrapper.getComponent(NModal).props('closable')).toBe(true)

    const cardButton = document.body.querySelector<HTMLButtonElement>('[data-test="method-card"]')
    cardButton?.click()
    await flushPromises()

    expect(wrapper.getComponent(NModal).props('maskClosable')).toBe(false)
    expect(wrapper.getComponent(NModal).props('closable')).toBe(false)

    wrapper.unmount()
  })
})
