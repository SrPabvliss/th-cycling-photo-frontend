import type { BuyerGender } from '../requests/buyer-filters.request'

/** API projection from GET /buyers */
export interface IApiBuyerListItem {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  emailVerified: boolean
  primaryPhone: string | null
  isWhatsapp: boolean
  isActive: boolean
  lastLoginAt: string | null
  countryName: string | null
  provinceName: string | null
  cityName: string | null
  birthDate: string | null
  gender: BuyerGender | null
  orderCount: number
  /** Decimal-formatted, kept as a string end to end */
  spent: string
  photoCount: number
  eventCount: number
  eventNames: string[]
  firstOrderAt: string | null
  lastOrderAt: string | null
  unpaidCount: number
  createdAt: string
}

export interface IBuyerListItem {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  emailVerified: boolean
  primaryPhone: string | null
  isWhatsapp: boolean
  isActive: boolean
  lastLoginAt: Date | null
  countryName: string | null
  provinceName: string | null
  cityName: string | null
  birthDate: Date | null
  gender: BuyerGender | null
  orderCount: number
  /** Decimal-formatted, kept as a string end to end */
  spent: string
  photoCount: number
  eventCount: number
  eventNames: string[]
  firstOrderAt: Date | null
  lastOrderAt: Date | null
  unpaidCount: number
  createdAt: Date
}
