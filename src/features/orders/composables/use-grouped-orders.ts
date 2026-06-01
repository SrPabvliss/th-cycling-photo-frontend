import { computed, type ComputedRef, type Ref } from 'vue'

import type { IOrderListItem } from '../types/responses/order-list.response'

const UNASSIGNED_KEY = 'unassigned'
const UNASSIGNED_LABEL = 'Sin cliente'
const UNNAMED_LABEL = 'Sin nombre'

export interface IOrderGroupSeparatorRow {
  type: 'separator'
  /** Stable key for `v-for`. Format: `sep:<userId|unassigned>`. */
  key: string
  /** Display label, e.g. `"Pablo Guerrero"`, `"Sin nombre"`, or `"Sin cliente"`. */
  customerLabel: string
  /** Raw phone; the view is responsible for formatting. */
  customerPhone: string | null
  /**
   * Number of orders for this customer present in the CURRENT filtered/loaded
   * `orders` input. Grows as more pages of the same customer arrive — this is
   * intentional: it reflects the "X de N dentro del filtro" semantics.
   */
  orderCount: number
}

export interface IOrderGroupCardRow {
  type: 'card'
  /** Stable key for `v-for`. Format: `card:<orderId>`. */
  key: string
  order: IOrderListItem
  /** 1-based. `1` is the most recent order in the group. */
  positionInGroup: number
  /** Same value as the separator's `orderCount`. */
  totalInGroup: number
  /** Convenience flag: `positionInGroup === 1`. */
  isLatestForCustomer: boolean
}

export type IOrderGroupRow = IOrderGroupSeparatorRow | IOrderGroupCardRow

interface IGroupAccumulator {
  key: string
  userId: string | null
  label: string
  phone: string | null
  items: IOrderListItem[]
}

function resolveCustomerLabel(order: IOrderListItem): string {
  const first = order.customerFirstName?.trim() ?? ''
  const last = order.customerLastName?.trim() ?? ''
  const joined = `${first} ${last}`.trim()
  return joined.length > 0 ? joined : UNNAMED_LABEL
}

function resolveGroupKey(order: IOrderListItem): { key: string; userId: string | null } {
  const raw = order.userId
  if (raw === null || raw === undefined || raw === '') {
    return { key: UNASSIGNED_KEY, userId: null }
  }
  return { key: raw, userId: raw }
}

/**
 * Groups a flat list of orders by customer and emits a flat sequence of rows
 * (separator → cards) suitable for `v-for` in the admin orders view.
 *
 * Pure derivation; the returned `computed` recomputes whenever `orders` changes.
 *
 * Semantics:
 * - Group key is `order.userId`; orders with null/empty userId fall into the
 *   synthetic `unassigned` group rendered LAST.
 * - Within a group, orders are sorted by `createdAt` desc.
 * - Groups are sorted by their most-recent order's `createdAt` desc, except
 *   the `unassigned` group which is always pinned to the end.
 * - Single-order groups still emit a separator (visual consistency).
 * - `orderCount` reflects what is currently loaded in `orders`; as more pages
 *   of the same customer arrive, it grows ("X de N dentro del filtro").
 */
export function useGroupedOrders(orders: Ref<IOrderListItem[]>): ComputedRef<IOrderGroupRow[]> {
  return computed<IOrderGroupRow[]>(() => {
    const grouped = orders.value.reduce<Map<string, IGroupAccumulator>>((acc, order) => {
      const { key, userId } = resolveGroupKey(order)
      const existing = acc.get(key)
      if (existing) {
        existing.items.push(order)
        return acc
      }
      acc.set(key, {
        key,
        userId,
        label: userId === null ? UNASSIGNED_LABEL : resolveCustomerLabel(order),
        phone: order.customerPrimaryPhone ?? null,
        items: [order],
      })
      return acc
    }, new Map<string, IGroupAccumulator>())

    const sortedGroups = Array.from(grouped.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      }))
      .sort((a, b) => {
        const aUnassigned = a.userId === null
        const bUnassigned = b.userId === null
        if (aUnassigned && !bUnassigned) return 1
        if (!aUnassigned && bUnassigned) return -1
        const aMostRecent = a.items[0]!.createdAt.getTime()
        const bMostRecent = b.items[0]!.createdAt.getTime()
        return bMostRecent - aMostRecent
      })

    return sortedGroups.flatMap<IOrderGroupRow>((group) => {
      const total = group.items.length
      const separator: IOrderGroupSeparatorRow = {
        type: 'separator',
        key: `sep:${group.key}`,
        customerLabel: group.label,
        customerPhone: group.phone,
        orderCount: total,
      }
      const cards = group.items.map<IOrderGroupCardRow>((order, index) => ({
        type: 'card',
        key: `card:${order.id}`,
        order,
        positionInGroup: index + 1,
        totalInGroup: total,
        isLatestForCustomer: index === 0,
      }))
      return [separator, ...cards]
    })
  })
}
