/** API projection from GET /buyers */
export interface IApiBuyerListItem {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  primaryPhone: string | null
  isWhatsapp: boolean
  countryName: string | null
  orderCount: number
  lastOrderAt: string | null
  createdAt: string
}

export interface IBuyerListItem {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  primaryPhone: string | null
  isWhatsapp: boolean
  countryName: string | null
  orderCount: number
  lastOrderAt: Date | null
  createdAt: Date
}
