import { isPhoneValid } from '@/shared/utils/phone.utils'
import {
  isValidAccountHolder,
  isValidAccountNumber,
  isValidAccountType,
  isValidBankName,
  isValidHolderIdentification,
  isValidPublicName,
} from '@/shared/utils/payout.validation'
import { findCurrentMethod, findMethod, toE164Phone, watermarkFileName } from './configuration-draft.utils'
import type {
  ConfigurationItemId,
  IBankTransferDraft,
  IDrafts,
  IPayphoneDraft,
  PayoutItemId,
} from '../types/configuration-item.types'
import type { IEventPayoutSelection } from '../types/requests/event-configuration.request'
import type {
  IEventConfigurationPresetResponse,
  IEventConfigurationResponse,
} from '../types/responses/event-configuration.response'

export interface ISeededPayoutDrafts {
  payphone: IPayphoneDraft | null
  bankTransfer: IBankTransferDraft | null
}

export interface ISeededNonPayoutDrafts {
  publicName: string
  watermark: string | null
  whatsapp: string
}

export function createSeededPayoutDrafts(): ISeededPayoutDrafts {
  return { payphone: null, bankTransfer: null }
}

export function createSeededNonPayoutDrafts(): ISeededNonPayoutDrafts {
  return { publicName: '', watermark: null, whatsapp: '' }
}

export function seedDraftsFromCurrent(
  drafts: IDrafts,
  value: IEventConfigurationResponse,
  seededEventPayoutDrafts: ISeededPayoutDrafts,
  seededNonPayoutDrafts: ISeededNonPayoutDrafts,
): void {
  drafts.publicName.value = value.publicName ?? ''
  drafts.watermark.storageKey = value.watermarkStorageKey ?? null
  drafts.watermark.fileName = watermarkFileName(value.watermarkStorageKey ?? null)
  drafts.whatsapp.value = value.whatsappNumber ?? ''

  seededNonPayoutDrafts.publicName = drafts.publicName.value
  seededNonPayoutDrafts.watermark = drafts.watermark.storageKey
  seededNonPayoutDrafts.whatsapp = drafts.whatsapp.value

  const payphone = findCurrentMethod(value, 'payphone')
  drafts.payphone.phone = toE164Phone(payphone?.receiverIdentifier)
  drafts.payphone.verification = payphone ? 'verified' : 'idle'
  seededEventPayoutDrafts.payphone = payphone
    ? { phone: drafts.payphone.phone, verification: drafts.payphone.verification }
    : null

  const bank = findCurrentMethod(value, 'bank_transfer')
  drafts.bankTransfer.bankName = bank?.bankName ?? ''
  drafts.bankTransfer.accountNumber = bank?.accountNumber ?? ''
  drafts.bankTransfer.accountType = bank?.accountType ?? ''
  drafts.bankTransfer.accountHolder = bank?.accountHolder ?? ''
  drafts.bankTransfer.holderIdentification = bank?.holderIdentification ?? ''
  seededEventPayoutDrafts.bankTransfer = bank
    ? {
        bankName: drafts.bankTransfer.bankName,
        accountNumber: drafts.bankTransfer.accountNumber,
        accountType: drafts.bankTransfer.accountType,
        accountHolder: drafts.bankTransfer.accountHolder,
        holderIdentification: drafts.bankTransfer.holderIdentification,
      }
    : null
}

export function isPayphoneDraftUntouched(
  drafts: IDrafts,
  seeded: ISeededPayoutDrafts,
): boolean {
  const seededPayphone = seeded.payphone
  return seededPayphone !== null && drafts.payphone.phone === seededPayphone.phone
}

export function isBankTransferDraftUntouched(
  drafts: IDrafts,
  seeded: ISeededPayoutDrafts,
): boolean {
  const seededBank = seeded.bankTransfer
  return (
    seededBank !== null &&
    drafts.bankTransfer.bankName === seededBank.bankName &&
    drafts.bankTransfer.accountNumber === seededBank.accountNumber &&
    drafts.bankTransfer.accountType === seededBank.accountType &&
    drafts.bankTransfer.accountHolder === seededBank.accountHolder &&
    drafts.bankTransfer.holderIdentification === seededBank.holderIdentification
  )
}

export function isBankTransferDraftEmpty(drafts: IDrafts): boolean {
  return (
    drafts.bankTransfer.bankName.trim() === '' &&
    drafts.bankTransfer.accountNumber.trim() === '' &&
    drafts.bankTransfer.accountType.trim() === '' &&
    drafts.bankTransfer.accountHolder.trim() === '' &&
    drafts.bankTransfer.holderIdentification.trim() === ''
  )
}

