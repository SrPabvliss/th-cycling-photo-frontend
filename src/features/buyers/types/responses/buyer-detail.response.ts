import type { PaymentMethod } from '@/shared/types/payment-method.types'
import type { OrderStatus } from '@/shared/types/order-status.types'
import type { BuyerGender } from '../requests/buyer-filters.request'

export interface IApiBuyerOrder {
  id: string
  eventName: string
  date: string
  photoCount: number
  /** Decimal-formatted, kept as a string end to end */
  amount: string
  paymentMethod: PaymentMethod | null
  status: OrderStatus
}

export interface IBuyerOrder {
  id: string
  eventName: string
  date: Date
  photoCount: number
  /** Decimal-formatted, kept as a string end to end */
  amount: string
  paymentMethod: PaymentMethod | null
  status: OrderStatus
}

export interface IApiBuyerConsent {
  type: string
  /** Date-shaped as stored, e.g. 2026-08-16 — never a semantic version */
  policyVersion: string
  acceptedAt: string
}

export interface IBuyerConsent {
  type: string
  /** Date-shaped as stored, e.g. 2026-08-16 — never a semantic version */
  policyVersion: string
  acceptedAt: Date
}

/** API projection from GET /buyers/:id */
export interface IApiBuyerDetail {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  emailVerified: boolean
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  primaryPhone: string | null
  isWhatsapp: boolean
  countryName: string | null
  provinceName: string | null
  cityName: string | null
  birthDate: string | null
  gender: BuyerGender | null
  orderCount: number
  /** Decimal-formatted, kept as a string end to end */
  spent: string
  /** Decimal-formatted, kept as a string end to end */
  averageTicket: string
  photoCount: number
  eventCount: number
  eventNames: string[]
  firstOrderAt: string | null
  lastOrderAt: string | null
  unpaidCount: number
  orders: IApiBuyerOrder[]
  consents: IApiBuyerConsent[]
}

export interface IBuyerDetail {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  emailVerified: boolean
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date | null
  primaryPhone: string | null
  isWhatsapp: boolean
  countryName: string | null
  provinceName: string | null
  cityName: string | null
  birthDate: Date | null
  gender: BuyerGender | null
  orderCount: number
  /** Decimal-formatted, kept as a string end to end */
  spent: string
  /** Decimal-formatted, kept as a string end to end */
  averageTicket: string
  photoCount: number
  eventCount: number
  eventNames: string[]
  firstOrderAt: Date | null
  lastOrderAt: Date | null
  unpaidCount: number
  orders: IBuyerOrder[]
  consents: IBuyerConsent[]
}
