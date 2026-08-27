import { flushPromises, mount } from '@vue/test-utils'
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
const push = vi.fn()

vi.mock('@/shared/composables/use-checkout', () => ({
  useCheckout: () => ({ mutateAsync: checkout, isPending: ref(false) }),
}))

vi.mock('@/shared/composables/use-choose-payment-method', () => ({
  useChoosePaymentMethod: () => ({ mutateAsync: chooseMethod, isPending: ref(false) }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

afterEach(() => {
  checkout.mockClear()
  chooseMethod.mockClear()
  push.mockClear()
})

function mountModal(orderIds?: string[]) {
  return mount(PaymentMethodModal, {
    props: { show: true, total: 25, currency: 'USD', orderIds, eventId: 'event-1' },
    global: { stubs: { Modal: { template: '<div><slot /></div>' } } },
  })
}

describe('PaymentMethodModal — new checkout (no orderIds)', () => {
  it('checks out with transfer and reports the created orders upward', async () => {
    const wrapper = mountModal()

    await wrapper.get('[data-test="method-transfer"]').trigger('click')
    await flushPromises()

    expect(checkout).toHaveBeenCalledWith({ eventId: 'event-1', method: 'transfer' })
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

  it('checks out with card and navigates to the payment box with the returned ids', async () => {
    const wrapper = mountModal()

    await wrapper.get('[data-test="method-card"]').trigger('click')
    await flushPromises()

    expect(checkout).toHaveBeenCalledWith({ eventId: 'event-1', method: 'card' })
    expect(chooseMethod).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({
      name: 'payment-box',
      query: { orders: 'order-1' },
    })
    expect(wrapper.emitted('paid-orders')).toBeUndefined()
    expect(wrapper.emitted('method-chosen')?.[0]).toEqual(['card'])
    const showEvents = wrapper.emitted('update:show') ?? []
    expect(showEvents[showEvents.length - 1]).toEqual([false])
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

  it('records the card choice and navigates to the payment box with the given ids, without calling checkout', async () => {
    const wrapper = mountModal(['order-9'])

    await wrapper.get('[data-test="method-card"]').trigger('click')
    await flushPromises()

    expect(chooseMethod).toHaveBeenCalledWith({ orderIds: ['order-9'], method: 'card' })
    expect(checkout).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({
      name: 'payment-box',
      query: { orders: 'order-9' },
    })
    expect(wrapper.emitted('method-chosen')?.[0]).toEqual(['card'])
    const showEvents = wrapper.emitted('update:show') ?? []
    expect(showEvents[showEvents.length - 1]).toEqual([false])
  })
})

describe('PaymentMethodModal — shared behaviour', () => {
  it('never names the payment provider to the buyer', () => {
    expect(mountModal().text().toLowerCase()).not.toContain('payphone')
  })

  it('shows the prop total regardless of method chosen', () => {
    const wrapper = mountModal()

    expect(wrapper.get('.payment-method-modal__total').text()).toContain('$25.00')
  })
})
