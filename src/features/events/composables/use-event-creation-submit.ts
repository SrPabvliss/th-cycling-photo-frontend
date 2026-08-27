import { computed, ref } from 'vue'

import { useUploadAssetsBatch } from '@/features/event-assets/composables/mutations/use-upload-assets-batch'
import { useAssignPhotoCategoriesBatch } from '@/features/photo-categories/composables/mutations/use-assign-photo-categories-batch'
import { useConfirmWatermark } from '@/features/tenant-profile/composables/mutations/use-confirm-watermark'
import { useCreatePayoutMethod } from '@/features/tenant-profile/composables/mutations/use-create-payout-method'
import { useUpdateTenantProfile } from '@/features/tenant-profile/composables/mutations/use-update-tenant-profile'
import {
  CREATING_STEPS,
  NO_SLOT_KEY,
  PAYOUT_FAILED_MESSAGE,
  PAYOUT_ITEM_IDS,
  WRONG_PASSWORD_KEY,
  WRONG_PASSWORD_MESSAGE,
} from '../constants/event-creation.constants'
import { toCreateEventRequest } from '../mappers/event-form.mapper'
import type {
  ConfigurationItemId,
  IConfigurationItem,
} from '../types/configuration-item.types'
import type { IEventCreationSubmitContext, ISavedPayoutMethod } from '../types/event-creation.types'
import type { IEventFormData, IEventFormExtra } from '../types/event-form.types'
import type { IConfirmationResourceState } from '../types/event-wizard.types'
import type { IEventConfigurationSelectionRequest } from '../types/requests/event-configuration.request'
import {
  hasMessageKey,
  PayoutCreationError,
  payoutFingerprint,
  readErrorMessage,
} from '../utils/payout-creation.utils'
import { createCategoriesResource, uploadCoverResource } from './event-creation-assets'
import { createProfilePayoutMethods, saveBrandToProfile } from './event-creation-profile'
import { useCreateEvent } from './mutations/use-create-event'

export { WRONG_PASSWORD_MESSAGE, PAYOUT_FAILED_MESSAGE, CREATING_STEPS }
export type { IEventCreationSubmitContext }

