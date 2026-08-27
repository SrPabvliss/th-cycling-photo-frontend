import { isValidPublicName } from '@/shared/utils/payout.validation'
import { isPhoneValid } from '@/shared/utils/phone.utils'
import type {
  ConfigurationItemId,
  IDrafts,
  PayoutItemId,
} from '../types/configuration-item.types'
import type {
  IEventConfigurationSelectionRequest,
  IEventPayoutSelection,
} from '../types/requests/event-configuration.request'
import type { IEventConfigurationPresetResponse } from '../types/responses/event-configuration.response'
import { usablePublicName } from '../utils/configuration-draft.utils'

export interface ISelectionContext {
  preset: IEventConfigurationPresetResponse | undefined
  drafts: IDrafts
  useProfileFlags: Record<ConfigurationItemId, boolean>
  payphoneSelection: () => IEventPayoutSelection | null
  bankTransferSelection: () => IEventPayoutSelection | null
  isNonPayoutUnchanged: (id: 'publicName' | 'watermark' | 'whatsapp') => boolean
  isPayoutUnchanged: (id: PayoutItemId) => boolean
}

export function buildFullConfigurationSelection(
  ctx: ISelectionContext,
): IEventConfigurationSelectionRequest {
  const value = ctx.preset
  const publicName = ctx.useProfileFlags.publicName
    ? usablePublicName(value?.publicName)
    : isValidPublicName(ctx.drafts.publicName.value)
      ? ctx.drafts.publicName.value.trim()
      : null
  const watermarkStorageKey = ctx.useProfileFlags.watermark
    ? (value?.watermarkStorageKey ?? null)
    : ctx.drafts.watermark.storageKey
  const whatsappNumber = ctx.useProfileFlags.whatsapp
    ? (value?.whatsappNumber ?? null)
    : isPhoneValid(ctx.drafts.whatsapp.value)
      ? ctx.drafts.whatsapp.value.trim()
      : null

  const payoutMethods = [ctx.payphoneSelection(), ctx.bankTransferSelection()].filter(
    (selection): selection is IEventPayoutSelection => selection !== null,
  )

  return { publicName, watermarkStorageKey, whatsappNumber, payoutMethods }
}

export function buildPartialConfigurationSelection(
  ctx: ISelectionContext,
): IEventConfigurationSelectionRequest {
  const value = ctx.preset
  const selection: IEventConfigurationSelectionRequest = {}

  if (!ctx.isNonPayoutUnchanged('publicName')) {
    selection.publicName = ctx.useProfileFlags.publicName
      ? usablePublicName(value?.publicName)
      : isValidPublicName(ctx.drafts.publicName.value)
        ? ctx.drafts.publicName.value.trim()
        : null
  }

  if (!ctx.isNonPayoutUnchanged('watermark')) {
    selection.watermarkStorageKey = ctx.useProfileFlags.watermark
      ? (value?.watermarkStorageKey ?? null)
      : ctx.drafts.watermark.storageKey
  }

  if (!ctx.isNonPayoutUnchanged('whatsapp')) {
    selection.whatsappNumber = ctx.useProfileFlags.whatsapp
      ? (value?.whatsappNumber ?? null)
      : isPhoneValid(ctx.drafts.whatsapp.value)
        ? ctx.drafts.whatsapp.value.trim()
        : null
  }

  if (!ctx.isPayoutUnchanged('payphone') || !ctx.isPayoutUnchanged('bankTransfer')) {
    selection.payoutMethods = [ctx.payphoneSelection(), ctx.bankTransferSelection()].filter(
      (candidate): candidate is IEventPayoutSelection => candidate !== null,
    )
  }

  return selection
}
