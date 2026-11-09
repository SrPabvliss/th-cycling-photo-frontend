import type { IOrderListItem } from './responses/order-list.response'

export interface IOrderCustomerGroup {
  key: string
  name: string
  phone: string | null
  isUnassigned: boolean
  orders: IOrderListItem[]
}
