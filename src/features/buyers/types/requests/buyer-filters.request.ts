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

/** Every filter GET /buyers/stats honours — all of them but the purchase tab and the sort */
export type IBuyersStatsScope = Omit<IBuyerFilters, 'purchase' | 'sort'>

export function toBuyersStatsParams(scope: IBuyersStatsScope): Record<string, unknown> {
  const params: Record<string, unknown> = {}

  if (scope.search) params.search = scope.search
  if (scope.countryId != null) params.countryId = scope.countryId
  if (scope.provinceId != null) params.provinceId = scope.provinceId
  if (scope.registeredFrom) params.registeredFrom = scope.registeredFrom
  if (scope.registeredTo) params.registeredTo = scope.registeredTo
  if (scope.gender) params.gender = scope.gender
  if (scope.ageFrom != null) params.ageFrom = scope.ageFrom
  if (scope.ageTo != null) params.ageTo = scope.ageTo
  if (scope.emailVerified != null) params.emailVerified = scope.emailVerified
  if (scope.hasWhatsapp != null) params.hasWhatsapp = scope.hasWhatsapp

  return params
}

/** GET /buyers takes the stats scope plus the purchase tab and the sort */
export function toBuyerFiltersParams(filters: IBuyerFilters): Record<string, unknown> {
  return {
    purchase: filters.purchase,
    sort: filters.sort,
    ...toBuyersStatsParams(filters),
  }
}
