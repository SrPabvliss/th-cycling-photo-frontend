import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { ORDER_STATUS } from '../types/responses/order-list.response'
import type { IOrderListItem } from '../types/responses/order-list.response'
import {
  useGroupedOrders,
  type IOrderGroupCardRow,
  type IOrderGroupSeparatorRow,
} from './use-grouped-orders'

function makeOrder(overrides: Partial<IOrderListItem> & { id: string }): IOrderListItem {
  return {
    status: ORDER_STATUS.PENDING,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    notifiedAt: null,
    paidAt: null,
    deliveredAt: null,
    userName: 'user',
    userId: 'user-1',
    customerFirstName: 'Pablo',
    customerLastName: 'Guerrero',
    customerEmail: 'pablo@example.com',
    customerPrimaryPhone: '+593999000000',
    snapWhatsapp: null,
    eventName: 'Evento',
    photoCount: 1,
    hasDeliveryLink: false,
    subtotal: null,
    snapCurrency: null,
    paymentMethod: null,
    previewPhotos: [],
    ...overrides,
  }
}

describe('useGroupedOrders', () => {
  it('returns empty array for empty input', () => {
    const rows = useGroupedOrders(ref<IOrderListItem[]>([]))
    expect(rows.value).toEqual([])
  })

  it('groups two customers with two orders each and orders by most-recent-customer first', () => {
    const orders = ref<IOrderListItem[]>([
      makeOrder({
        id: 'a1',
        userId: 'user-a',
        customerFirstName: 'Ana',
        customerLastName: 'Lopez',
        createdAt: new Date('2026-01-10T10:00:00Z'),
      }),
      makeOrder({
        id: 'a2',
        userId: 'user-a',
        customerFirstName: 'Ana',
        customerLastName: 'Lopez',
        createdAt: new Date('2026-01-12T10:00:00Z'),
      }),
      makeOrder({
        id: 'b1',
        userId: 'user-b',
        customerFirstName: 'Bruno',
        customerLastName: 'Diaz',
        createdAt: new Date('2026-01-15T10:00:00Z'),
      }),
      makeOrder({
        id: 'b2',
        userId: 'user-b',
        customerFirstName: 'Bruno',
        customerLastName: 'Diaz',
        createdAt: new Date('2026-01-14T10:00:00Z'),
      }),
    ])

    const rows = useGroupedOrders(orders).value

    expect(rows).toHaveLength(6)
    expect(rows[0]).toMatchObject({ type: 'separator', customerLabel: 'Bruno Diaz', orderCount: 2 })
    expect(rows[1]).toMatchObject({ type: 'card', positionInGroup: 1 })
    expect((rows[1] as IOrderGroupCardRow).order.id).toBe('b1')
    expect(rows[2]).toMatchObject({ type: 'card', positionInGroup: 2 })
    expect((rows[2] as IOrderGroupCardRow).order.id).toBe('b2')
    expect(rows[3]).toMatchObject({ type: 'separator', customerLabel: 'Ana Lopez', orderCount: 2 })
    expect((rows[4] as IOrderGroupCardRow).order.id).toBe('a2')
    expect((rows[5] as IOrderGroupCardRow).order.id).toBe('a1')
  })

  it('sorts within a group by createdAt desc and increments positionInGroup', () => {
    const orders = ref<IOrderListItem[]>([
      makeOrder({ id: 'o1', userId: 'u', createdAt: new Date('2026-01-01T00:00:00Z') }),
      makeOrder({ id: 'o2', userId: 'u', createdAt: new Date('2026-01-03T00:00:00Z') }),
      makeOrder({ id: 'o3', userId: 'u', createdAt: new Date('2026-01-02T00:00:00Z') }),
    ])

    const rows = useGroupedOrders(orders).value
    const cards = rows.filter((r): r is IOrderGroupCardRow => r.type === 'card')

    expect(cards.map((c) => c.order.id)).toEqual(['o2', 'o3', 'o1'])
    expect(cards.map((c) => c.positionInGroup)).toEqual([1, 2, 3])
    expect(cards.map((c) => c.totalInGroup)).toEqual([3, 3, 3])
  })

  it('sets isLatestForCustomer only on position 1', () => {
    const orders = ref<IOrderListItem[]>([
      makeOrder({ id: 'o1', userId: 'u', createdAt: new Date('2026-01-01T00:00:00Z') }),
      makeOrder({ id: 'o2', userId: 'u', createdAt: new Date('2026-01-02T00:00:00Z') }),
    ])

    const rows = useGroupedOrders(orders).value
    const cards = rows.filter((r): r is IOrderGroupCardRow => r.type === 'card')
    expect(cards[0]!.isLatestForCustomer).toBe(true)
    expect(cards[1]!.isLatestForCustomer).toBe(false)
  })

  it('renders separator + card for single-order group', () => {
    const orders = ref<IOrderListItem[]>([
      makeOrder({ id: 'only', userId: 'u', customerFirstName: 'Solo', customerLastName: 'Uno' }),
    ])

    const rows = useGroupedOrders(orders).value
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ type: 'separator', customerLabel: 'Solo Uno', orderCount: 1 })
    expect(rows[1]).toMatchObject({ type: 'card', positionInGroup: 1, totalInGroup: 1 })
  })

  it('places orders with missing userId in the "Sin cliente" group at the end', () => {
    const orders = ref<IOrderListItem[]>([
      makeOrder({
        id: 'orphan',
        userId: '',
        customerFirstName: null,
        customerLastName: null,
        createdAt: new Date('2026-05-01T00:00:00Z'),
      }),
      makeOrder({
        id: 'known',
        userId: 'user-known',
        customerFirstName: 'Conocido',
        customerLastName: 'Cliente',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      }),
    ])

    const rows = useGroupedOrders(orders).value
    expect(rows[0]).toMatchObject({ type: 'separator', customerLabel: 'Conocido Cliente' })
    const lastSeparator = rows.find(
      (r, i) => r.type === 'separator' && i > 0,
    ) as IOrderGroupSeparatorRow
    expect(lastSeparator.customerLabel).toBe('Sin cliente')
    expect(lastSeparator.key).toBe('sep:unassigned')
  })

  it('uses "Sin nombre" when both firstName and lastName are null', () => {
    const orders = ref<IOrderListItem[]>([
      makeOrder({
        id: 'x',
        userId: 'u',
        customerFirstName: null,
        customerLastName: null,
      }),
    ])
    const separator = useGroupedOrders(orders).value[0] as IOrderGroupSeparatorRow
    expect(separator.customerLabel).toBe('Sin nombre')
  })

  it('trims the customer label when only firstName is present', () => {
    const orders = ref<IOrderListItem[]>([
      makeOrder({
        id: 'x',
        userId: 'u',
        customerFirstName: 'Pablo',
        customerLastName: null,
      }),
    ])
    const separator = useGroupedOrders(orders).value[0] as IOrderGroupSeparatorRow
    expect(separator.customerLabel).toBe('Pablo')
  })
})
