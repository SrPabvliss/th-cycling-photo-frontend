import { differenceInCalendarDays } from 'date-fns'

import { formatDate, parseDateOnly } from '@/shared/utils/date.utils'
import type { IOrganizerContract } from '../../../types/responses/organizer-detail.response'
import type { IOrganizerEvent } from '../../../types/responses/organizer-event.response'
import type { OrganizerState } from '../../../types/responses/organizer-list.response'

export function formatCount(value: number): string {
  return value.toLocaleString('de-DE')
}

export function perLabel(value: number | null): string {
  return value == null ? 'Sin límite' : formatCount(value)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function getTone(state: OrganizerState): 'red' | 'amber' | 'green' {
  if (state === 'no_quota') return 'red'
  if (state === 'expiring') return 'amber'
  return 'green'
}

export function contractState(contract: IOrganizerContract): 'revocado' | 'vigente' | 'vencido' {
  if (contract.isRevoked) return 'revocado'
  return contract.isValid ? 'vigente' : 'vencido'
}

export function contractStateLabel(contract: IOrganizerContract): string {
  const state = contractState(contract)
  if (state === 'revocado') return 'Revocado'
  if (state === 'vigente') return 'Vigente'
  return 'Vencido'
}

export function contractBarPercent(contract: IOrganizerContract): number {
  return contract.eventsTotal ? Math.round((contract.eventsUsed / contract.eventsTotal) * 100) : 100
}

export function contractLossLabel(contract: IOrganizerContract): string | null {
  if (contract.lostSlots <= 0) return null
  const n = contract.lostSlots
  return `${n} cupo${n === 1 ? '' : 's'} perdido${n === 1 ? '' : 's'} al vencer el ${formatDate(parseDateOnly(contract.validUntil))}`
}

export function contractDaysToExpiry(contract: IOrganizerContract): number {
  return differenceInCalendarDays(parseDateOnly(contract.validUntil), new Date())
}

export function eventPhotoLabel(event: IOrganizerEvent): string {
  if (event.photoQuota == null) return `${formatCount(event.photosUploaded)} fotos · sin límite`
  return `${formatCount(event.photosUploaded)} de ${formatCount(event.photoQuota)} fotos`
}

export function eventDatesLabel(event: IOrganizerEvent): string {
  return `${formatDate(parseDateOnly(event.startDate))} — ${formatDate(parseDateOnly(event.endDate))}`
}
