import {
  MISSING_SUMMARY,
  NEW_DATA_SUMMARY,
  NO_PAYOUT_METHOD_LEFT,
  UNVERIFIED_SUFFIX,
} from '../constants/configuration-item.constants'
import type {
  ConfigurationItemId,
  ConfigurationItemState,
  PayoutItemId,
} from '../types/configuration-item.types'
import type {
  IEventConfigurationPresetResponse,
  IEventConfigurationResponse,
} from '../types/responses/event-configuration.response'
import { isPayoutItem, otherPayoutId } from './configuration-draft.utils'

export interface IItemBuilderContext {
  preset: IEventConfigurationPresetResponse | undefined
  current: IEventConfigurationResponse | undefined
  profileValues: Record<ConfigurationItemId, string | null>
  hasProfileValues: Record<ConfigurationItemId, boolean>
  currentValues: Record<ConfigurationItemId, string | null>
  hasCurrentValues: Record<ConfigurationItemId, boolean>
  currentPayoutIsFromProfile: Record<ConfigurationItemId, boolean>
  currentMatchesProfile: Record<ConfigurationItemId, boolean>
  useProfileFlags: Record<ConfigurationItemId, boolean>
  removedPayoutFlags: Record<PayoutItemId, boolean>
  isReady: (id: ConfigurationItemId) => boolean
  payoutTargetExists: (id: PayoutItemId) => boolean
}

export function resolveProfileLabel(
  id: ConfigurationItemId,
  profileValues: Record<ConfigurationItemId, string | null>,
  preset: IEventConfigurationPresetResponse | undefined,
): string {
  const value = profileValues[id] ?? ''
  if (id === 'whatsapp' && value !== '' && preset?.whatsappPendingVerification) {
    return `${value}${UNVERIFIED_SUFFIX}`
  }
  return value
}

export function resolveItemSummary(
  id: ConfigurationItemId,
  state: ConfigurationItemState,
  profileLabel: string,
  currentValues: Record<ConfigurationItemId, string | null>,
  hasCurrent: boolean,
): string {
  if (state === 'missing') return MISSING_SUMMARY
  if (state === 'profile') return profileLabel
  if (hasCurrent) return currentValues[id] ?? NEW_DATA_SUMMARY
  return NEW_DATA_SUMMARY
}

export function resolveRemoveDisabledReason(
  id: PayoutItemId,
  removedPayoutFlags: Record<PayoutItemId, boolean>,
  payoutTargetExists: (targetId: PayoutItemId) => boolean,
): string | null {
  if (removedPayoutFlags[id]) return null
  const other = otherPayoutId(id)
  const otherActive = payoutTargetExists(other) && !removedPayoutFlags[other]
  return otherActive ? null : NO_PAYOUT_METHOD_LEFT
}

export function resolveItemState(
  id: ConfigurationItemId,
  ctx: IItemBuilderContext,
): ConfigurationItemState {
  if (isPayoutItem(id) && ctx.removedPayoutFlags[id]) return 'missing'
  if (!ctx.current) {
    if (ctx.hasProfileValues[id] && ctx.useProfileFlags[id]) return 'profile'
    if (!ctx.hasProfileValues[id] && !ctx.isReady(id)) return 'missing'
    return 'new'
  }
  if (!ctx.hasCurrentValues[id]) return 'missing'
  const matchesProfile = isPayoutItem(id)
    ? ctx.currentPayoutIsFromProfile[id]
    : ctx.currentMatchesProfile[id]
  return matchesProfile ? 'profile' : 'new'
}
