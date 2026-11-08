import { computed, reactive, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import { isPhoneValid } from '@/shared/utils/phone.utils'
import {
  isValidAccountHolder,
  isValidAccountNumber,
  isValidBankName,
  isValidHolderIdentification,
  isValidPublicName,
} from '@/shared/utils/payout.validation'
import {
  CONFIGURATION_ITEMS,
  LOCKED_MISSING_SUMMARY,
  MISSING_SUMMARY,
  NEW_DATA_SUMMARY,
  NO_PAYOUT_METHOD_LEFT,
  REQUIRED_CONFIGURATION_COUNT,
  UNVERIFIED_SUFFIX,
} from '../constants/configuration-item.constants'
import {
  buildFullConfigurationSelection,
  buildPartialConfigurationSelection,
} from '../mappers/configuration-selection.mapper'
import type {
  ConfigurationItemId,
  ConfigurationItemIcon,
  ConfigurationItemState,
  IBankTransferDraft,
  IConfigurationDraft,
  IConfigurationItem,
  IDrafts,
  IPayphoneDraft,
  IPublicNameDraft,
  IWatermarkDraft,
  IWhatsappDraft,
  PayoutItemId,
  PayphoneVerificationState,
} from '../types/configuration-item.types'
import type {
  IEventConfigurationSelectionRequest,
  IEventPayoutSelection,
} from '../types/requests/event-configuration.request'
import type {
  IEventConfigurationPresetResponse,
  IEventConfigurationResponse,
} from '../types/responses/event-configuration.response'
import { createDrafts, invalidWhenFilled, isPayoutItem } from '../utils/configuration-draft.utils'
import {
  resolveItemState,
  resolveItemSummary,
  resolveProfileLabel,
  resolveRemoveDisabledReason,
} from '../utils/configuration-item-builder.utils'
import {
  buildCurrentMatchesProfile,
  buildCurrentPayoutIsFromProfile,
  buildCurrentValues,
  buildHasCurrentValues,
  buildHasProfileValues,
  buildProfileValues,
} from '../utils/configuration-item-values.utils'
import {
  bankTransferTargetFromState,
  buildDraftCompletion,
  createSeededNonPayoutDrafts,
  createSeededPayoutDrafts,
  isNonPayoutUnchanged as isNonPayoutUnchangedState,
  isPayoutUnchanged as isPayoutUnchangedState,
  payphoneTargetFromState,
  seedDraftsFromCurrent,
} from '../utils/configuration-payout-draft.utils'

export type {
  ConfigurationItemId,
  PayoutItemId,
  ConfigurationItemState,
  ConfigurationItemIcon,
  PayphoneVerificationState,
  IPublicNameDraft,
  IWatermarkDraft,
  IWhatsappDraft,
  IPayphoneDraft,
  IBankTransferDraft,
  IConfigurationDraft,
  IConfigurationItem,
}

export {
  CONFIGURATION_ITEMS,
  LOCKED_MISSING_SUMMARY,
  MISSING_SUMMARY,
  NEW_DATA_SUMMARY,
  UNVERIFIED_SUFFIX,
  NO_PAYOUT_METHOD_LEFT,
}

export interface IConfigurationItemsOptions {
  /**
   * Whether the viewer may load a payout method that is not on the profile (`source: 'new'`).
   * The backend asks `tenant.payout_method.manage` for it, so without it a payout item only offers
   * the profile's method or keeping the one the event already has.
   */
  canEnterNewPayout?: Ref<boolean>
}

export function useConfigurationItems(
  preset: Ref<IEventConfigurationPresetResponse | undefined>,
  current?: Ref<IEventConfigurationResponse | undefined>,
  options: IConfigurationItemsOptions = {},
) {
  const canEnterNewPayout = computed(() => options.canEnterNewPayout?.value ?? true)
  const drafts = reactive<IDrafts>(createDrafts())
  const useProfileFlags = reactive<Record<ConfigurationItemId, boolean>>({
    publicName: false,
    watermark: false,
    whatsapp: false,
    payphone: false,
    bankTransfer: false,
  })
  const seededUseProfileFlags: Record<ConfigurationItemId, boolean> = {
    publicName: false,
    watermark: false,
    whatsapp: false,
    payphone: false,
    bankTransfer: false,
  }
  const saveToProfileFlags = reactive<Record<ConfigurationItemId, boolean>>({
    publicName: true,
    watermark: true,
    whatsapp: true,
    payphone: true,
    bankTransfer: true,
  })
  const removedPayoutFlags = reactive<Record<PayoutItemId, boolean>>({
    payphone: false,
    bankTransfer: false,
  })
  const openIds = ref<ConfigurationItemId[]>([])
  const isInitialised = ref(false)
  const seededEventPayoutDrafts = createSeededPayoutDrafts()
  const seededNonPayoutDrafts = createSeededNonPayoutDrafts()

  const profileValues = computed(() => buildProfileValues(preset.value))
  const hasProfileValues = computed(() => buildHasProfileValues(preset.value, profileValues.value))
  const currentValues = computed(() => buildCurrentValues(current?.value))
  const hasCurrentValues = computed(() =>
    buildHasCurrentValues(current?.value, currentValues.value),
  )
  const currentPayoutIsFromProfile = computed(() => buildCurrentPayoutIsFromProfile(current?.value))
  const currentMatchesProfile = computed(() =>
    buildCurrentMatchesProfile(
      current?.value,
      preset.value,
      currentValues.value,
      profileValues.value,
    ),
  )
  const draftCompletion = computed(() => buildDraftCompletion(drafts))

  function isPayoutUnchanged(id: PayoutItemId): boolean {
    return isPayoutUnchangedState(
      id,
      drafts,
      useProfileFlags,
      seededUseProfileFlags,
      removedPayoutFlags,
      seededEventPayoutDrafts,
    )
  }

  function isNonPayoutUnchanged(id: 'publicName' | 'watermark' | 'whatsapp'): boolean {
    return isNonPayoutUnchangedState(
      id,
      drafts,
      useProfileFlags,
      seededUseProfileFlags,
      seededNonPayoutDrafts,
    )
  }

  function isReady(id: ConfigurationItemId): boolean {
    if (isPayoutItem(id) && removedPayoutFlags[id]) return false
    if (useProfileFlags[id]) return hasProfileValues.value[id]
    if (isPayoutItem(id) && !canEnterNewPayout.value) return keepsCurrentPayout(id)
    return draftCompletion.value[id]
  }

  /** The event already has this payout method and its draft still holds it untouched. */
  function keepsCurrentPayout(id: PayoutItemId): boolean {
    const target = id === 'payphone' ? payphoneTarget() : bankTransferTarget()
    return target?.source === 'event'
  }

  function payphoneTarget() {
    return payphoneTargetFromState({
      drafts,
      preset: preset.value,
      current: current?.value,
      useProfile: useProfileFlags.payphone,
      seeded: seededEventPayoutDrafts,
    })
  }

  function bankTransferTarget() {
    return bankTransferTargetFromState({
      drafts,
      preset: preset.value,
      current: current?.value,
      useProfile: useProfileFlags.bankTransfer,
      draftComplete: draftCompletion.value.bankTransfer,
      seeded: seededEventPayoutDrafts,
    })
  }

  /** Never sends a method the viewer is not allowed to load, whatever the drafts hold. */
  function allowedSelection(target: IEventPayoutSelection | null): IEventPayoutSelection | null {
    if (target?.source === 'new' && !canEnterNewPayout.value) return null
    return target
  }

  function payphoneSelection() {
    return removedPayoutFlags.payphone ? null : allowedSelection(payphoneTarget())
  }

  function bankTransferSelection() {
    return removedPayoutFlags.bankTransfer ? null : allowedSelection(bankTransferTarget())
  }

  function payoutTargetExists(id: PayoutItemId): boolean {
    return id === 'payphone' ? payphoneTarget() !== null : bankTransferTarget() !== null
  }

  watch(
    [preset, () => current?.value],
    ([presetValue, currentValue]) => {
      if (!presetValue || isInitialised.value) return
      if (current && !currentValue) return

      const hasProfile = hasProfileValues.value
      const hasCurrent = hasCurrentValues.value

      if (currentValue) {
        seedDraftsFromCurrent(drafts, currentValue, seededEventPayoutDrafts, seededNonPayoutDrafts)
      }

      removedPayoutFlags.payphone = false
      removedPayoutFlags.bankTransfer = false

      CONFIGURATION_ITEMS.forEach((definition) => {
        if (currentValue) {
          useProfileFlags[definition.id] = isPayoutItem(definition.id)
            ? false
            : !hasCurrent[definition.id] && hasProfile[definition.id]
          saveToProfileFlags[definition.id] = false
        } else {
          useProfileFlags[definition.id] = hasProfile[definition.id]
          saveToProfileFlags[definition.id] =
            !hasProfile[definition.id] && (canEnterNewPayout.value || !isPayoutItem(definition.id))
        }
        seededUseProfileFlags[definition.id] = useProfileFlags[definition.id]
      })

      openIds.value = CONFIGURATION_ITEMS.filter((definition) => !isReady(definition.id)).map(
        (definition) => definition.id,
      )
      isInitialised.value = true
    },
    { immediate: true },
  )

  function reseed() {
    isInitialised.value = false
  }

  const items: ComputedRef<IConfigurationItem[]> = computed(() =>
    CONFIGURATION_ITEMS.map((definition) => {
      const state = resolveItemState(definition.id, {
        preset: preset.value,
        current: current?.value,
        profileValues: profileValues.value,
        hasProfileValues: hasProfileValues.value,
        currentValues: currentValues.value,
        hasCurrentValues: hasCurrentValues.value,
        currentPayoutIsFromProfile: currentPayoutIsFromProfile.value,
        currentMatchesProfile: currentMatchesProfile.value,
        useProfileFlags,
        removedPayoutFlags,
        isReady,
        payoutTargetExists,
      })
      const removable = isPayoutItem(definition.id) && payoutTargetExists(definition.id)
      const profileLabel = resolveProfileLabel(definition.id, profileValues.value, preset.value)
      return {
        ...definition,
        state,
        hasProfileValue: hasProfileValues.value[definition.id],
        profileValue: profileValues.value[definition.id],
        profileLabel,
        summary:
          state === 'missing' && isPayoutItem(definition.id) && !canEnterNewPayout.value
            ? LOCKED_MISSING_SUMMARY
            : resolveItemSummary(
                definition.id,
                state,
                profileLabel,
                currentValues.value,
                Boolean(current?.value),
                saveToProfileFlags[definition.id],
              ),
        isReady: isReady(definition.id),
        isOpen: openIds.value.includes(definition.id),
        useProfile: useProfileFlags[definition.id],
        saveToProfile: saveToProfileFlags[definition.id],
        isRemovable: removable,
        isRemoved: isPayoutItem(definition.id) ? removedPayoutFlags[definition.id] : false,
        removeDisabledReason: isPayoutItem(definition.id)
          ? resolveRemoveDisabledReason(definition.id, removedPayoutFlags, payoutTargetExists)
          : null,
        allowsNewData: !isPayoutItem(definition.id) || canEnterNewPayout.value,
        currentLabel: hasCurrentValues.value[definition.id]
          ? currentValues.value[definition.id]
          : null,
        draft: drafts[definition.id],
      }
    }),
  )

  const requirementsMet = computed(() => [
    isReady('publicName'),
    isReady('whatsapp'),
    isReady('payphone') || isReady('bankTransfer'),
  ])
  const readyCount = computed(() => requirementsMet.value.filter(Boolean).length)
  const totalCount = REQUIRED_CONFIGURATION_COUNT

  const watermarkPreviewUrl = computed<string | null>(() => {
    if (useProfileFlags.watermark) return preset.value?.watermarkUrl ?? null
    const stored = current?.value
    if (stored?.watermarkStorageKey && drafts.watermark.storageKey === stored.watermarkStorageKey) {
      return stored.watermarkUrl ?? null
    }
    return null
  })

  const itemsSavedToProfile = computed<ConfigurationItemId[]>(() =>
    items.value.filter((item) => !item.useProfile && item.saveToProfile).map((item) => item.id),
  )

  function toggle(id: ConfigurationItemId) {
    openIds.value = openIds.value.includes(id)
      ? openIds.value.filter((openId) => openId !== id)
      : [...openIds.value, id]
  }

  function setUseProfile(id: ConfigurationItemId, value: boolean) {
    useProfileFlags[id] = value
  }

  function setSaveToProfile(id: ConfigurationItemId, value: boolean) {
    saveToProfileFlags[id] = value
  }

  function setPayoutRemoved(id: PayoutItemId, value: boolean) {
    removedPayoutFlags[id] = value
  }

  function patchDraft<K extends ConfigurationItemId>(id: K, patch: Partial<IDrafts[K]>) {
    Object.assign(drafts[id], patch)
  }

  const hasActivePayoutMethod = computed(
    () => payphoneSelection() !== null || bankTransferSelection() !== null,
  )

  function isFieldInvalid(id: ConfigurationItemId): boolean {
    if (useProfileFlags[id]) return false
    if (isPayoutItem(id)) {
      if (removedPayoutFlags[id]) return false
      if (isPayoutUnchanged(id)) return false
      if (id === 'payphone') {
        const phone = drafts.payphone.phone
        if (phone.trim() === '') return false
        if (!isPhoneValid(phone)) return true
        return drafts.payphone.verification !== 'verified'
      }
      const bank = drafts.bankTransfer
      return (
        invalidWhenFilled(bank.bankName, isValidBankName) ||
        invalidWhenFilled(bank.accountNumber, isValidAccountNumber) ||
        invalidWhenFilled(bank.accountHolder, isValidAccountHolder) ||
        invalidWhenFilled(bank.holderIdentification, isValidHolderIdentification)
      )
    }
    if (isNonPayoutUnchanged(id)) return false
    if (id === 'publicName') return invalidWhenFilled(drafts.publicName.value, isValidPublicName)
    if (id === 'whatsapp') return invalidWhenFilled(drafts.whatsapp.value, isPhoneValid)
    return false
  }

  const hasInvalidField = computed(() =>
    CONFIGURATION_ITEMS.some((definition) => isFieldInvalid(definition.id)),
  )

  function isClearingStoredValue(id: 'publicName' | 'whatsapp'): boolean {
    return hasCurrentValues.value[id] && !isReady(id)
  }

  const canSave = computed(
    () =>
      !isClearingStoredValue('publicName') &&
      !isClearingStoredValue('whatsapp') &&
      hasActivePayoutMethod.value &&
      !hasInvalidField.value,
  )
  const isComplete = computed(
    () => readyCount.value === REQUIRED_CONFIGURATION_COUNT && !hasInvalidField.value,
  )

  function toSelection(): IEventConfigurationSelectionRequest {
    const selectionContext = {
      preset: preset.value,
      drafts,
      useProfileFlags,
      payphoneSelection,
      bankTransferSelection,
      isNonPayoutUnchanged,
      isPayoutUnchanged,
    }
    return current
      ? buildPartialConfigurationSelection(selectionContext)
      : buildFullConfigurationSelection(selectionContext)
  }

  return {
    items,
    drafts,
    readyCount,
    isComplete,
    canSave,
    itemsSavedToProfile,
    watermarkPreviewUrl,
    totalCount,
    toggle,
    setUseProfile,
    setSaveToProfile,
    setPayoutRemoved,
    patchDraft,
    toSelection,
    reseed,
  }
}
