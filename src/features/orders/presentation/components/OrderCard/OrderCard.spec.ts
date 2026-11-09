import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ORDER_STATUS } from '@/shared/types/order-status.types'
import type { IOrderListItem } from '../../../types/responses/order-list.response'
import OrderCard from './OrderCard.vue'

vi.mock('@/core/auth/use-permissions', () => ({
  usePermissions: () => ({ has: () => true }),
}))

function order(overrides: Partial<IOrderListItem> = {}): IOrderListItem {
  return {
    id: 'order-1',
    status: ORDER_STATUS.PAID,
    userName: 'Andrés Boxes',
    snapWhatsapp: '+593984198999',
    snapCurrency: 'USD',
    eventName: 'Downhill Lumbisí',
    photoCount: 3,
    subtotal: 9,
    createdAt: new Date(),
    deliveredAt: null,
    hasDeliveryLink: false,
    previewPhotos: [],
    ...overrides,
  } as IOrderListItem
}

describe('OrderCard', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('hands the whole order to the delivery action, not just its id', async () => {
    const wrapper = mount(OrderCard, { props: { order: order(), role: 'titan' } as never })

    await wrapper.get('.oc__btn--send').trigger('click')

    // The phone the message is sent to lives on the order: emitting only the id used to open
    // WhatsApp with no recipient, dropping the operator into the contact picker.
    expect(wrapper.emitted('sendDelivery')?.[0]?.[0]).toMatchObject({
      id: 'order-1',
      snapWhatsapp: '+593984198999',
    })
  })

  it('hands the whole order to the resend action too', async () => {
    const delivered = order({
      status: ORDER_STATUS.DELIVERED,
      deliveredAt: new Date(),
      hasDeliveryLink: true,
    })
    const wrapper = mount(OrderCard, { props: { order: delivered, role: 'titan' } as never })

    await wrapper.get('.oc__btn--wa').trigger('click')

    expect(wrapper.emitted('resendDelivery')?.[0]?.[0]).toMatchObject({
      snapWhatsapp: '+593984198999',
    })
  })
})
