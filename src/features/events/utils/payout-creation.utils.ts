import { isAxiosError } from 'axios'
import type { CreatePayoutMethodRequest } from '@/features/tenant-profile/types/requests/payout-method.request'
import type { PayoutMethodAccountType } from '@/features/tenant-profile/types/responses/payout-method.response'
import { PAYOUT_FAILED_MESSAGE } from '../constants/event-creation.constants'
import type {
  ConfigurationItemId,
  IBankTransferDraft,
  IConfigurationItem,
  IPayphoneDraft,
} from '../types/configuration-item.types'

export class PayoutCreationError extends Error {
  constructor(
    readonly itemId: ConfigurationItemId,
    readonly reason: unknown,
  ) {
    super('payout_creation_failed')
  }
}

export function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join('')
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`
}

export function hasMessageKey(caught: unknown, key: string): boolean {
  if (!isAxiosError(caught)) return false
  return caught.response?.data?.error?.messageKey === key
}

export function readErrorMessage(caught: unknown): string {
  if (!isAxiosError(caught)) return PAYOUT_FAILED_MESSAGE
  return caught.response?.data?.error?.message ?? PAYOUT_FAILED_MESSAGE
}

export function payoutFingerprint(item: IConfigurationItem): string {
  if (item.id === 'payphone') {
    const draft = item.draft as IPayphoneDraft
    return draft.phone.trim()
  }

  const draft = item.draft as IBankTransferDraft
  return [
    draft.bankName,
    draft.accountNumber,
    draft.accountType,
    draft.accountHolder,
    draft.holderIdentification,
  ]
    .map((value) => value.trim())
    .join('|')
}

export function toPayoutRequest(
  item: IConfigurationItem,
  password: string,
): CreatePayoutMethodRequest {
  if (item.id === 'payphone') {
    const draft = item.draft as IPayphoneDraft
    return { provider: 'payphone', phone: draft.phone.trim(), password }
  }

  const draft = item.draft as IBankTransferDraft
  return {
    provider: 'bank_transfer',
    bankName: draft.bankName.trim(),
    accountNumber: draft.accountNumber.trim(),
    accountType: draft.accountType.trim() as PayoutMethodAccountType,
    accountHolder: draft.accountHolder.trim(),
    holderIdentification: draft.holderIdentification.trim(),
    password,
  }
}
