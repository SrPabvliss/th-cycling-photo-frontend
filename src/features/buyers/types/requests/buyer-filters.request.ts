export const BUYER_PURCHASE_FILTERS = ['all', 'bought', 'never', 'recurrent'] as const
export type BuyerPurchaseFilter = (typeof BUYER_PURCHASE_FILTERS)[number]

export const BUYER_SORTS = ['recent', 'spent', 'orders', 'last_purchase'] as const
export type BuyerSort = (typeof BUYER_SORTS)[number]

export const BUYER_GENDERS = ['female', 'male', 'other', 'prefer_not_to_say'] as const
export type BuyerGender = (typeof BUYER_GENDERS)[number]

/** Reactive filter state shared by the tabs, the filter bar, the filter sheet and the chips */
export interface IBuyerFilters {
  search: string | null
  purchase: BuyerPurchaseFilter
  countryId: number | null
  provinceId: number | null
  registeredFrom: string | null
  registeredTo: string | null
  gender: BuyerGender | null
  ageFrom: number | null
  ageTo: number | null
  emailVerified: boolean | null
  hasWhatsapp: boolean | null
  sort: BuyerSort
}

/** Same builder for GET /buyers and GET /buyers/stats — they must share the exact filter set */
export function toBuyerFiltersParams(filters: IBuyerFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {
    purchase: filters.purchase,
    sort: filters.sort,
  }

  if (filters.search) params.search = filters.search
  if (filters.countryId != null) params.countryId = filters.countryId
  if (filters.provinceId != null) params.provinceId = filters.provinceId
  if (filters.registeredFrom) params.registeredFrom = filters.registeredFrom
  if (filters.registeredTo) params.registeredTo = filters.registeredTo
  if (filters.gender) params.gender = filters.gender
  if (filters.ageFrom != null) params.ageFrom = filters.ageFrom
  if (filters.ageTo != null) params.ageTo = filters.ageTo
  if (filters.emailVerified != null) params.emailVerified = filters.emailVerified
  if (filters.hasWhatsapp != null) params.hasWhatsapp = filters.hasWhatsapp

  return params
}
