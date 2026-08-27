import type { IBuyerFilters } from '../types/requests/buyer-filters.request'
import {
  DEFAULT_BUYER_PURCHASE,
  GENDER_LABELS,
  PURCHASE_LABELS,
} from '../constants/buyer-filters.constants'

export interface IBuyerFilterChip {
  id: string
  label: string
  clear: () => void
}

function registeredRangeLabel(from: string | null, to: string | null): string {
  if (from && to) return `Registro: ${from} – ${to}`
  if (from) return `Registro desde ${from}`
  return `Registro hasta ${to}`
}

function ageRangeLabel(from: number | null, to: number | null): string {
  if (from != null && to != null) return `Edad: ${from}–${to} años`
  if (from != null) return `Edad desde ${from} años`
  return `Edad hasta ${to} años`
}

export function buildBuyerFilterChips(
  filters: IBuyerFilters,
  onReset: <K extends keyof IBuyerFilters>(key: K, value: IBuyerFilters[K]) => void,
): IBuyerFilterChip[] {
  const chips: IBuyerFilterChip[] = []

  if (filters.purchase !== DEFAULT_BUYER_PURCHASE) {
    chips.push({
      id: 'purchase',
      label: PURCHASE_LABELS[filters.purchase],
      clear: () => onReset('purchase', DEFAULT_BUYER_PURCHASE),
    })
  }

  if (filters.search) {
    chips.push({
      id: 'search',
      label: `Búsqueda: "${filters.search}"`,
      clear: () => onReset('search', ''),
    })
  }

  if (filters.countryId != null) {
    chips.push({
      id: 'countryId',
      label: 'País seleccionado',
      clear: () => onReset('countryId', null),
    })
  }

  if (filters.provinceId != null) {
    chips.push({
      id: 'provinceId',
      label: 'Provincia seleccionada',
      clear: () => onReset('provinceId', null),
    })
  }

  if (filters.registeredFrom || filters.registeredTo) {
    chips.push({
      id: 'registered',
      label: registeredRangeLabel(filters.registeredFrom, filters.registeredTo),
      clear: () => {
        onReset('registeredFrom', null)
        onReset('registeredTo', null)
      },
    })
  }

  if (filters.gender) {
    chips.push({
      id: 'gender',
      label: GENDER_LABELS[filters.gender],
      clear: () => onReset('gender', null),
    })
  }

  if (filters.ageFrom != null || filters.ageTo != null) {
    chips.push({
      id: 'age',
      label: ageRangeLabel(filters.ageFrom, filters.ageTo),
      clear: () => {
        onReset('ageFrom', null)
        onReset('ageTo', null)
      },
    })
  }

  if (filters.emailVerified != null) {
    chips.push({
      id: 'emailVerified',
      label: filters.emailVerified ? 'Correo verificado' : 'Correo sin verificar',
      clear: () => onReset('emailVerified', null),
    })
  }

  if (filters.hasWhatsapp != null) {
    chips.push({
      id: 'hasWhatsapp',
      label: filters.hasWhatsapp ? 'Tiene WhatsApp' : 'Sin WhatsApp',
      clear: () => onReset('hasWhatsapp', null),
    })
  }

  return chips
}
