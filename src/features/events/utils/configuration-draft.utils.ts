import type { PayoutMethodResponse } from '@/features/tenant-profile/types/responses/payout-method.response'
import { isValidPublicName } from '@/shared/utils/payout.validation'
import { EC_CALLING_CODE } from '../constants/configuration-item.constants'
import type {
  ConfigurationItemId,
  IDrafts,
  PayoutItemId,
} from '../types/configuration-item.types'
import type {
  IEventConfigurationPresetResponse,
  IEventConfigurationResponse,
  IEventPayoutMethodResponse,
} from '../types/responses/event-configuration.response'

export function createDrafts(): IDrafts {
  return {
    publicName: { value: '' },
    watermark: { storageKey: null, fileName: null },
    whatsapp: { value: '' },
    payphone: { phone: '', verification: 'idle' },
    bankTransfer: {
      bankName: '',
      accountNumber: '',
      accountType: '',
      accountHolder: '',
      holderIdentification: '',
    },
  }
}

export function toE164Phone(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim()
  if (trimmed === '') return ''
  return trimmed.startsWith('+') ? trimmed : `${EC_CALLING_CODE}${trimmed}`
}

export function findMethod(
  preset: IEventConfigurationPresetResponse | undefined,
  provider: PayoutMethodResponse['provider'],
): PayoutMethodResponse | null {
  return preset?.availablePayoutMethods.find((method) => method.provider === provider) ?? null
}

export function findCurrentMethod(
  current: IEventConfigurationResponse | undefined,
  provider: PayoutMethodResponse['provider'],
): IEventPayoutMethodResponse | null {
  const method = current?.payoutMethods.find((candidate) => candidate.provider === provider)
  return method && method.isActive ? method : null
}

export function isPayoutItem(id: ConfigurationItemId): id is PayoutItemId {
  return id === 'payphone' || id === 'bankTransfer'
}

export function otherPayoutId(id: PayoutItemId): PayoutItemId {
  return id === 'payphone' ? 'bankTransfer' : 'payphone'
}

export function watermarkFileName(storageKey: string | null): string | null {
  if (!storageKey) return null
  const segments = storageKey.split('/')
  return segments[segments.length - 1] ?? storageKey
}

export function isFilled(value: string): boolean {
  return value.trim().length > 0
}

export function presentText(value: string | null | undefined): string | null {
  return value !== null && value !== undefined && isFilled(value) ? value : null
}

export function usablePublicName(value: string | null | undefined): string | null {
  const present = presentText(value)
  return present !== null && isValidPublicName(present) ? present : null
}

export function invalidWhenFilled(value: string, isValid: (candidate: string) => boolean): boolean {
  return value.trim() !== '' && !isValid(value)
}
