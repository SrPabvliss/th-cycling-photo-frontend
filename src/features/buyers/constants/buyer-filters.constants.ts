import type {
  BuyerGender,
  BuyerPurchaseFilter,
  BuyerSort,
  IBuyerFilters,
} from '../types/requests/buyer-filters.request'

export const DEFAULT_BUYER_PURCHASE: BuyerPurchaseFilter = 'all'
export const DEFAULT_BUYER_SORT: BuyerSort = 'recent'

export const DEFAULT_BUYER_FILTERS: IBuyerFilters = {
  search: null,
  purchase: DEFAULT_BUYER_PURCHASE,
  countryId: null,
  provinceId: null,
  registeredFrom: null,
  registeredTo: null,
  gender: null,
  ageFrom: null,
  ageTo: null,
  emailVerified: null,
  hasWhatsapp: null,
  sort: DEFAULT_BUYER_SORT,
}

export const PURCHASE_LABELS: Record<BuyerPurchaseFilter, string> = {
  all: 'Todos',
  bought: 'Compraron',
  never: 'Nunca compraron',
  recurrent: 'Recurrentes',
}

export const GENDER_LABELS: Record<BuyerGender, string> = {
  female: 'Femenino',
  male: 'Masculino',
  other: 'Otro',
  prefer_not_to_say: 'Prefiere no decirlo',
}

export const SORT_LABELS: Record<BuyerSort, string> = {
  recent: 'Más recientes',
  spent: 'Mayor gasto',
  orders: 'Más pedidos',
  last_purchase: 'Última compra',
}
