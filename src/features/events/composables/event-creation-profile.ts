import type { Ref } from 'vue'

import { PROFILE_LABELS } from '../constants/event-creation.constants'
import type {
  ConfigurationItemId,
  IConfigurationItem,
} from '../types/configuration-item.types'
import type { ISavedPayoutMethod } from '../types/event-creation.types'
import type { IConfirmationResourceState } from '../types/event-wizard.types'
import type { IEventConfigurationSelectionRequest } from '../types/requests/event-configuration.request'
import {
  joinLabels,
  PayoutCreationError,
  payoutFingerprint,
  toPayoutRequest,
} from '../utils/payout-creation.utils'

type CreatePayoutMethod = (
  request: ReturnType<typeof toPayoutRequest>,
) => Promise<{ id: string }>
type UpdateTenantProfile = (patch: Record<string, unknown>) => Promise<unknown>
type ConfirmWatermark = (key: string) => Promise<unknown>

export async function createProfilePayoutMethods(params: {
  items: IConfigurationItem[]
  password: string
  createPayoutMethod: CreatePayoutMethod
  savedPayoutIds: Ref<Partial<Record<ConfigurationItemId, ISavedPayoutMethod>>>
  createdPayoutLabels: Ref<string[]>
}): Promise<void> {
  const { items, password, createPayoutMethod, savedPayoutIds, createdPayoutLabels } = params

  await items.reduce(
    (chain, item) =>
      chain.then(async () => {
        const created = await createPayoutMethod(toPayoutRequest(item, password)).catch(
          (reason: unknown) => {
            throw new PayoutCreationError(item.id, reason)
          },
        )
        savedPayoutIds.value = {
          ...savedPayoutIds.value,
          [item.id]: { id: created.id, fingerprint: payoutFingerprint(item) },
        }
        createdPayoutLabels.value = [...createdPayoutLabels.value, item.label]
      }),
    Promise.resolve(),
  )
}

export async function saveBrandToProfile(params: {
  marked: ConfigurationItemId[]
  selection: IEventConfigurationSelectionRequest
  updateTenantProfile: UpdateTenantProfile
  confirmWatermark: ConfirmWatermark
  profileSave: Ref<IConfirmationResourceState>
}): Promise<void> {
  const { marked, selection, updateTenantProfile, confirmWatermark, profileSave } = params

  const patchLabels = marked
    .filter((id): id is 'publicName' | 'whatsapp' => id === 'publicName' || id === 'whatsapp')
    .map((id) => PROFILE_LABELS[id])
  const watermarkKey =
    marked.includes('watermark') && selection.watermarkStorageKey
      ? selection.watermarkStorageKey
      : null

  if (patchLabels.length === 0 && watermarkKey === null) {
    profileSave.value = { status: 'skipped' }
    return
  }

  const profilePatch = {
    ...(marked.includes('publicName') ? { publicName: selection.publicName } : {}),
    ...(marked.includes('whatsapp') ? { whatsappNumber: selection.whatsappNumber } : {}),
  }

  const patchFailed =
    patchLabels.length > 0 &&
    (await updateTenantProfile(profilePatch).then(
      () => false,
      () => true,
    ))

  const watermarkFailed =
    watermarkKey !== null &&
    (await confirmWatermark(watermarkKey).then(
      () => false,
      () => true,
    ))

  const failed = [
    ...(patchFailed ? patchLabels : []),
    ...(watermarkFailed ? [PROFILE_LABELS.watermark] : []),
  ]
  const saved = [
    ...(patchFailed ? [] : patchLabels),
    ...(watermarkKey !== null && !watermarkFailed ? [PROFILE_LABELS.watermark] : []),
  ]

  profileSave.value =
    failed.length > 0
      ? { status: 'bad', detail: joinLabels(failed) }
      : { status: 'ok', detail: joinLabels(saved) }
}