export function useEventCreationSubmit(context: IEventCreationSubmitContext) {
  const { mutateAsync: createPayoutMethod } = useCreatePayoutMethod()
  const { mutateAsync: updateTenantProfile } = useUpdateTenantProfile()
  const { mutateAsync: confirmWatermark } = useConfirmWatermark()
  const { mutateAsync: createEvent } = useCreateEvent()
  const { mutateAsync: uploadAssets } = useUploadAssetsBatch()
  const { mutateAsync: assignCategories } = useAssignPhotoCategoriesBatch()

  const submission = ref<{ form: IEventFormData; extra: IEventFormExtra } | null>(null)
  const savedPayoutIds = ref<Partial<Record<ConfigurationItemId, ISavedPayoutMethod>>>({})
  const createdPayoutLabels = ref<string[]>([])

  const isSubmitting = ref(false)
  const payoutError = ref<string | null>(null)
  const isPasswordOpen = ref(false)
  const isPasswordPending = ref(false)
  const passwordError = ref<string | null>(null)
  const passwordLabels = ref<string[]>([])

  const creatingStep = ref<number | null>(null)
  const isNoSlotOpen = ref(false)

  const createdEventId = ref<string | null>(null)
  const createdEventSlug = ref<string | null>(null)
  const coverImage = ref<IConfirmationResourceState>({ status: 'skipped' })
  const categories = ref<IConfirmationResourceState>({ status: 'skipped' })
  const profileSave = ref<IConfirmationResourceState>({ status: 'skipped' })

  const isCreatingOpen = computed(() => creatingStep.value !== null)
  const isCreated = computed(() => createdEventId.value !== null)

  function payoutItemsToSave(): IConfigurationItem[] {
    return context
      .items()
      .filter(
        (item) =>
          PAYOUT_ITEM_IDS.includes(item.id) &&
          !item.useProfile &&
          item.saveToProfile &&
          savedPayoutIds.value[item.id]?.fingerprint !== payoutFingerprint(item),
      )
  }

  function brandItemsToSave(): ConfigurationItemId[] {
    return context
      .items()
      .filter(
        (item) => !PAYOUT_ITEM_IDS.includes(item.id) && !item.useProfile && item.saveToProfile,
      )
      .map((item) => item.id)
  }

  function savedIdFor(id: ConfigurationItemId): string | undefined {
    const saved = savedPayoutIds.value[id]
    const item = context.items().find((entry) => entry.id === id)
    if (!saved || !item) return undefined
    return saved.fingerprint === payoutFingerprint(item) ? saved.id : undefined
  }

  function effectiveSelection(): IEventConfigurationSelectionRequest {
    const selection = context.toSelection()
    const idByProvider: Record<'payphone' | 'bank_transfer', string | undefined> = {
      payphone: savedIdFor('payphone'),
      bank_transfer: savedIdFor('bankTransfer'),
    }

    return {
      ...selection,
      payoutMethods: selection.payoutMethods?.map((entry) => {
        if (entry.source !== 'new') return entry
        const savedId = idByProvider[entry.provider]
        return savedId === undefined ? entry : { source: 'profile' as const, id: savedId }
      }),
    }
  }

  async function runFromBrandPhase(): Promise<void> {
    await saveBrandToProfile({
      marked: brandItemsToSave(),
      selection: context.toSelection(),
      updateTenantProfile,
      confirmWatermark,
      profileSave,
    })
    await createEventAndAssets()
  }

  async function createEventAndAssets(): Promise<void> {
    const pending = submission.value
    if (!pending) return

    creatingStep.value = 0

    const created = await createEvent(
      toCreateEventRequest(pending.form, effectiveSelection()),
    ).catch((caught: unknown) => {
      creatingStep.value = null
      if (hasMessageKey(caught, NO_SLOT_KEY)) isNoSlotOpen.value = true
      return null
    })

    if (created === null) return
    createdEventId.value = created.id
    createdEventSlug.value = created.slug

    await uploadCoverResource({
      extra: pending.extra,
      eventId: created.id,
      uploadAssets,
      coverImage,
      creatingStep,
    })
    await createCategoriesResource({
      extra: pending.extra,
      eventId: created.id,
      context,
      assignCategories,
      categories,
      creatingStep,
    })
    creatingStep.value = null
  }

  async function submit(form: IEventFormData, extra: IEventFormExtra): Promise<void> {
    if (isSubmitting.value) return

    isSubmitting.value = true
    payoutError.value = null
    submission.value = { form, extra }

    const pendingPayouts = payoutItemsToSave()
    if (pendingPayouts.length === 0) {
      await runFromBrandPhase()
      isSubmitting.value = false
      return
    }

    passwordError.value = null
    passwordLabels.value = pendingPayouts.map((item) => item.label)
    isPasswordOpen.value = true
  }

  async function confirmPassword(password: string): Promise<void> {
    isPasswordPending.value = true
    passwordError.value = null

    try {
      await createProfilePayoutMethods({
        items: payoutItemsToSave(),
        password,
        createPayoutMethod,
        savedPayoutIds,
        createdPayoutLabels,
      })
      isPasswordOpen.value = false
      await runFromBrandPhase()
      isSubmitting.value = false
    } catch (caught) {
      if (!(caught instanceof PayoutCreationError)) {
        isSubmitting.value = false
        throw caught
      }

      if (hasMessageKey(caught.reason, WRONG_PASSWORD_KEY)) {
        passwordError.value = WRONG_PASSWORD_MESSAGE
        passwordLabels.value = payoutItemsToSave().map((item) => item.label)
        return
      }

      isPasswordOpen.value = false
      isSubmitting.value = false
      payoutError.value = readErrorMessage(caught.reason)
      context.openItem(caught.itemId)
      context.goToConfiguration()
    } finally {
      isPasswordPending.value = false
    }
  }

  function cancelPassword(): void {
    isPasswordOpen.value = false
    passwordError.value = null
    isSubmitting.value = false
  }

  function closeNoSlot(): void {
    isNoSlotOpen.value = false
  }

  function reset(): void {
    submission.value = null
    savedPayoutIds.value = {}
    createdPayoutLabels.value = []
    isSubmitting.value = false
    payoutError.value = null
    isPasswordOpen.value = false
    isPasswordPending.value = false
    passwordError.value = null
    passwordLabels.value = []
    creatingStep.value = null
    isNoSlotOpen.value = false
    createdEventId.value = null
    createdEventSlug.value = null
    coverImage.value = { status: 'skipped' }
    categories.value = { status: 'skipped' }
    profileSave.value = { status: 'skipped' }
  }

  async function retry(target: 'coverImage' | 'categories'): Promise<void> {
    const pending = submission.value
    const eventId = createdEventId.value
    if (!pending || !eventId) return

    if (target === 'coverImage') {
      await uploadCoverResource({
        extra: pending.extra,
        eventId,
        uploadAssets,
        coverImage,
        creatingStep,
      })
    } else {
      await createCategoriesResource({
        extra: pending.extra,
        eventId,
        context,
        assignCategories,
        categories,
        creatingStep,
      })
    }
    creatingStep.value = null
  }

  return {
    isSubmitting,
    payoutError,
    isPasswordOpen,
    isPasswordPending,
    passwordError,
    passwordLabels,
    creatingStep,
    isCreatingOpen,
    isNoSlotOpen,
    createdPayoutLabels,
    createdEventId,
    createdEventSlug,
    isCreated,
    coverImage,
    categories,
    profileSave,
    submit,
    confirmPassword,
    cancelPassword,
    closeNoSlot,
    retry,
    reset,
  }
}