export function isPayoutUnchanged(
  id: PayoutItemId,
  drafts: IDrafts,
  useProfileFlags: Record<ConfigurationItemId, boolean>,
  seededUseProfileFlags: Record<ConfigurationItemId, boolean>,
  removedPayoutFlags: Record<PayoutItemId, boolean>,
  seededEventPayoutDrafts: ISeededPayoutDrafts,
): boolean {
  if (removedPayoutFlags[id]) return false
  if (useProfileFlags[id] !== seededUseProfileFlags[id]) return false
  if (useProfileFlags[id]) return true
  if (id === 'payphone') {
    const seeded = seededEventPayoutDrafts.payphone
    return seeded === null
      ? drafts.payphone.phone.trim() === ''
      : isPayphoneDraftUntouched(drafts, seededEventPayoutDrafts)
  }
  const seededBank = seededEventPayoutDrafts.bankTransfer
  return seededBank === null
    ? isBankTransferDraftEmpty(drafts)
    : isBankTransferDraftUntouched(drafts, seededEventPayoutDrafts)
}

export function isNonPayoutUnchanged(
  id: 'publicName' | 'watermark' | 'whatsapp',
  drafts: IDrafts,
  useProfileFlags: Record<ConfigurationItemId, boolean>,
  seededUseProfileFlags: Record<ConfigurationItemId, boolean>,
  seededNonPayoutDrafts: ISeededNonPayoutDrafts,
): boolean {
  if (useProfileFlags[id] !== seededUseProfileFlags[id]) return false
  if (useProfileFlags[id]) return true
  if (id === 'publicName') return drafts.publicName.value === seededNonPayoutDrafts.publicName
  if (id === 'watermark') return drafts.watermark.storageKey === seededNonPayoutDrafts.watermark
  return drafts.whatsapp.value === seededNonPayoutDrafts.whatsapp
}

export function buildDraftCompletion(drafts: IDrafts): Record<ConfigurationItemId, boolean> {
  return {
    publicName: isValidPublicName(drafts.publicName.value),
    watermark: drafts.watermark.storageKey !== null,
    whatsapp: isPhoneValid(drafts.whatsapp.value),
    payphone: isPhoneValid(drafts.payphone.phone) && drafts.payphone.verification === 'verified',
    bankTransfer:
      isValidBankName(drafts.bankTransfer.bankName) &&
      isValidAccountNumber(drafts.bankTransfer.accountNumber) &&
      isValidAccountType(drafts.bankTransfer.accountType) &&
      isValidAccountHolder(drafts.bankTransfer.accountHolder) &&
      isValidHolderIdentification(drafts.bankTransfer.holderIdentification),
  }
}

export function payphoneTargetFromState(params: {
  drafts: IDrafts
  preset: IEventConfigurationPresetResponse | undefined
  current: IEventConfigurationResponse | undefined
  useProfile: boolean
  seeded: ISeededPayoutDrafts
}): IEventPayoutSelection | null {
  const { drafts, preset, current, useProfile, seeded } = params
  if (useProfile) {
    const method = findMethod(preset, 'payphone')
    return method ? { source: 'profile', id: method.id } : null
  }
  const eventMethod = findCurrentMethod(current, 'payphone')
  if (eventMethod && isPayphoneDraftUntouched(drafts, seeded)) {
    return { source: 'event', id: eventMethod.id }
  }
  const phone = drafts.payphone.phone.trim()
  return isPhoneValid(phone) ? { source: 'new', provider: 'payphone', phone } : null
}

export function bankTransferTargetFromState(params: {
  drafts: IDrafts
  preset: IEventConfigurationPresetResponse | undefined
  current: IEventConfigurationResponse | undefined
  useProfile: boolean
  draftComplete: boolean
  seeded: ISeededPayoutDrafts
}): IEventPayoutSelection | null {
  const { drafts, preset, current, useProfile, draftComplete, seeded } = params
  if (useProfile) {
    const method = findMethod(preset, 'bank_transfer')
    return method ? { source: 'profile', id: method.id } : null
  }
  const eventMethod = findCurrentMethod(current, 'bank_transfer')
  if (eventMethod && isBankTransferDraftUntouched(drafts, seeded)) {
    return { source: 'event', id: eventMethod.id }
  }
  if (!draftComplete) return null
  return {
    source: 'new',
    provider: 'bank_transfer',
    bankName: drafts.bankTransfer.bankName.trim(),
    accountNumber: drafts.bankTransfer.accountNumber.trim(),
    accountType: drafts.bankTransfer.accountType.trim(),
    accountHolder: drafts.bankTransfer.accountHolder.trim(),
    holderIdentification: drafts.bankTransfer.holderIdentification.trim(),
  }
}
